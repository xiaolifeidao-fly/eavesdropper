import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { SkuItem } from '@model/door/sku';

interface ProductAttributesSectionProps {
  data: SkuItem[];
  onChange?: (data: SkuItem[]) => void;
}

const ProductAttributesSection: React.FC<ProductAttributesSectionProps> = ({ 
  data = [], 
  onChange 
}) => {
  const form = Form.useFormInstance();
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  const [skuItems, setSkuItems] = useState<any[]>(safeData);

  // Update local state when data prop changes
  useEffect(() => {
    const safeNewData = Array.isArray(data) ? data : [];
    setSkuItems(safeNewData);
  }, [data]);
  
  const handleValueChange = (attributeValue: string, textValues: string[]) => {
    const currentBaseInfo = form.getFieldValue('baseInfo') || {};
    const currentSkuItems = currentBaseInfo.skuItems || [];
    
    // Ensure currentSkuItems is an array
    const skuItemsArray = Array.isArray(currentSkuItems) ? currentSkuItems : skuItems;
    
    const newSkuItems = skuItemsArray.map((item: SkuItem) => {
      if (item.value === attributeValue) {
        // Filter out empty values
        const filteredValues = textValues.filter(val => val && val.trim() !== '');
        return new SkuItem(item.value, filteredValues);
      }
      return item;
    });
    
    // Update local state
    setSkuItems(newSkuItems);
    
    // Update form values
    form.setFieldsValue({
      baseInfo: {
        ...currentBaseInfo,
        skuItems: newSkuItems
      }
    });
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(newSkuItems);
    }
  };

  const getCurrentValues = (itemValue: string): string[] => {
    const item = skuItems.find(item => item.value === itemValue);
    return item && Array.isArray(item.text) ? item.text : [];
  };

  // Don't render if no data
  if (!Array.isArray(skuItems) || skuItems.length === 0) {
    return (
      <Card title="商品属性" style={{ marginBottom: 16, maxHeight: 400, overflow: 'auto' }}>
        <div>暂无商品属性数据</div>
      </Card>
    );
  }

  return (
    <Card title="商品属性" style={{ marginBottom: 16, maxHeight: 400, overflow: 'auto' }}>
      <style>{`
        .dynamic-delete-button {
          color: #999;
          font-size: 16px;
          line-height: 32px;
          cursor: pointer;
          transition: color 0.3s;
          margin-left: 8px;
        }
        .dynamic-delete-button:hover {
          color: #f50;
        }
      `}</style>
      <Form.Item name={['baseInfo', 'skuItems']}>
        <div>
          {skuItems.map((item, index) => (
            <div key={item.value} style={{ marginBottom: 24, padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 12, color: '#1890ff' }}>
                {item.value}：
              </div>
              <Form.List 
                name={['productAttributes', item.value]}
                initialValue={getCurrentValues(item.value)}
              >
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name]}
                          style={{ flex: 1, marginBottom: 0, minWidth: 400 }}
                        >
                          <Input 
                            placeholder="输入属性值"
                            onChange={(e) => {
                              // Get current form values for this attribute
                              const formValues = form.getFieldValue(['productAttributes', item.value]) || [];
                              const newValues = [...formValues];
                              newValues[name] = e.target.value;
                              
                              // Update the main data structure
                              handleValueChange(item.value, newValues);
                            }}
                          />
                        </Form.Item>
                        <MinusCircleOutlined 
                          className="dynamic-delete-button" 
                          onClick={() => {
                            remove(name);
                            // Get updated values after removal
                            setTimeout(() => {
                              const formValues = form.getFieldValue(['productAttributes', item.value]) || [];
                              handleValueChange(item.value, formValues);
                            }, 0);
                          }}
                        />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => {
                          add();
                        }} 
                        block 
                        icon={<PlusOutlined />}
                        style={{ height: '36px',maxWidth: 150, marginLeft : 20}}
                      >
                        添加属性值
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          ))}
        </div>
      </Form.Item>
    </Card>
  );
};

export default ProductAttributesSection; 