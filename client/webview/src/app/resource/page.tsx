'use client'
import { useRef, useState, useEffect } from 'react';
import { Button, message, Tag, Space, Popconfirm, Tooltip, Spin, Modal, Input, Form } from 'antd';
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
      await bindResource(resourceId);
    });
  }, [])

  const bindResource = async (resourceId: number) => {
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
  }
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

  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [validateCode, setValidateCode] = useState<string>("");
  const [validateHidden, setValidateHidden] = useState(true);
  const [loginHidden, setLoginHidden] = useState(false);
  const [operatorResourceId, setOperatorResourceId] = useState<number>(-1);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [countdown]);

  const openLoginPage = async (record: DataType) => {
     setOpen(true);
     setLoginHidden(false);
     setValidateHidden(true);
     setUsername("");
     setPassword("");
     setValidateCode("");
     setOperatorResourceId(record.id);
  }

  const login = async () => {
      try {
        if(!username || !password){
          message.error("请输入账号和密码");
          return;
        }
        setQrCodeLoading(true);
        setQrCodeTip("登录中...");
        setValidateHidden(true);
        const mbLoginApi = new MbLoginApi();
        const loginResult = await mbLoginApi.inputLoginInfo(operatorResourceId, username, password);
        if (!loginResult) {
          message.error("系统错误");
          return;
        }
        if(!loginResult.code){
          message.error(loginResult.data);
          return;
        }
        const resultData = loginResult.data;
        if(resultData.result == "2"){
          message.info(resultData.message);
          setLoginHidden(true);
          setValidateHidden(false);
          return;
        }
        message.success(resultData.message);
        await bindResource(operatorResourceId);
        setOpen(false);
      } finally {
        setQrCodeLoading(false);
      }
  }

  const sendValidateCode = async () => {
    try {
      setQrCodeLoading(true);
      setQrCodeTip("获取短信验证码中...");
      const mbLoginApi = new MbLoginApi();
      const loginResult = await mbLoginApi.sendValidateCode(operatorResourceId);
      if (loginResult.code === false) {
        message.error(loginResult.data);
        return;
      }
      message.success(loginResult.data);
      setCountdown(60); // Start 60s countdown after successful send
    } finally {
      setQrCodeLoading(false);
    }
  }

  const loginByValidateCode = async () => {
      try {
        if(!validateCode || validateCode.length !== 6){
          message.error("请输入6位验证码");
          return;
        }
        setQrCodeTip("提交中...");
        setQrCodeLoading(true);
        const mbLoginApi = new MbLoginApi();
        const loginResult = await mbLoginApi.loginByValidateCode(operatorResourceId, validateCode);
        if (loginResult.code === false) {
          message.error(loginResult.data);
          return;
        }
        message.success('登录成功');
        await bindResource(operatorResourceId);
        setOpen(false);
      } finally {
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
      render: (_, record) => {
        const buttons = [];
        if(record.source.value == 'taobao'){
          buttons.push(
            <Button key="bind" type="link" style={{ paddingRight: 0 }} onClick={async () => {
              await openLoginPage(record);
            }}>重绑定</Button>,
          )
          buttons.push(
            <Button key="openUserInfo" type="link" style={{ paddingRight: 0 }} onClick={async () => {
              const userApi = new MbUserApi();
              await userApi.openUserInfo(record.id);
            }}>打开用户信息</Button>,
          )
        }
        buttons.push(
          <UpdateResourceModal key="updateResourceModal"
            id={record.id}
            form={{ source: record.source.value, tag: record.tag.value, remark: record.remark }}
            sources={sourceList}
            tags={tagList}
            onFinish={() => { refreshPage(actionRef, false); }} />,
        )
        buttons.push(
          <Popconfirm key="deleteConfirm" title="确定要删除吗？" onConfirm={async () => await deleteConfirm(record.id)}>
            <Button key="delete" type="link" danger style={{ paddingLeft: 0 }}>删除</Button>
          </Popconfirm>
        )
        return <div style={{ display: 'flex', justifyContent: 'center' }}>{buttons}</div>;
      }
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
      <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} footer={null} style={{ height: '400px' }}>
        <Spin spinning={qrCodeLoading} tip={qrCodeTip}>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <div style={{ display: loginHidden ? 'none' : 'block' }}>
              <div>
                <Form.Item label="账号:">
                  <Input placeholder='请输入账号' value={username} required={true} onChange={(e) => setUsername(e.target.value)}></Input>
                </Form.Item>
              </div>
              <div>
                <Form.Item label="密码:">
                  <Input placeholder='请输入密码' value={password} required={true} type='password' onChange={(e) => setPassword(e.target.value)}></Input>
                </Form.Item>
              </div>
            <Button onClick={async () => await login()}>登录</Button>
            </div>
            <div  style={{ display: validateHidden ? 'none' : 'block' }}>
              <div>
                <Form.Item label="验证码:">
                  <Input hidden placeholder='请输入短信验证码' type='number'  maxLength={6} onChange={(e) => setValidateCode(e.target.value)}></Input>
                </Form.Item>
              </div>
              <Button 
                onClick={async () => await sendValidateCode()} 
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取短信验证码'}
              </Button>
              <Button onClick={async () => await loginByValidateCode()}>提交</Button>
            </div>
          </div>
        </Spin>
      </Modal>
    </Layout>
  )
}