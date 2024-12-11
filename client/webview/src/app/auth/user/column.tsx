import { Space, Tag, type TableProps } from 'antd';

interface DataType {
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
  {
    key: '1',
    nickname: '徐小夕',
    mobile: '13800138000',
    lastLoginTime: '2024-01-01 10:00:00',
  },
  {
    key: '2',
    nickname: '张三',
    mobile: '13800138001',
    lastLoginTime: '2024-01-01 10:00:00',
  },
  {
    key: '3',
    nickname: '李四',
    mobile: '13800138002',
    lastLoginTime: '2024-01-01 10:00:00',
  },
  {
    key: '4',
    nickname: '王五',
    mobile: '13800138003',
    lastLoginTime: '2024-01-01 10:00:00',
  },
  {
    key: '5',
    nickname: '赵六',
    mobile: '13800138004',
    lastLoginTime: '2024-01-01 10:00:00',
  },
  {
    key: '6',
    nickname: '孙七',
    mobile: '13800138005',
    lastLoginTime: '2024-01-01 10:00:00',
  },
];

export {
  columns,
  data
}