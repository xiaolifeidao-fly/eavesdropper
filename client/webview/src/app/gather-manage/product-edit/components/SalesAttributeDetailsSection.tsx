import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, InputNumber, Table, Button, Typography, Space, Select, Switch, Image, Modal, Upload, message } from 'antd';
import { SearchOutlined, FullscreenOutlined, DeleteOutlined, PlusOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { SalesAttr, SalesSku } from '@model/door/sku';

interface SalesAttributeDetailsSectionProps {
  salesAttr: { [key: string]: SalesAttr };
  salesSkus: SalesSku[];
  onUpdateSalesAttr?: (updatedSalesAttr: { [key: string]: SalesAttr }) => void;
  onUpdateSalesSkus?: (updatedSalesSkus: SalesSku[]) => void;
}

const SalesAttributeDetailsSection: React.FC<SalesAttributeDetailsSectionProps> = ({ 
  salesAttr, 
  salesSkus = [],
  onUpdateSalesAttr,
  onUpdateSalesSkus
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentAttr, setCurrentAttr] = useState<SalesAttr | null>(null);
  const [currentAttrKey, setCurrentAttrKey] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Create local state to track changes before saving to parent
  const [localSalesAttr, setLocalSalesAttr] = useState<{ [key: string]: SalesAttr }>(salesAttr);
  const [localSalesSkus, setLocalSalesSkus] = useState<SalesSku[]>(salesSkus);
  
  // Update local state when props change
  useEffect(() => {
    setLocalSalesAttr(salesAttr);
    setLocalSalesSkus(salesSkus);
  }, [salesAttr, salesSkus]);

  // Create array of attributes for easier processing
  const attributesArray: SalesAttr[] = [];
  for(const key in localSalesAttr) {
    if(key.startsWith("p-")) {
      attributesArray.push(localSalesAttr[key]);
    }
  }
  
  // Function to propagate changes to parent component
  const updateParentState = useCallback((newAttr: { [key: string]: SalesAttr }, newSkus: SalesSku[]) => {
    if (onUpdateSalesAttr) {
      onUpdateSalesAttr(newAttr);
    }
    
    if (onUpdateSalesSkus) {
      onUpdateSalesSkus(newSkus);
    }
  }, [onUpdateSalesAttr, onUpdateSalesSkus]);

  // Generate dynamic columns based on salesAttr
  const generateColumns = () => {
    const dynamicColumns = attributesArray.map((attr : SalesAttr) => {
      const key = `p-${attr.pid}`;
      return {
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{attr.label}</span>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {
              setCurrentAttr({...attr});
              setCurrentAttrKey(key);
              setEditModalVisible(true);
            }}
          />
        </div>
      ),
      dataIndex: `attr_${key}`,
      key: key,
      width: 150,
      render: (text: string, record: any) => {
        // Find the attribute value based on salePropPath
        // First split by semicolon to get individual "pid:value" pairs
        const propPathItems = record.salePropPath?.split(';') || [];
        
        // Find the pair that matches this attribute's pid
        for (const item of propPathItems) {
          const propPathParts = item.split(':');
          if (propPathParts.length === 2 && propPathParts[0] === attr.pid) {
            const attrValue = attr.values?.find(v => v.value === propPathParts[1]);
            return (
              <Space>
                {attrValue?.image && (
                  <Image 
                    src={attrValue.image} 
                    width={30} 
                    height={30} 
                    style={{ objectFit: 'cover' }} 
                  />
                )}
                <span>{attrValue?.text}</span>
              </Space>
            );
          }
        }
        return null;
      }
      }
    });
    
    // Add fixed columns for price and quantity
    return [
      ...dynamicColumns,
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        render: (text: string, record: any) => (
          <Form.Item
            name={['doorSkuSaleInfo', 'salesSkus', record.index, 'price']}
            initialValue={record.price}
            noStyle
          >
            <InputNumber 
              min={0} 
              precision={2} 
              style={{ width: '100%' }} 
              addonAfter="元"
              onChange={(value) => handleSkuChange(record.index, 'price', value)}
            />
          </Form.Item>
        ),
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        render: (text: string, record: any) => (
          <Form.Item
            name={['doorSkuSaleInfo', 'salesSkus', record.index, 'quantity']}
            initialValue={record.quantity}
            noStyle
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              addonAfter="件"
              onChange={(value) => handleSkuChange(record.index, 'quantity', value)}
            />
          </Form.Item>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (_: any, record: any) => (
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSku(record.index)}
          />
        )
      }
    ];
  };

  // Add debug logging when props change
  useEffect(() => {
    console.log("SalesAttributeDetailsSection props updated:", { 
      salesAttrCount: Object.keys(salesAttr).length,
      salesSkusCount: salesSkus.length,
      hasUpdateCallbacks: !!onUpdateSalesAttr && !!onUpdateSalesSkus
    });
  }, [salesAttr, salesSkus, onUpdateSalesAttr, onUpdateSalesSkus]);

  // Handle SKU changes
  const handleSkuChange = (index: number, field: string, value: any) => {
    const updatedSkus = [...localSalesSkus];
    updatedSkus[index] = {
      ...updatedSkus[index],
      [field]: value,
    };
    
    setLocalSalesSkus(updatedSkus);
    
    // Immediately update the parent
    updateParentState(localSalesAttr, updatedSkus);
  };
  
  // Handle SKU deletion
  const handleDeleteSku = (index: number) => {
    const updatedSkus = [...localSalesSkus];
    updatedSkus.splice(index, 1);
    
    setLocalSalesSkus(updatedSkus);
    
    // Immediately update the parent
    updateParentState(localSalesAttr, updatedSkus);
  };
  
  // Generate all possible combinations of attribute values
  const generateAttributeCombinations = useCallback(() => {
    console.log("Generating attribute combinations");
    
    // Find all valid attribute keys (those starting with 'p-')
    const attrKeys = Object.keys(localSalesAttr).filter(key => key.startsWith('p-'));
    if (attrKeys.length === 0) return [];
    
    // Extract all attributes and their values
    const attributesWithValues = attrKeys.map(key => {
      const attr = localSalesAttr[key];
      return {
        pid: attr.pid,
        values: attr.values || []
      };
    }).filter(attr => attr.values.length > 0);
    
    console.log("Attributes with values:", attributesWithValues);
    
    if (attributesWithValues.length === 0) return [];
    
    // Generate combinations recursively
    const generateCombinations = (index: number, current: any = {}): any[] => {
      if (index === attributesWithValues.length) {
        return [current];
      }
      
      const currentAttr = attributesWithValues[index];
      const combinations: any[] = [];
      
      currentAttr.values.forEach(value => {
        const newCurrent = { 
          ...current,
          [`${currentAttr.pid}`]: value.value
        };
        combinations.push(...generateCombinations(index + 1, newCurrent));
      });
      
      return combinations;
    };
    
    // Generate all combinations starting from the first attribute
    const combinations = generateCombinations(0);
    console.log("Generated combinations:", combinations);
    return combinations;
  }, [localSalesAttr]);
  
  // Convert attribute combinations to SKU format with salePropPath
  const convertCombinationsToSkus = useCallback((combinations: any[]): SalesSku[] => {
    // Map each combination to a SKU object
    return combinations.map(combination => {
      // Create salePropPath from combination (format: "pid:value;pid2:value2")
      const salePropPath = Object.keys(combination)
        .map(pid => `${pid}:${combination[pid]}`)
        .join(';');
      
      // Check if this SKU already exists
      const existingSku = localSalesSkus.find(sku => sku.salePropPath === salePropPath);
      
      if (existingSku) {
        // Return existing SKU if found
        return existingSku;
      } else {
        // Create new SKU with default values
        return {
          skuId: `sku_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          salePropPath,
          price: "0", // Default price
          quantity: "0" // Default quantity
        };
      }
    });
  }, [localSalesSkus]);
  
  // Apply attribute changes immediately
  const applyAttrChanges = useCallback((updatedAttr: SalesAttr, attrKey: string) => {
    // Update local state with the changed attribute
    const updatedSalesAttr = {
      ...localSalesAttr,
      [attrKey]: updatedAttr
    };
    
    setLocalSalesAttr(updatedSalesAttr);
    
    // Generate new SKUs based on the updated attributes
    const combinations = generateAttributeCombinations();
    const updatedSkus = convertCombinationsToSkus(combinations);
    
    setLocalSalesSkus(updatedSkus);
    
    // Update parent state
    updateParentState(updatedSalesAttr, updatedSkus);
    
  }, [localSalesAttr, localSalesSkus, generateAttributeCombinations, convertCombinationsToSkus, updateParentState]);
  
  // Handle attribute updates in modal
  const handleAttrUpdate = () => {
    console.log("handleAttrUpdate called", { 
      hasCurrentAttr: !!currentAttr, 
      currentAttrKey, 
      hasUpdateCallback: !!onUpdateSalesAttr 
    });
    
    if (!currentAttr) {
      console.error("Save failed: currentAttr is null");
      message.error('保存失败: 属性数据为空');
      return;
    }
    
    if (!currentAttrKey) {
      console.error("Save failed: currentAttrKey is empty");
      message.error('保存失败: 属性键为空');
      return;
    }
    
    // Validate required fields
    if (!currentAttr.label) {
      console.warn("Validation failed: attribute label is empty");
      message.error('请输入属性名称');
      return;
    }
    
    if (!currentAttr.values || currentAttr.values.length === 0) {
      console.warn("Validation failed: no attribute values");
      message.error('请至少添加一个属性值');
      return;
    }
    
    // Check if any attribute values are empty
    const hasEmptyValue = currentAttr.values.some(val => !val.text);
    if (hasEmptyValue) {
      console.warn("Validation failed: empty attribute value text");
      message.error('属性值文本不能为空');
      return;
    }
    
    setSaveLoading(true);
    console.log("Starting save operation with validated data");
    
    try {
      // Ensure all values have a proper value field
      const updatedValues = currentAttr.values?.map((val, index) => {
        console.log(`Processing attribute value ${index}:`, val);
        return {
          ...val,
          value: val.value || `${index}`, // Ensure each value has a unique identifier
        };
      });
      
      const updatedAttr = {
        ...currentAttr,
        values: updatedValues
      };
      
      // Apply changes immediately
      applyAttrChanges(updatedAttr, currentAttrKey);
      
      message.success('属性保存成功');
      setEditModalVisible(false);
      setSaveLoading(false);
    } catch (error) {
      console.error('Error saving attribute:', error);
      message.error(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setSaveLoading(false);
    }
  };
  
  // Handle attribute deletion
  const handleAttrDelete = () => {
    console.log("handleAttrDelete called", { currentAttrKey });
    
    if (!currentAttrKey) {
      console.error("Delete failed: currentAttrKey is empty");
      message.error('删除失败: 属性键为空');
      return;
    }
    
    try {
      const updatedSalesAttr = {...localSalesAttr};
      delete updatedSalesAttr[currentAttrKey];
      
      setLocalSalesAttr(updatedSalesAttr);
      
      // Re-generate SKUs after attribute deletion
      const combinations = generateAttributeCombinations();
      const updatedSkus = convertCombinationsToSkus(combinations);
      setLocalSalesSkus(updatedSkus);
      
      // Update parent
      updateParentState(updatedSalesAttr, updatedSkus);
      
      message.success('属性删除成功');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error deleting attribute:', error);
      message.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // Handle image update
  const handleImageUpdate = (index: number, newImageUrl: string) => {
    if (!currentAttr || !currentAttr.values) return;
    
    const newValues = [...currentAttr.values];
    newValues[index] = {
      ...newValues[index],
      image: newImageUrl
    };
    
    setCurrentAttr({
      ...currentAttr,
      values: newValues
    });
    
    // Real-time preview of changes (optional)
    if (currentAttrKey && currentAttr) {
      const previewAttr = {
        ...currentAttr,
        values: newValues
      };
      
      // Create a temporary preview update
      const previewSalesAttr = {
        ...localSalesAttr,
        [currentAttrKey]: previewAttr
      };
      
      setLocalSalesAttr(previewSalesAttr);
    }
  };

  // Handle image upload
  const handleImageUpload = (index: number, info: any) => {
    if (info.file.status === 'done') {
      // Assuming the server returns the URL in response.url
      const imageUrl = info.file.response.url;
      
      // Update the current attribute value with new image
      if (currentAttr && currentAttr.values) {
        const newValues = [...currentAttr.values];
        newValues[index] = {
          ...newValues[index],
          image: imageUrl
        };
        
        const updatedAttr = {
          ...currentAttr,
          values: newValues
        };
        
        // Update current attribute state
        setCurrentAttr(updatedAttr);
        
        // Update sales attribute state for immediate preview
        if (currentAttrKey) {
          const updatedSalesAttr = {
            ...localSalesAttr,
            [currentAttrKey]: updatedAttr
          };
          
          // Update local state
          setLocalSalesAttr(updatedSalesAttr);
          
          // Update parent state to refresh table
          updateParentState(updatedSalesAttr, localSalesSkus);
        }
      }
      
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  // Add index to salesSkus for form reference
  const dataSource = localSalesSkus.map((sku, index) => ({
    ...sku,
    index,
    key: index,
  }));

  return (
    <>
      <Card 
        title="销售规格" 
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Table 
            dataSource={dataSource} 
            columns={generateColumns()} 
            pagination={false}
            bordered
            scroll={{ x: 'max-content' }}
          />
        </Space>
      </Card>
      
      {/* Edit Attribute Modal */}
      <Modal
        title={currentAttrKey && currentAttr?.label ? `编辑属性: ${currentAttr.label}` : "添加属性"}
        visible={editModalVisible}
        onOk={handleAttrUpdate}
        onCancel={() => {
          console.log("Modal canceled");
          // Reset any temporary preview changes
          setLocalSalesAttr(salesAttr);
          setEditModalVisible(false);
        }}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{ 
          maxHeight: 'calc(80vh - 200px)', 
          overflow: 'auto', 
          overflowY: 'scroll',
          paddingRight: 10 
        }}
        destroyOnClose={true}
        footer={[
          currentAttrKey && currentAttr?.label && 
          <Button 
            key="cancel" 
            onClick={() => {
              console.log("Cancel button clicked");
              // Reset any temporary preview changes
              setLocalSalesAttr(salesAttr);
              setEditModalVisible(false);
            }}
          >
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => {
              console.log("Save button clicked");
              handleAttrUpdate();
            }}
            loading={saveLoading}
          >
            保存
          </Button>,
        ]}
      >
        {currentAttr && (
          <Form layout="vertical">
            <Form.Item label="属性名称">
              {/* Make attribute name non-editable */}
              {currentAttr.label ? (
                <Typography.Text strong>{currentAttr.label}</Typography.Text>
              ) : (
                <Input 
                  value={currentAttr.label}
                  onChange={(e) => {
                    const updatedAttr = {...currentAttr, label: e.target.value};
                    setCurrentAttr(updatedAttr);
                    
                    // Optionally preview changes in real-time
                    if (currentAttrKey) {
                      const previewSalesAttr = {
                        ...localSalesAttr,
                        [currentAttrKey]: updatedAttr
                      };
                      setLocalSalesAttr(previewSalesAttr);
                    }
                  }}
                  placeholder="请输入属性名称"
                />
              )}
            </Form.Item>
            <Form.Item label="显示图片">
              <Switch 
                checked={currentAttr.hasImage === "true"} 
                onChange={(checked) => {
                  const updatedAttr = {...currentAttr, hasImage: checked ? "true" : "false"};
                  setCurrentAttr(updatedAttr);
                  
                  // Optionally preview changes in real-time
                  if (currentAttrKey) {
                    const previewSalesAttr = {
                      ...localSalesAttr,
                      [currentAttrKey]: updatedAttr
                    };
                    setLocalSalesAttr(previewSalesAttr);
                  }
                }}
              />
            </Form.Item>
            <Form.Item label="属性值">
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentAttr.values?.map((value, index) => (
                  <Space key={index} align="start">
                    <Input 
                      value={value.text}
                      onChange={(e) => {
                        const newValues = [...(currentAttr.values || [])];
                        newValues[index] = {...newValues[index], text: e.target.value};
                        const updatedAttr = {...currentAttr, values: newValues};
                        setCurrentAttr(updatedAttr);
                        
                        // Optionally preview changes in real-time
                        if (currentAttrKey) {
                          const previewSalesAttr = {
                            ...localSalesAttr,
                            [currentAttrKey]: updatedAttr
                          };
                          setLocalSalesAttr(previewSalesAttr);
                        }
                      }}
                      placeholder="属性值文本"
                    />
                    {currentAttr.hasImage === "true" && (
                      <Space>
                        {value.image ? (
                          <Space direction="vertical" align="center">
                            <Image 
                              src={value.image} 
                              width={60} 
                              height={60} 
                              style={{ objectFit: 'cover' }} 
                            />
                            <Upload
                              name="file"
                              action="/api/upload" // 替换为实际的上传API
                              showUploadList={false}
                              onChange={(info) => handleImageUpload(index, info)}
                            >
                              <Button size="small" icon={<UploadOutlined />}>
                                更换图片
                              </Button>
                            </Upload>
                          </Space>
                        ) : (
                          <Upload
                            name="file"
                            action="/api/upload" // 替换为实际的上传API
                            showUploadList={false}
                            onChange={(info) => handleImageUpload(index, info)}
                          >
                            <Button icon={<UploadOutlined />}>
                              添加图片
                            </Button>
                          </Upload>
                        )}
                      </Space>
                    )}
                    <Button 
                      icon={<DeleteOutlined />} 
                      onClick={() => {
                        const newValues = [...(currentAttr.values || [])];
                        newValues.splice(index, 1);
                        const updatedAttr = {...currentAttr, values: newValues};
                        setCurrentAttr(updatedAttr);
                        
                        // Optionally preview changes in real-time
                        if (currentAttrKey) {
                          const previewSalesAttr = {
                            ...localSalesAttr,
                            [currentAttrKey]: updatedAttr
                          };
                          setLocalSalesAttr(previewSalesAttr);
                        }
                      }}
                    />
                  </Space>
                ))}
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    const newValues = [...(currentAttr.values || [])];
                    newValues.push({ 
                      text: '', 
                      value: `${newValues.length}`, 
                      image: '',
                      sortOrder: String(newValues.length)
                    });
                    const updatedAttr = {...currentAttr, values: newValues};
                    setCurrentAttr(updatedAttr);
                    
                    // Optionally preview changes in real-time
                    if (currentAttrKey) {
                      const previewSalesAttr = {
                        ...localSalesAttr,
                        [currentAttrKey]: updatedAttr
                      };
                      setLocalSalesAttr(previewSalesAttr);
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  添加属性值
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default SalesAttributeDetailsSection; 