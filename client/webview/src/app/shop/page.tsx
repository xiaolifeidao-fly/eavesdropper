'use client'
import { useRef, useState } from 'react';
import { Button, message, Popconfirm, Tooltip, Spin, Space, Tag } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';

import useRefreshPage from '@/components/RefreshPage';
import {
  getShopPage as getShopPageApi,
  deleteShop as deleteShopApi,
  syncShop as syncShopApi
} from '@api/shop/shop.api';
import { getSyncResourceList as getSyncResourceListApi } from '@api/resource/resource.api';
import { ShopPageReq, ShopPageResp, SyncShopReq, ShopStatus } from '@model/shop/shop';
import { MbShopApi } from '@eleapi/door/shop/mb.shop';
import { LabelValue } from '@model/base/base';

type DataType = {
  id: number;
  resourceId: number;
  account: string;
  name: string;
  remark: string;
  updatedAt: string;
  status: LabelValue;
}

function shopPageRespConvertDataType(resp: ShopPageResp[]): DataType[] {
  const data: DataType[] = []
  for (const item of resp) {
    data.push(item)
  }
  return data
}

export default function ShopManage() {
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();
  const { refreshPage } = useRefreshPage();

  const baseColumns: ProColumns<DataType>[] = [
    {
      title: '店铺账号',
      dataIndex: 'account',
      key: 'account',
      align: 'center',
      width: 150,
      search: false,
    },
    {
      title: '店铺名称',
      dataIndex: 'name',
      key: 'name',
      search: false,
      width: 200,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
      search: false,
      render: (_, record) => (
        record.remark ? (
          <Tooltip title={record.remark}>
            {record.remark.length > 20 // 假设超过20个字符时缩小展示
              ? `${record.remark.slice(0, 20)}...` // 显示前20个字符并加上省略号
              : record.remark}
          </Tooltip>
        ) : null
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      search: false,
      width: 50,
      render: (_, record) => (
        record.status.value !== '' ?
          <Space>
            <Tag color={record.status.color} key={record.status.value}>
              {record.status.label}
            </Tag>
          </Space> : "-"
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
      width: 200,
      search: false,
    }
  ]

  const deleteConfirm = async (id: number) => {
    await deleteShopApi(id);
    message.success('删除成功');
    refreshPage(actionRef, true, 1);
  };

  const syncAllShop = async () => {
    const resources = await getSyncResourceListApi();
    if (!resources) {
      return false;
    }
    for (const resource of resources) {
      const result = await syncShop(0, resource.id);
      console.log(result);
    }
    return true;
  }

  const syncShop = async (id: number, resourceId: number) => {
    const req = new SyncShopReq(resourceId, "", "", 0, ShopStatus.LosEffective);
    const shopApi = new MbShopApi();
    const shopInfo = await shopApi.findMbShopInfo(resourceId);
    if (shopInfo.code) {
      req.status = ShopStatus.Effective
      const shop = shopInfo.data.result;
      req.account = shop.nick;
      req.name = shop.shopName;
      req.shopId = shop.shopId;
    }    
    const result = await syncShopApi(id, req);
    if (!result) {
      return false;
    }
    return true;
  }

  const columns: ProColumns<DataType>[] = [
    ...baseColumns,
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      align: 'center',
      width: 50,
      render: (_, record) => [
        <Button key="sync" type="link" style={{ paddingRight: 0 }} onClick={async () => {
          setLoading(true);
          const result = await syncShop(record.id, record.resourceId);
          if (!result) {
            setLoading(false);
            message.error('同步失败');
          }
          refreshPage(actionRef, false);
          setLoading(false);
          message.success('同步成功');
        }}>同步</Button>,
        <Popconfirm key="deleteConfirm" title="确定要删除吗？" onConfirm={async () => await deleteConfirm(record.id)}>
          <Button key="delete" type="link" danger style={{ paddingLeft: 0 }}>删除</Button>
        </Popconfirm>
      ],
    }
  ]

  return (
    <Layout curActive='/shop'>
      <Spin spinning={loading} tip="同步中">
        <ProTable<DataType>
          rowKey="id"
          headerTitle="店铺管理"
          columns={columns}
          actionRef={actionRef}
          options={false}
          toolBarRender={() => [
            <Button key="syncAll" type="primary" onClick={async () => {
              setLoading(true);
              const result = await syncAllShop();
              if (!result) {
                setLoading(false);
                message.error('一键同步失败');
              }
              refreshPage(actionRef, false);
              setLoading(false);
              message.success('一键同步成功');
            }}>一键同步</Button>
          ]}
          request={async (params) => {
            const req = new ShopPageReq(params.current ?? 1, params.pageSize ?? 10, params.account ?? '')
            const { data: list, pageInfo } = await getShopPageApi(req)
            const data = shopPageRespConvertDataType(list);
            return {
              data: data,
              success: true,
              total: pageInfo.total,
            };
          }}
          pagination={{
            pageSize: 10,
          }}
        />
      </Spin>
    </Layout>
  )
}