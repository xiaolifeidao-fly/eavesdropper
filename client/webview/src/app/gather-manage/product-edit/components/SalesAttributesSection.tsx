import React from 'react';
import { Card, Form, Input, InputNumber, Select } from 'antd';

interface SalesAttributesSectionProps {
  salesAttr: any[];
  price: number;
  quantity: number;
}

const SalesAttributesSection: React.FC<SalesAttributesSectionProps> = ({ 
  salesAttr = [], 
  price, 
  quantity 
}) => {
  const { Option } = Select;

  return (
    <Card title="销售属性" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['doorSkuSaleInfo', 'price']} 
        label="价格"
        rules={[{ required: true, message: '请输入商品价格' }]}
      >
        <InputNumber 
          min={0} 
          precision={2} 
          style={{ width: '100%' }} 
          addonBefore="¥" 
        />
      </Form.Item>

      <Form.Item 
        name={['doorSkuSaleInfo', 'quantity']} 
        label="库存"
        rules={[{ required: true, message: '请输入商品库存' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      {salesAttr.map((attr, index) => (
        <Form.Item 
          key={index}
          name={['doorSkuSaleInfo', 'salesAttr', index, 'values']} 
          label={attr.name}
        >
          <Select mode="multiple" placeholder={`请选择${attr.name}`}>
            {attr.values?.map((val: string, idx: number) => (
              <Option key={idx} value={val}>{val}</Option>
            ))}
          </Select>
        </Form.Item>
      ))}
    </Card>
  );
};

export default SalesAttributesSection; 