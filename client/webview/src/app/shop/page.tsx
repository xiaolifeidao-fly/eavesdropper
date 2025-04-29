'use client'
import { useRef, useState, useEffect } from 'react';
import { Button, message, Popconfirm, Tooltip, Spin, Space, Tag, Modal, Form, Input } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';

import useRefreshPage from '@/components/RefreshPage';
import {
  getShopPage as getShopPageApi,
  deleteShop as deleteShopApi,
  syncShop as syncShopApi,
  bindShopAuthCode as bindShopAuthCodeApi
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
      title: '过期时间',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
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
    // 一键同步只同步未同步的资源
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
    try {
      const req = new SyncShopReq(resourceId, "", "", 0, ShopStatus.LosEffective);
      const shopApi = new MbShopApi();
      const shopInfo = await shopApi.findMbShopInfo(resourceId);
      if (shopInfo.code) {
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
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const columns: ProColumns<DataType>[] = [
    ...baseColumns,
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      align: 'center',
      width: 50,
      render: (_, record) => {
        return [
          <Button key="sync" type="link" style={{ paddingRight: 0, paddingLeft: 0 }} disabled={record.status.value !== ShopStatus.LosEffective} onClick={async () => {
            openBindAuthModal(record.id);
          }}>绑定激活码</Button>,
          <Button key="sync" type="link" style={{ paddingRight: 0, paddingLeft: 0 }} onClick={async () => {
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
      ]},
    }
  ]

  const [open, setOpen] = useState(false);
  const [bindAuthCodeLoading, setBindAuthCodeLoading] = useState(false);
  const [shopId, setShopId] = useState(0);
  const [form] = Form.useForm();

  const openBindAuthModal = async (shopId: number) => {
    setOpen(true);
    setShopId(shopId);
    form.resetFields(); // 重置表单所有字段
  }

  const bindAuthCode = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch (error) {
      // 忽略验证错误，继续执行
      values = form.getFieldsValue();
    }

    if (!values || !values.authCode) {
      message.error('请输入激活码');
      return;
    }

    setBindAuthCodeLoading(true);
    try {
      const result = await bindShopAuthCodeApi(shopId, values.authCode);
      if (!result) {
        message.error('绑定失败,请联系管理员');
        return
      }
      form.resetFields();
      setOpen(false);
      message.success('绑定成功');
    } catch (error: any) {
      message.error(error.message || '绑定失败,请联系管理员');
    } finally {
      setBindAuthCodeLoading(false);
    }
  }

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

      <Modal title="绑定激活码" open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} footer={null} style={{ height: '400px' }}>
        <Spin spinning={bindAuthCodeLoading} tip={"绑定激活码中..."}>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Form form={form}>
              <Form.Item label="激活码:" name="authCode" required={true} rules={[{ required: true, message: '请输入激活码' }]}>
                <Input placeholder='请输入激活码' />
              </Form.Item>
              <Button onClick={bindAuthCode}>绑定</Button>
            </Form>
          </div>
        </Spin>
      </Modal>      
    </Layout>
  )
}