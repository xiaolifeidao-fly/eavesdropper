'use client'
import React, { useState, useEffect } from 'react';
import { Progress, Table, message, Tag, Button, Popover } from 'antd';
import type { TableColumnsType } from 'antd';

import type { PublishResult } from "./SkuPushConfirm";
import { MbSkuApi } from '@eleapi/door/sku/mb.sku';
import { SkuPublishResult } from "@model/sku/sku";
import { SkuPublishStatitic } from "@model/sku/skuTask";
import { SkuStatus } from "@model/sku/sku";
import { SkuTask, SkuTaskStatus } from "@model/sku/skuTask";

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
}

export interface SkuUrl {
  url: string;
}

interface SkuPushProgressProps {
  publishResourceId: number;
  urls: SkuUrl[];
  onPublishFinish: (finish: boolean) => void;
  setTaskId: (taskId: number) => void;
}

const mbSkuApi = new MbSkuApi();

const SkuPushProgress: React.FC<SkuPushProgressProps> = (props) => {

  const [data, setData] = useState<SkuPushInfo[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

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
        const color = record.status === SkuPushStatus.SUCCESS ? 'green' : 'red';
        const text = record.status === SkuPushStatus.SUCCESS ? '成功' : '失败';
        return <Tag color={color}>
          {text}
        </Tag>
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

  const onPublishSkuMessage: (sku: SkuPublishResult | undefined, statistic: SkuPublishStatitic) => void = (sku: SkuPublishResult | undefined, statistic: SkuPublishStatitic) => {
    console.log("onPublishSkuMessage: ", sku, statistic);
    if (sku == undefined){
      if (statistic.status == SkuTaskStatus.ERROR){
        props.onPublishFinish(true);
      }
      message.error("异常错误");
      return;
    }

    let status = SkuPushStatus.ERROR;
    if (sku.status === SkuStatus.SUCCESS) {
      status = SkuPushStatus.SUCCESS;
      setSuccessCount(prevCount => prevCount + 1);
    } else {
      setErrorCount(prevCount => prevCount + 1);
    }

    const skuInfo = {
      key: sku.key,
      id: sku.id,
      name: sku.name,
      url: sku.url,
      status: status,
      detail: sku.remark,
    }

    setData((prevData) => [...prevData, skuInfo]);
    setPushCount(prevCount => prevCount + 1);

    if (statistic.status === SkuTaskStatus.DONE) {
      props.onPublishFinish(true);
    }
  };

  useEffect(() => {
    if (props.urls.length === 0) {
      console.log("uploadUrlList is empty");
      return;
    }

    // 监听商品发布消息
    mbSkuApi.onPublishSkuMessage(onPublishSkuMessage).then(() => {

      const urls = props.urls.map(item => item.url);

      // 监听任务完成之后批量发布商品
      mbSkuApi.batchPublishSkus(props.publishResourceId, urls).then((task?: SkuTask) => {
        console.log("batchPublishSkus task: ", task);
        if (task) {
          props.setTaskId(task.id as number);
        }
      });
    }).catch(error => {
      console.error("onPublishSkuMessage error: ", error);
      message.error("商品发布失败");
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.urls]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ margin: '5px 0' }}>正在发布商品,请稍等...</p>
        <p style={{ margin: '5px 0' }}>
          已处理:{pushCount}/{props.urls.length}{successCount > 0 && <>,成功数:{successCount}</>}{errorCount > 0 && <>,失败数:{errorCount}</>}
        </p>
        <Progress percent={parseFloat((pushCount / props.urls.length * 100).toFixed(2))} />
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