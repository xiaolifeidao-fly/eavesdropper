'use client'
import React, { useState, useEffect } from 'react';
import { Progress, Table, message, Tag, Button, Popover } from 'antd';
import type { TableColumnsType } from 'antd';

import { SkuPublishResult } from "@model/sku/sku";
import { SkuPublishStatitic, SkuPublishConfig, SkuTaskOperationType } from "@model/sku/skuTask";
import { SkuStatus } from "@model/sku/sku";
import { SkuTask, SkuTaskStatus } from "@model/sku/skuTask";
import { TaskApi } from '@eleapi/door/task/task';

interface SkuPushInfo {
  key?: number;
  id?: number;
  name?: string;
  url?: string;
  status?: number;
  detail?: string;
}

enum SkuPushStatus {
  SUCCESS = 1,
  ERROR = 0,
  EXISTENCE = 2,
}

export interface SkuUrl {
  url: string;
}

interface SkuPushProgressProps {
  operationType: string;
  publishStatus: boolean;
  publishResourceId: number;
  publishConfig: SkuPublishConfig;
  skuSource: string;
  urls: SkuUrl[];
  onPublishFinish: (finish: boolean) => void;
  setTaskId: (taskId: number) => void;
  taskId?: number;
}

interface OnPublishSkuMessageParam {
  sku: SkuPublishResult | undefined, 
  statistic: SkuPublishStatitic
}

const ProgressTitle: React.FC<{ skuPushStatus: SkuTaskStatus | undefined }> = ({ skuPushStatus }) => {
  let title = '正在发布商品,请稍等...'
  if (skuPushStatus === undefined) {
    title = '正在发布商品,请稍等...'
  } else if (skuPushStatus === SkuTaskStatus.DONE) {
    title = '商品发布完成'
  } else if (skuPushStatus === SkuTaskStatus.ERROR) {
    title = '商品发布失败'
  }
  return <p style={{ margin: '5px 0' }}>{title}</p>
}

const SkuPushProgress: React.FC<SkuPushProgressProps> = (props) => {

  const [data, setData] = useState<SkuPushInfo[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [skuPushStatus, setPushStatus] = useState<SkuTaskStatus|undefined>(undefined)
  const [urlsCount, setUrlsCount] = useState(0);

  const columns: TableColumnsType<SkuPushInfo> = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        switch (record.status) {
          case SkuPushStatus.SUCCESS:
            return <Tag color="green">成功</Tag>
          case SkuPushStatus.ERROR:
            return <Tag color="red">失败</Tag>
          case SkuPushStatus.EXISTENCE:
            return <Tag color="blue">已存在</Tag>
        }
        // const color = record.status === SkuPushStatus.SUCCESS ? 'green' : 'red';
        // const text = record.status === SkuPushStatus.SUCCESS ? '成功' : '失败';
        // return <Tag color={color}>
        //   {text}
        // </Tag>
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (_, record) => {
        return <>
          <Button type="link" onClick={() => { window.open(record.url, '_blank'); }}>
            浏览源商品
          </Button>
          <Popover title="失败原因" content={record.detail} trigger="click">
            <Button type="link" disabled={record.status == SkuPushStatus.SUCCESS}>
              失败原因
            </Button>
          </Popover>
        </>
      }
    },
  ];

  const onPublishSkuMessage: (param: OnPublishSkuMessageParam) => void = (param: OnPublishSkuMessageParam) => {
    console.log("onPublishSkuMessage: ", param);
    const sku = param.sku;
    const statistic = param.statistic;
    if (sku == undefined){
      if (statistic.status == SkuTaskStatus.ERROR){
        setPushStatus(SkuTaskStatus.ERROR)
        message.error(statistic.remark ?? "异常错误");
      } else if (statistic.status == SkuTaskStatus.DONE) {
        setPushStatus(SkuTaskStatus.DONE)
      }
      props.onPublishFinish(true);
      return;
    }

    let status;
    switch (sku.status) {
      case SkuStatus.SUCCESS:
        setSuccessCount(prevCount => prevCount + 1);
        status = SkuPushStatus.SUCCESS;
        break;
      case SkuStatus.EXISTENCE:
        setErrorCount(prevCount => prevCount + 1);
        status = SkuPushStatus.EXISTENCE;
        break;
      default:
        setErrorCount(prevCount => prevCount + 1);
        status = SkuPushStatus.ERROR;
        break;
    }
    const skuInfo = {
      key: sku.key,
      id: sku.id,
      name: sku.name,
      url: sku.url,
      status: status,
      detail: sku.remark,
    }

    setData((prevData) => [skuInfo, ...prevData]);
    setPushCount(prevCount => prevCount + 1);

    if (statistic.status === SkuTaskStatus.DONE) {
      setPushStatus(SkuTaskStatus.DONE)
      props.onPublishFinish(true);
    }
  };

  useEffect(() => {
    if (!props.publishStatus) {
      return;
    }

    if (props.operationType === SkuTaskOperationType.PUSH && (!props.publishStatus || props.urls.length === 0)) {
      console.log('props.operationType: ', props.operationType, 'props.publishStatus: ', props.publishStatus, 'props.urls.length: ', props.urls.length)
      return;
    }

    console.log('loading SkuPushProgress...')
    const callback = (sku : SkuPublishResult | undefined, statistic : SkuPublishStatitic) => {
      onPublishSkuMessage({sku, statistic})
    } 

    const taskApi = new TaskApi();

    // 监听商品发布消息
    taskApi.onPublishSkuMessage(callback).then(() => {
      // 监听任务完成之后批量发布商品
      if (props.operationType === SkuTaskOperationType.PUSH) {
        const urls = props.urls.map(item => item.url);
        setUrlsCount(urls.length);
        taskApi.startTask(props.publishResourceId, props.publishConfig, props.skuSource, urls).then((task?: SkuTask) => {
          if (task) {
            props.setTaskId(task.id as number);
          }
        });
      } else if (props.operationType === SkuTaskOperationType.REPUBLISH) {
        taskApi.republishTask(props.taskId as number).then((task?: SkuTask) => {
          if (task) {
            props.setTaskId(task.id as number);
            setUrlsCount(task.count);
          }
        });
      } else if (props.operationType === SkuTaskOperationType.CONTINUE) {
        taskApi.continueTask(props.taskId as number).then((task?: SkuTask) => {
          if (task) {
            props.setTaskId(task.id as number);
            setUrlsCount(task.count);
          }
        });
      }

    }).catch(error => {
      console.error("onPublishSkuMessage error: ", error);
      message.error("商品发布失败");
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.publishStatus]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ProgressTitle skuPushStatus={skuPushStatus} />
        <p style={{ margin: '5px 0' }}>
          已处理:{pushCount}/{urlsCount}{successCount > 0 && <>,成功数:{successCount}</>}{errorCount > 0 && <>,失败数:{errorCount}</>}
        </p>
        <Progress percent={parseFloat((pushCount / urlsCount * 100).toFixed(2))} />
        <div style={{ height: 250, overflow: 'auto' }}>
          <Table<SkuPushInfo>
            rowKey="key"
            columns={columns}
            dataSource={data}
            pagination={false}
            style={{ width: '100%' }}
            scroll={{ y: 250 }}
          />
        </div>
      </div>
    </>
  )
}



export default SkuPushProgress;