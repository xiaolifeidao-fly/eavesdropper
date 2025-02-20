'use client'
import { useRef, useState, useEffect } from 'react';
import { Button, message, Tag, Space, Popconfirm, Tooltip, Spin, Modal } from 'antd';
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
  expirationDate: string;
  isExpiration: boolean;
  updatedAt: string;
  status: LabelValue;
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
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [qrCodeTip, setQrCodeTip] = useState("加载中");

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
    const mbLoginApi = new MbLoginApi();
    mbLoginApi.onMonitorLoginResult(async (resourceId: number, result: boolean) => {
      if (!result) {
        message.error('绑定失败');
        return;
      }
      try {
        setQrCodeLoading(true);
        setQrCodeTip("绑定用户信息中...")
        // 获取用户信息
        const userApi = new MbUserApi();
        const userInfo = await userApi.getUserInfo(resourceId);
        if (userInfo.code) {
          const userInfoData = userInfo.data;
          const bindResourceReq = new BindResourceReq(userInfoData.displayNick, userInfoData.nick, userInfoData.userNumId);
          await bindResourceApi(resourceId, bindResourceReq);
        }
        setQrCodeTip("绑定完成...")
        setOpen(false);
        message.success('绑定成功');
        refreshPage(actionRef, true);
      } finally {
        setQrCodeLoading(false);
      }
    });
  }, [])

  const baseColumns: ProColumns<DataType>[] = [
    {
      title: '来源',
      dataIndex: 'source',
      key: "source",
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
      key: "tag",
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
      key: "nick",
      align: 'center',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      key: "remark",
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
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      search: false,
      render: (_, record) => (
        record.expirationDate ?
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
      key: "expirationDate",
      align: 'center',
      search: false,
      width: 200,
      render: (_, record) => (
        record.isExpiration ? (
          <div style={{ color: "red" }}>{record.expirationDate}</div>
        ) : record.expirationDate ? record.expirationDate : "-"
      )
    },
    {
      title: '过期时间',
      dataIndex: 'expirationDate',
      valueType: 'dateRange',
      hideInTable: true,
      width: 200,
      search: {
        transform: (value) => {
          return {
            startExpirationDate: value[0],
            endExpirationDate: value[1],
          };
        },
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: "updatedAt",
      align: 'center',
      search: false,
    },
  ]

  const [open, setOpen] = useState(false);
  const [qrCodeFilePath, setQrCodeFilePath] = useState<string | undefined>(undefined);

  const bindResource = async (record: DataType) => {
    try {
      setLoading(true);
      const resourceId = record.id;

      const mbLoginApi = new MbLoginApi();
      const loginResult = await mbLoginApi.login(resourceId);
      if (loginResult.code === false) {
        message.error('绑定失败');
        return;
      }
      const qrCodeData = loginResult.data;
      if (!qrCodeData || Object.keys(qrCodeData).length === 0) {
        message.success('绑定成功');
        return;
      }
      setOpen(true);
      setQrCodeLoading(true);
      const qrCodeFilePath = qrCodeData['fileUrl'];
      setQrCodeFilePath(qrCodeFilePath);
    } finally {
      setLoading(false);
      setQrCodeLoading(false);
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
            const req = new ResourcePageReq(params.current ?? 1, params.pageSize ?? 10)
            req.account = params.account
            req.source = params.source
            req.startExpirationDate = params.startExpirationDate
            req.endExpirationDate = params.endExpirationDate
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
      <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)}>
        <Spin spinning={qrCodeLoading} tip={qrCodeTip}>
          <div style={{ textAlign: 'center' }}>请在1分钟内扫码完毕,扫码完毕后请待耐心等待20s左右,不要关闭此窗口</div>
          <div style={{ textAlign: 'center' }}>
            <img src={qrCodeFilePath} />
          </div>
        </Spin>
      </Modal>
    </Layout>
  )
}