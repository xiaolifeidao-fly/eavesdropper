'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Input, Space, Table, Typography, Modal, Select, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getSkuTaskPage, SkuTaskPageReq, SkuTaskPageResp, SkuTaskItemResp, getSkuTaskItemByTaskId } from '@/api/sku/sku.task';
import { BasePageResp } from '@/common/base';
import Layout from '@/components/layout';

const { Title } = Typography;
const { Option } = Select;

// Constants for task status, could be replaced with actual enum if available
const STATUS_COLORS: Record<string, "warning" | "processing" | "success" | "error" | "default"> = {
  pending: 'warning',
  running: 'processing',
  done: 'success',
  failed: 'error',
  stop: 'default',
};

export default function SkuListPage() {
  const [loading, setLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState<Record<number, boolean>>({});
  const [skuData, setSkuData] = useState<SkuTaskPageResp[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [searchParams, setSearchParams] = useState({
    shopName: '',
    skuName: '',
    status: '',
  });
  const [taskItemsMap, setTaskItemsMap] = useState<Record<number, SkuTaskItemResp[]>>({});
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState('');

  // Load SKU task data
  const loadData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const req = new SkuTaskPageReq(
        page,
        pageSize,
        searchParams.shopName || undefined,
        searchParams.skuName || undefined
      );
      
      // Add status to request if provided
      if (searchParams.status) {
        (req as any).status = searchParams.status;
      }
      
      const resp = await getSkuTaskPage(req);
      setSkuData(resp.data || []);
      setPagination({
        ...pagination,
        current: page,
        total: resp.pageInfo.total,
      });
    } catch (error) {
      console.error('Failed to load SKU data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load task items when expanding a row
  const handleExpand = async (expanded: boolean, record: SkuTaskPageResp) => {
    const key = record.id;
    
    if (expanded) {
      // Only fetch if we don't already have the data
      if (!taskItemsMap[record.id]) {
        try {
          setExpandLoading(prev => ({ ...prev, [record.id]: true }));
          const items = await getSkuTaskItemByTaskId(record.id);
          
          console.log('Fetched items for task ID', record.id, items);
          
          setTaskItemsMap(prev => ({
            ...prev,
            [record.id]: items
          }));
        } catch (error) {
          console.error('Failed to load task items:', error);
        } finally {
          setExpandLoading(prev => ({ ...prev, [record.id]: false }));
        }
      }
      setExpandedRowKeys(prev => [...prev, key]);
    } else {
      setExpandedRowKeys(prev => prev.filter(k => k !== key));
    }
  };

  // Show log details
  const showLogDetails = (log: string | undefined) => {
    setCurrentLog(log || 'No log data available');
    setLogModalVisible(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 用于调试
  useEffect(() => {
    console.log('Current expandedRowKeys:', expandedRowKeys);
    console.log('Current taskItemsMap:', taskItemsMap);
  }, [expandedRowKeys, taskItemsMap]);

  // Main table columns
  const columns: TableColumnsType<SkuTaskPageResp> = [
    {
      title: '商品ID',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 100,
    },
    {
      title: '资源账号',
      dataIndex: 'resourceAccount',
      key: 'resourceAccount',
      width: 150,
    },
    {
      title: '店铺名称',
      dataIndex: 'shopName',
      key: 'shopName',
      width: 200,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索店铺名称"
            value={searchParams.shopName}
            onChange={e => setSearchParams({ ...searchParams, shopName: e.target.value })}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => loadData()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            搜索
          </Button>
          <Button 
            onClick={() => {
              setSearchParams({ ...searchParams, shopName: '' });
              loadData();
            }} 
            size="small" 
            style={{ width: 90 }}
          >
            重置
          </Button>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (skuName) => (
        <Tooltip placement="topLeft" title={skuName}>
          <span>{skuName}</span>
        </Tooltip>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Badge 
          status={STATUS_COLORS[status] || 'default'} 
          text={record.statusLableValue?.label || status} 
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <a>复制上家链接</a>
          <a>复制本家链接</a>
        </Space>
      ),
    },
  ];

  // Nested table columns for task items
  const expandedRowRender = (record: SkuTaskPageResp) => {
    const taskItems = taskItemsMap[record.id] || [];
    const isLoading = expandLoading[record.id] || false;
    
    console.log('Rendering expanded row for record ID:', record.id, 'Items:', taskItems);
    
    const columns: TableColumnsType<SkuTaskItemResp> = [
      { 
        title: '任务ID', 
        dataIndex: 'id', 
        key: 'id',
        width: 80,
      },
      { 
        title: '任务步骤', 
        dataIndex: 'title', 
        key: 'title',
        width: 200,
      },
      { 
        title: '执行时间', 
        dataIndex: 'createdAt', 
        key: 'createdAt',
        width: 180,
      },
      { 
        title: '任务状态', 
        dataIndex: 'status', 
        key: 'status',
        width: 120,
        render: (status) => {
          const statusObj = {
            pending: { color: 'warning' as const, text: '待处理' },
            success: { color: 'success' as const, text: '成功' },
            failed: { color: 'error' as const, text: '失败' },
            cancel: { color: 'default' as const, text: '取消' },
            existence: { color: 'processing' as const, text: '存在' },
          };
          
          const currentStatus = status as keyof typeof statusObj;
          return (
            <Badge 
              status={statusObj[currentStatus]?.color || 'default'} 
              text={statusObj[currentStatus]?.text || status} 
            />
          );
        }
      },
      {
        title: '失败原因',
        dataIndex: 'remark',
        key: 'failReason',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (text, record) => (
          record.status === 'failed' && text ? (
            <Tooltip placement="topLeft" title={text}>
              <span style={{ color: '#ff4d4f' }}>{text}</span>
            </Tooltip>
          ) : ''
        )
      },
      { 
        title: '操作', 
        key: 'operation',
        width: 100, 
        render: (_, item) => (
          <Space size="middle">
            <a onClick={() => showLogDetails(item.remark)}>详情</a>
          </Space>
        ),
      },
    ];

    return (
      <Table 
        columns={columns} 
        dataSource={taskItems}
        pagination={false}
        rowKey="id"
        size="small"
        loading={isLoading}
      />
    );
  };

  return (
    <Layout curActive='/sku'>
      <div style={{ padding: '20px' }}>
        <Title level={4}>商品列表</Title>
        
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="店铺名称"
              value={searchParams.shopName}
              onChange={e => setSearchParams({ ...searchParams, shopName: e.target.value })}
              style={{ width: 200 }}
            />
            <Input
              placeholder="商品名称"
              value={searchParams.skuName}
              onChange={e => setSearchParams({ ...searchParams, skuName: e.target.value })}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态"
              value={searchParams.status}
              onChange={value => setSearchParams({ ...searchParams, status: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="pending">待处理</Option>
              <Option value="running">运行中</Option>
              <Option value="done">完成</Option>
              <Option value="failed">失败</Option>
              <Option value="stop">停止</Option>
            </Select>
            <Button type="primary" onClick={() => loadData()}>搜索</Button>
            <Button onClick={() => {
              setSearchParams({ shopName: '', skuName: '', status: '' });
              loadData();
            }}>重置</Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          rowKey="id"
          dataSource={skuData}
          pagination={pagination}
          loading={loading}
          expandable={{
            expandedRowRender,
            onExpand: handleExpand,
            expandedRowKeys: expandedRowKeys,
          }}
          onChange={(pagination) => {
            loadData(pagination.current, pagination.pageSize);
          }}
        />
        
        <Modal
          title="日志详情"
          open={logModalVisible}
          onCancel={() => setLogModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setLogModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            maxHeight: '500px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            <code dangerouslySetInnerHTML={{ 
              __html: currentLog.replace(/\[ERROR\].*$/gm, match => `<span style="color: red">${match}</span>`)
                               .replace(/\[WARN\].*$/gm, match => `<span style="color: orange">${match}</span>`)
                               .replace(/\[INFO\].*$/gm, match => `<span style="color: green">${match}</span>`)
                               .replace(/\[DEBUG\].*$/gm, match => `<span style="color: blue">${match}</span>`)
            }} />
          </pre>
        </Modal>
      </div>
    </Layout>
  );
}
