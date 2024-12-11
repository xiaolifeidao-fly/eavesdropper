import { Space, Tag, type TableProps } from 'antd';

export interface DataType {
  key: string;
  nickname: string;
  mobile: string;
  lastLoginTime: string;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: '用户名',
    dataIndex: 'nickname',
    key: 'nickname',
    render: (text) => <a>{text}</a>,
    align: 'center',
    width: 150
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key: 'mobile',
    render: mobile => mobile,
    align: 'center'
  },
  {
    title: '最后登录时间',
    dataIndex: 'lastLoginTime',
    key: 'lastLoginTime',
    render: lastLoginTime => lastLoginTime,
    align: 'center'
  },

  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>编辑</a>
        <a>删除</a>
      </Space>
    ),
    align: 'center'
  },
];

const data: DataType[] = [
];

export {
  columns,
  data
}