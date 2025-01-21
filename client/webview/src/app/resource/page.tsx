'use client'
import { useRef, useState, useEffect } from 'react';
import { Button, message, Tag, Space, Popconfirm, Tooltip, Spin } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';

import { AddResourceModal, UpdateResourceModal } from './components';
import useRefreshPage from '@/components/RefreshPage';
import {
  getResourcePage as getResourcePageApi,
  getResourceSourceList as getResourceSourceListApi,
  getResourceTagList as getResourceTagListApi,
  deleteResource as deleteResourceApi,
  bindResource as bindResourceApi,
} from '@api/resource/resource.api';
import { ResourcePageReq, ResourcePageResp, BindResourceReq } from '@model/resource/resource';
import { LabelValue } from '@model/base/base';
import { MbLoginApi } from '@eleapi/door/login/mb.login';
import { MbUserApi } from '@eleapi/door/user/user';


type DataType = {
  id: number;
  account: string;
  nick: string;
  source: LabelValue;
  tag: LabelValue;
  remark: string;
}

function resourcePageRespConvertDataType(resp: ResourcePageResp[]): DataType[] {
  const data: DataType[] = []
  for (const item of resp) {
    data.push(item)
  }
  return data
}

export default function ResourceManage() {
  const actionRef = useRef<ActionType>();
  const { refreshPage } = useRefreshPage();

  const [sourceEnum, setSourceEnum] = useState<Record<string, any>>();
  const [sourceList, setSourceList] = useState<LabelValue[]>([]);
  const [tagList, setTagList] = useState<LabelValue[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getResourceSourceListApi().then((res) => {
      const valueEnum: Record<string, any> = {}
      res.forEach((item) => {
        valueEnum[item.value] = {
          text: item.label
        }
      })
      setSourceEnum(valueEnum)
      setSourceList(res)
    })

    getResourceTagListApi().then((res) => {
      setTagList(res)
    })
  }, [])

  const baseColumns: ProColumns<DataType>[] = [
    {
      title: '来源',
      dataIndex: 'source',
      align: 'center',
      valueType: 'select',
      valueEnum: sourceEnum,
      width: 100,
      render: (_, record) => (
        <Space>
          <Tag color={record.source.color} key={record.source.value}>
            {record.source.label}
          </Tag>
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tag',
      search: false,
      align: 'center',
      width: 100,
      renderFormItem: (_, { defaultRender }) => {
        return defaultRender(_);
      },
      render: (_, record) => (
        <Space>
          <Tag color={record.tag.color} key={record.tag.value}>
            {record.tag.label}
          </Tag>
        </Space>
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nick',
      align: 'center',
      search: false,
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

  const bindResource = async (record: DataType) => {
    try {
      setLoading(true);
      const resourceId = record.id;

      const mbLoginApi = new MbLoginApi();
      const url = "https://login.taobao.com/member/login.jhtml";
      const loginResult = await mbLoginApi.login(resourceId, url); // TODO,获取资源登录地址
      if (loginResult.code === false) {
        message.error('绑定失败');
        return;
      }

      // 获取用户信息
      const userApi = new MbUserApi();
      const userInfo = await userApi.getUserInfo(resourceId);
      if (userInfo.code === false) {
        message.error('绑定失败');
        return;
      }

      const userInfoData = userInfo.data;
      const bindResourceReq = new BindResourceReq(userInfoData.displayNick, userInfoData.nick, userInfoData.userNumId);
      const bindResult = await bindResourceApi(resourceId, bindResourceReq);
      if (!bindResult) {
        message.error('绑定失败');
        return;
      }
      message.success('绑定成功');
    } finally {
      setLoading(false);
    }
  }

  const deleteConfirm = async (id: number) => {
    await deleteResourceApi(id);
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
      width: 150,
      render: (_, record) => [
        <Button key="bind" type="link" style={{ paddingRight: 0 }} onClick={async () => {
          await bindResource(record);
          refreshPage(actionRef, false);
        }}>重绑定</Button>,
        <UpdateResourceModal key="updateResourceModal"
          id={record.id}
          form={{ source: record.source.value, tag: record.tag.value, remark: record.remark }}
          sources={sourceList}
          tags={tagList}
          onFinish={() => { refreshPage(actionRef, false); }} />,
        <Popconfirm key="deleteConfirm" title="确定要删除吗？" onConfirm={async () => await deleteConfirm(record.id)}>
          <Button key="delete" type="link" danger style={{ paddingLeft: 0 }}>删除</Button>
        </Popconfirm>

      ],
    }
  ]

  return (
    <Layout curActive='/resource'>
      <Spin spinning={loading} tip="绑定中">
        <ProTable<DataType>
          rowKey="id"
          headerTitle="商品管理"
          columns={columns}
          actionRef={actionRef}
          options={false}
          toolBarRender={() => [
            <AddResourceModal key="addResourceModal" sources={sourceList} tags={tagList} onFinish={() => {
              refreshPage(actionRef, false);
            }} />
          ]}
          request={async (params) => {
            const req = new ResourcePageReq(params.current ?? 1, params.pageSize ?? 10, params.account, params.source)
            const { data: list, pageInfo } = await getResourcePageApi(req)
            const data = resourcePageRespConvertDataType(list);
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