import React from 'react';
import { Card, Form, Input, Select } from 'antd';
import { DoorSkuBaseInfoDTO } from '@model/door/sku';

interface BaseInfo {
  title: string;
  catId: string;
}

interface BasicInfoSectionProps {
  data: DoorSkuBaseInfoDTO;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data }) => {
  const { Option } = Select;

  return (
    <Card title="基本信息" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['baseInfo', 'title']} 
        label="商品名称"
        rules={[{ required: true, message: '请输入商品名称' }]}
      >
        <Input name='title' placeholder="请输入商品名称" />
      </Form.Item>

      <Form.Item 
        name={['baseInfo', 'catId']} 
        label="商品类别"
        rules={[{ required: true, message: '请选择商品类别' }]}
      >
        <Select placeholder="请选择商品类别">
          <Option name='catId' value="category1">类别1</Option>
          <Option name='catId' value="category2">类别2</Option>
          <Option name='catId' value="category3">类别3</Option>
        </Select>
      </Form.Item>

    </Card>
  );
};

export default BasicInfoSection; 