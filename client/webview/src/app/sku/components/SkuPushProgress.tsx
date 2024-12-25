'use client'
import React, { useState, useEffect } from 'react';
import { Progress, Table, message, Tag } from 'antd';
import type { TableColumnsType } from 'antd';

import type { PublishResult } from "./SkuPushConfirm";
import { MbSkuApi } from '@eleapi/door/sku/mb.sku';
import { Sku } from "@model/sku/sku";
import { SkuPublishStatitic } from "@model/sku/skuTask";

interface SkuPushInfo {
  id?: number;
  name?: string;
  url?: string;
  status?: number;
  detail?: string;
}

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
      const color = record.status === 1 ? 'green' : 'red';
      const text = record.status === 1 ? '成功' : '失败';
      return <Tag color={color}>
        {text}
      </Tag>
    }
  },
  {
    title: '详情',
    dataIndex: 'detail',
    key: 'detail',
    align: 'center',
  },
];

export interface SkuUrl {
  url: string;
}

interface SkuPushProgressProps {
  publishResourceId: number;
  urls: SkuUrl[];
  onPublishFinish: (finish: boolean) => void;
  setPublishResult: (result: PublishResult) => void;
}

const mbSkuApi = new MbSkuApi();

const SkuPushProgress: React.FC<SkuPushProgressProps> = (props) => {

  const [data, setData] = useState<SkuPushInfo[]>([]);
  const [pushCount, setPushCount] = useState(0);

  const onPublishSkuMessage: (sku: Sku, statistic: SkuPublishStatitic) => void = (sku: Sku, statistic: SkuPublishStatitic) => {
    console.log("onPublishSkuMessage: ", sku, statistic);

    let detail = "商品发布成功";
    if (sku.status === "error"){
      detail = "商品发布失败";
    }

    let status = 1;
    if (sku.status === "error"){
      status = 0;
    }

    const skuInfo = {
      id: sku.id,
      name: sku.name,
      url: sku.url,
      status: status,
      detail: detail,
    }

    setData((prevData) => [...prevData, skuInfo]);
    setPushCount(prevCount => prevCount + 1);

    if (statistic.status === "done") {
      props.onPublishFinish(true);
      props.setPublishResult({count: statistic.totalNum, successCount: statistic.successNum, errorCount: statistic.errorNum});
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
      mbSkuApi.batchPublishSkus(props.publishResourceId, urls).then(task => {
        console.log(task);
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
        <p style={{ margin: '5px 0' }}>已处理：{pushCount}/{props.urls.length}</p>
        <Progress percent={pushCount / props.urls.length * 100} />
        <div style={{ height: 250, overflow: 'auto' }}>
          <Table<SkuPushInfo>
            rowKey="id"
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