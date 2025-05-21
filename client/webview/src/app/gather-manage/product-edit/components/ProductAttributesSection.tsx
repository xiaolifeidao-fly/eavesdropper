import React from 'react';
import { Card, Form, Table } from 'antd';

interface ProductAttributesSectionProps {
  data: any[];
}

const ProductAttributesSection: React.FC<ProductAttributesSectionProps> = ({ data = [] }) => {
  const columns = [
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '属性值',
      dataIndex: 'value',
      key: 'value',
    },
  ];

  return (
    <Card title="商品属性" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['baseInfo', 'skuItems']} 
        label="商品属性列表"
      >
        <Table 
          dataSource={data} 
          columns={columns} 
          rowKey="name"
          pagination={false}
          bordered
        />
      </Form.Item>
    </Card>
  );
};

export default ProductAttributesSection; 