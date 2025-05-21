import React from 'react';
import { Card, Form, Input, Select } from 'antd';

interface BaseInfo {
  title: string;
  catId: string;
}

interface BasicInfoSectionProps {
  data: any;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data }) => {
  const { Option } = Select;

  return (
    <Card title="基本信息" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['baseInfo', 'name']} 
        label="商品名称"
        rules={[{ required: true, message: '请输入商品名称' }]}
      >
        <Input placeholder="请输入商品名称" />
      </Form.Item>

      <Form.Item 
        name={['baseInfo', 'category']} 
        label="商品类别"
        rules={[{ required: true, message: '请选择商品类别' }]}
      >
        <Select placeholder="请选择商品类别">
          <Option value="category1">类别1</Option>
          <Option value="category2">类别2</Option>
          <Option value="category3">类别3</Option>
        </Select>
      </Form.Item>

      <Form.Item 
        name={['baseInfo', 'description']} 
        label="商品描述"
      >
        <Input.TextArea rows={4} placeholder="请输入商品描述" />
      </Form.Item>
    </Card>
  );
};

export default BasicInfoSection; 