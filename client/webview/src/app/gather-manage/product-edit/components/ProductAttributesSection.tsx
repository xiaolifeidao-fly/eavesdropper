import React, { useState } from 'react';
import { Card, Form, Select } from 'antd';
import { SkuItem } from '@model/door/sku';

interface ProductAttributesSectionProps {
  data: SkuItem[];
  onChange?: (data: SkuItem[]) => void;
}

const ProductAttributesSection: React.FC<ProductAttributesSectionProps> = ({ 
  data = [], 
  onChange 
}) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
  
  const handleValueChange = (value: string, newValues: string[]) => {
    setSelectedValues(prev => ({ ...prev, [value]: newValues }));
    
    if (onChange) {
      const newData = data.map(item => {
        if (item.value === value) {
          return new SkuItem(item.value, newValues);
        }
        return item;
      });
      onChange(newData);
    }
  };

  return (
    <Card title="商品属性" style={{ marginBottom: 16, maxHeight: 400, overflow: 'auto' }}>
      <Form.Item 
        name={['baseInfo', 'skuItems']} 
      >
        <div>
          {data.map(item => (
            <Form.Item 
              key={item.value}
              label={item.value + "："} 
              style={{ marginBottom: 16 }}
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="输入值后按回车添加"
                value={selectedValues[item.value] || item.text}
                onChange={(newValues) => handleValueChange(item.value, newValues)}
                tokenSeparators={[',']}
              />
            </Form.Item>
          ))}
        </div>
      </Form.Item>
    </Card>
  );
};

export default ProductAttributesSection; 