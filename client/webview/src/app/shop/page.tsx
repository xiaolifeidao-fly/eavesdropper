'use client'
import { useRef } from 'react';
import { Button, message, Popconfirm, Tooltip } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';

import useRefreshPage from '@/components/RefreshPage';
import {
  getShopPage as getShopPageApi,
  deleteShop as deleteShopApi
} from '@api/shop/shop.api';
import { ShopPageReq, ShopPageResp } from '@model/shop/shop';

type DataType = {
  id: number;
  account: string;
  name: string;
  remark: string;
}

function shopPageRespConvertDataType(resp: ShopPageResp[]): DataType[] {
  const data: DataType[] = []
  for (const item of resp) {
    data.push(item)
  }
  return data
}

export default function ShopManage() {
  const actionRef = useRef<ActionType>();
  const { refreshPage } = useRefreshPage();

  const baseColumns: ProColumns<DataType>[] = [
    {
      title: '资源账号',
      dataIndex: 'account',
      align: 'center',
      width: 150,
    },
    {
      title: '店铺名称',
      dataIndex: 'name',
      search: false,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      width: 200,
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
  ]

  const deleteConfirm = async (id: number) => {
    await deleteShopApi(id);
    message.success('删除成功');
    refreshPage(actionRef, true, 1);
  };

  const columns: ProColumns<DataType>[] = [
    ...baseColumns,
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      align: 'center',
      width: 50,
      render: (_, record) => [
        <Button key="sync" type="link" style={{ paddingRight: 0 }} onClick={() => {
          message.success('同步');
        }}>同步</Button>,
        <Popconfirm key="deleteConfirm" title="确定要删除吗？" onConfirm={async () => await deleteConfirm(record.id)}>
          <Button key="delete" type="link" danger style={{ paddingLeft: 0 }}>删除</Button>
        </Popconfirm>
      ],
    }
  ]

  return (
    <Layout curActive='/shop'>
      <ProTable<DataType>
        rowKey="id"
        headerTitle="店铺管理"
        columns={columns}
        actionRef={actionRef}
        options={false}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={() => {
            message.success('一键同步');
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
    </Layout>
  )
}