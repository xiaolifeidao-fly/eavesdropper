'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Input, Space, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getSkuTaskPage, SkuTaskPageReq, SkuTaskPageResp, SkuTaskItemResp, getSkuTaskItemByTaskId } from '@/api/sku/sku.task';
import { BasePageResp } from '@/common/base';
import Layout from '@/components/layout';


const { Title } = Typography;

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
  });
  const [taskItemsMap, setTaskItemsMap] = useState<Record<number, SkuTaskItemResp[]>>({});

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
          setLoading(true);
          const items = await getSkuTaskItemByTaskId(record.id);
          
          console.log('Fetched items for task ID', record.id, items);
          
          setTaskItemsMap(prev => ({
            ...prev,
            [record.id]: items
          }));
        } catch (error) {
          console.error('Failed to load task items:', error);
        } finally {
          setLoading(false);
        }
      }
      setExpandedRowKeys(prev => [...prev, key]);
    } else {
      setExpandedRowKeys(prev => prev.filter(k => k !== key));
    }
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
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a>查看</a>
          <a>编辑</a>
          {record.status === 'pending' && <a>启动</a>}
          {record.status === 'running' && <a>停止</a>}
        </Space>
      ),
    },
  ];

  // Nested table columns for task items
  const expandedRowRender = (record: SkuTaskPageResp) => {
    const taskItems = taskItemsMap[record.id] || [];
    
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
        title: '操作', 
        key: 'operation',
        width: 150, 
        render: (_, item) => (
          <Space size="middle">
            <a>详情</a>
            {item.status === 'failed' && <a>重试</a>}
            {item.status === 'pending' && <a>取消</a>}
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
              placeholder="商品名称"
              value={searchParams.skuName}
              onChange={e => setSearchParams({ ...searchParams, skuName: e.target.value })}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={() => loadData()}>搜索</Button>
            <Button onClick={() => {
              setSearchParams({ shopName: '', skuName: '' });
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
      </div>
    </Layout>
  );
}
