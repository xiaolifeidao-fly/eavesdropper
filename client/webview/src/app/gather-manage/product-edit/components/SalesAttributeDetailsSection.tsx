import React from 'react';
import { Card, Form, Input, InputNumber, Table } from 'antd';

interface SalesAttributeDetailsSectionProps {
  salesAttr: any[];
  salesSkus: any[];
}

const SalesAttributeDetailsSection: React.FC<SalesAttributeDetailsSectionProps> = ({ 
  salesAttr = [], 
  salesSkus = [] 
}) => {
  const columns = [
    ...salesAttr.map(attr => ({
      title: attr.name,
      dataIndex: ['properties', attr.pid],
      key: attr.pid,
      render: (text: string) => text,
    })),
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (text: string, record: any) => (
        <Form.Item
          name={['doorSkuSaleInfo', 'salesSkus', record.index, 'price']}
          noStyle
        >
          <InputNumber 
            min={0} 
            precision={2} 
            style={{ width: '100%' }} 
          />
        </Form.Item>
      ),
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: string, record: any) => (
        <Form.Item
          name={['doorSkuSaleInfo', 'salesSkus', record.index, 'quantity']}
          noStyle
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
          />
        </Form.Item>
      ),
    },
  ];

  // Add index to salesSkus for form reference
  const dataSource = salesSkus.map((sku, index) => ({
    ...sku,
    index,
    key: index,
  }));

  return (
    <Card title="SKU详情" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['doorSkuSaleInfo', 'salesSkus']} 
        label="SKU列表"
      >
        <Table 
          dataSource={dataSource} 
          columns={columns} 
          pagination={false}
          bordered
        />
      </Form.Item>
    </Card>
  );
};

export default SalesAttributeDetailsSection; 