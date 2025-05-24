import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, InputNumber, Table, Button, Typography, Space, Select, Switch, Image, Modal, Upload, message, Tag } from 'antd';
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
  // Track newly added attribute values with a ref to ensure persistence
  const [newlyAddedValues, setNewlyAddedValues] = useState<{[key: string]: Set<string>}>({});
  
  // Debug newly added values
  useEffect(() => {
    console.log("Current newlyAddedValues:", newlyAddedValues);
  }, [newlyAddedValues]);

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
        // First split by semicolon to get individual "pid:value" pairs
        const propPathItems = record.salePropPath?.split(';') || [];
        
        // Find the pair that matches this attribute's pid
        for (const item of propPathItems) {
          const propPathParts = item.split(':');
          if (propPathParts.length === 2 && propPathParts[0] === attr.pid) {
            const attrValue = attr.values?.find(v => v.value === propPathParts[1]);
            const valueId = propPathParts[1];
            const isNewlyAddedValue = newlyAddedValues[key]?.has(valueId);
            
            // Debug output for this particular cell
            if (isNewlyAddedValue) {
              console.log(`Rendering new value: ${attr.pid}:${valueId} - ${attrValue?.text}`);
            }
            
            return (
              <Space style={{ 
                backgroundColor: isNewlyAddedValue ? '#b7eb8f' : 'transparent',
                padding: isNewlyAddedValue ? '4px 8px' : '0',
                borderRadius: '4px',
                width: '100%',
                border: isNewlyAddedValue ? '1px solid #52c41a' : 'none'
              }}>
                {attrValue?.image && (
                  <Image 
                    src={attrValue.image} 
                    width={30} 
                    height={30} 
                    style={{ objectFit: 'cover' }} 
                  />
                )}
                <span>{attrValue?.text}</span>
                {isNewlyAddedValue && (
                  <Tag color="green" style={{ fontWeight: 'bold', marginLeft: 'auto' }}>
                    NEW
                  </Tag>
                )}
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
  const generateAttributeCombinations = useCallback((salesAttrToUse?: { [key: string]: SalesAttr }) => {
    console.log("Generating attribute combinations");
    
    // Use provided salesAttr or fallback to localSalesAttr
    const salesAttrSource = salesAttrToUse || localSalesAttr;
    
    // Find all valid attribute keys (those starting with 'p-')
    const attrKeys = Object.keys(salesAttrSource).filter(key => key.startsWith('p-'));
    if (attrKeys.length === 0) return [];
    
    // Extract all attributes and their values
    const attributesWithValues = attrKeys.map(key => {
      const attr = salesAttrSource[key];
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
  
  // Apply attribute changes immediately
  const applyAttrChanges = useCallback((updatedAttr: SalesAttr, attrKey: string, newValueIds: string[] = []) => {
    // Update local state with the changed attribute
    const updatedSalesAttr = {
      ...localSalesAttr,
      [attrKey]: updatedAttr
    };
    
    setLocalSalesAttr(updatedSalesAttr);
    
    // Update newlyAddedValues if there are new values
    if (newValueIds.length > 0) {
      setNewlyAddedValues(prev => {
        const updated = {...prev};
        updated[attrKey] = new Set(newValueIds);
        return updated;
      });
      console.log(`Marked ${newValueIds.length} values as new for ${attrKey}`);
    }
    
    // Store the original salesSkus for reference
    const originalSkus = [...localSalesSkus];
    console.log(`Original SKUs before regeneration:`, originalSkus.map(sku => ({
      salePropPath: sku.salePropPath,
      price: sku.price,
      quantity: sku.quantity
    })));
    
    // Generate new SKUs based on the updated attributes - use updatedSalesAttr instead of localSalesAttr
    const combinations = generateAttributeCombinations(updatedSalesAttr);
    console.log(`Generated ${combinations.length} combinations:`, combinations);
    
    const updatedSkus = combinations.map(combination => {
      // Create salePropPath from combination with consistent ordering
      // Sort by pid to ensure consistent order like in demo data
      const salePropPath = Object.keys(combination)
        .sort() // Sort pids to ensure consistent order
        .map(pid => `${pid}:${combination[pid]}`)
        .join(';');
      
      // Use the improved function to find existing SKU
      const existingSku = findExistingSku(combination, originalSkus);
      
      if (existingSku) {
        // Return existing SKU with preserved price and quantity, but update salePropPath to new format
        console.log(`✓ Found existing SKU for ${salePropPath}, preserving price: ${existingSku.price}, quantity: ${existingSku.quantity}`);
        return {
          ...existingSku,
          salePropPath // Update to normalized format
        };
      } else {
        // Create new SKU with default values
        console.log(`✗ Creating new SKU for ${salePropPath} - no existing match found`);
        return {
          skuId: `sku_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          salePropPath,
          price: "0.00", // Default price for new SKUs with proper decimal format
          quantity: "0" // Default quantity for new SKUs
        };
      }
    });
    
    console.log(`Final updated SKUs:`, updatedSkus.map(sku => ({
      salePropPath: sku.salePropPath,
      price: sku.price,
      quantity: sku.quantity,
      isNew: sku.price === "0.00" && sku.quantity === "0"
    })));
    
    setLocalSalesSkus(updatedSkus);
    
    // Update parent state
    updateParentState(updatedSalesAttr, updatedSkus);
    
  }, [localSalesAttr, localSalesSkus, generateAttributeCombinations, updateParentState]);
  
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
      // Find new values by comparing with original attribute values
      const originalAttr = salesAttr[currentAttrKey] || { values: [] };
      const originalValues = originalAttr.values || [];
      const originalValueIds = new Set(originalValues.map(v => v.value));
      
      // Track which values are newly added
      const newValues = currentAttr.values.filter(v => !originalValueIds.has(v.value));
      const newValueIds = newValues.map(v => v.value);
      
      console.log(`Found ${newValues.length} new values`, newValues);
      
      // Ensure all values have a proper value field with unique identifiers
      const updatedValues = currentAttr.values?.map((val, index) => {
        // If value doesn't exist or is just a simple index, generate a proper unique ID
        let valueId = val.value;
        if (!valueId || /^\d+$/.test(valueId) && valueId.length <= 3) {
          // Generate a unique timestamp-based ID similar to the demo data format
          valueId = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
        }
        
        return {
          ...val,
          value: valueId,
          sortOrder: val.sortOrder || String(index)
        };
      });
      
      // Sort values to put new ones at the top
      updatedValues.sort((a, b) => {
        const aIsNew = !originalValueIds.has(a.value);
        const bIsNew = !originalValueIds.has(b.value);
        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;
        return 0;
      });
      
      const updatedAttr = {
        ...currentAttr,
        values: updatedValues
      };
      
      // Apply changes immediately with new value IDs
      applyAttrChanges(updatedAttr, currentAttrKey, newValueIds);
      
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
      
      // Store the original salesSkus for reference before regenerating
      const originalSkus = [...localSalesSkus];
      
      // Re-generate SKUs after attribute deletion - use updatedSalesAttr
      const combinations = generateAttributeCombinations(updatedSalesAttr);
      const updatedSkus = combinations.map(combination => {
        // Create salePropPath from combination with consistent ordering
        // Sort by pid to ensure consistent order like in demo data
        const salePropPath = Object.keys(combination)
          .sort() // Sort pids to ensure consistent order
          .map(pid => `${pid}:${combination[pid]}`)
          .join(';');
        
        // Use the improved function to find existing SKU
        const existingSku = findExistingSku(combination, originalSkus);
        
        if (existingSku) {
          // Return existing SKU with preserved price and quantity, but update salePropPath to new format
          console.log(`Found existing SKU for ${salePropPath} after deletion, preserving price: ${existingSku.price}, quantity: ${existingSku.quantity}`);
          return {
            ...existingSku,
            salePropPath // Update to normalized format
          };
        } else {
          // Create new SKU with default values
          console.log(`Creating new SKU for ${salePropPath} after deletion`);
          return {
            skuId: `sku_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            salePropPath,
            price: "0.00", // Default price for new SKUs with proper decimal format
            quantity: "0" // Default quantity for new SKUs
          };
        }
      });
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
    console.log(info);
    
    // 处理本地文件选择
    if (info.file.status !== 'removed') {
      const file = info.file.originFileObj || info.file;
      
      // 创建本地预览URL
      const localImageUrl = URL.createObjectURL(file);
      
      // Update the current attribute value with new image
      if (currentAttr && currentAttr.values) {
        const newValues = [...currentAttr.values];
        newValues[index] = {
          ...newValues[index],
          image: localImageUrl
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
      
      message.success(`${info.file.name} 文件选择成功`);
    }
  };

  // 阻止自动上传的函数
  const beforeUpload = (file: File) => {
    // 可以在这里添加文件验证逻辑
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return false;
    }
    
    // 返回 false 阻止自动上传
    return false;
  };

  // Add index to salesSkus for form reference and sort to put new items on top
  const dataSource = localSalesSkus
    .map((sku, index) => ({
      ...sku,
      index,
      key: index,
      isNew: newlyAddedValues[`p-${sku.salePropPath?.split(':')[0]}`]?.has(sku.salePropPath?.split(':')[1])
    }))
    .sort((a, b) => {
      // Sort by isNew (new items first)
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    });

  // Helper function to normalize salePropPath for consistent comparison
  const normalizeSalePropPath = (salePropPath: string): string => {
    if (!salePropPath) return '';
    
    // Split into individual pid:value pairs, sort them, and rejoin
    return salePropPath
      .split(';')
      .map(pair => pair.trim())
      .filter(pair => pair.length > 0)
      .sort() // Sort the pairs to ensure consistent order
      .join(';');
  };

  // Helper function to find existing SKU by comparing attribute combinations
  const findExistingSku = (combination: any, originalSkus: SalesSku[]): SalesSku | undefined => {
    // Create normalized salePropPath from combination
    const targetSalePropPath = Object.keys(combination)
      .sort()
      .map(pid => `${pid}:${combination[pid]}`)
      .join(';');
    
    console.log(`Looking for existing SKU with combination:`, combination, `-> salePropPath: ${targetSalePropPath}`);
    
    // Try to find SKU with exact match first
    let existingSku = originalSkus.find(sku => sku.salePropPath === targetSalePropPath);
    
    if (existingSku) {
      console.log(`Found exact match for ${targetSalePropPath}`);
      return existingSku;
    }
    
    // If no exact match, try normalized comparison
    const normalizedTarget = normalizeSalePropPath(targetSalePropPath);
    existingSku = originalSkus.find(sku => {
      const normalizedExisting = normalizeSalePropPath(sku.salePropPath || '');
      return normalizedExisting === normalizedTarget;
    });
    
    if (existingSku) {
      console.log(`Found normalized match for ${targetSalePropPath} -> ${existingSku.salePropPath}`);
      return existingSku;
    }
    
    // If still no match, try component-wise comparison (most robust)
    existingSku = originalSkus.find(sku => {
      if (!sku.salePropPath) return false;
      
      const existingPairs = sku.salePropPath.split(';');
      const targetPairs = targetSalePropPath.split(';');
      
      if (existingPairs.length !== targetPairs.length) return false;
      
      // Convert to sets for comparison
      const existingSet = new Set(existingPairs.map(p => p.trim()).filter(p => p.length > 0));
      const targetSet = new Set(targetPairs.map(p => p.trim()).filter(p => p.length > 0));
      
      if (existingSet.size !== targetSet.size) return false;
      
      // Check if all pairs match
      for (const pair of Array.from(targetSet)) {
        if (!existingSet.has(pair)) return false;
      }
      
      return true;
    });
    
    if (existingSku) {
      console.log(`Found component-wise match for ${targetSalePropPath} -> ${existingSku.salePropPath}`);
      return existingSku;
    }
    
    console.log(`No existing SKU found for combination:`, combination);
    return undefined;
  };

  return (
    <>
      <Card 
        title="销售规格" 
        style={{ marginBottom: 16, maxHeight: 500, overflow: 'auto' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Table 
            dataSource={dataSource} 
            columns={generateColumns()} 
            pagination={false}
            bordered
            scroll={{ x: 'max-content', y: 400 }}
            sticky
          />
        </Space>
      </Card>
      
      {/* Edit Attribute Modal */}
      <Modal
        visible={editModalVisible}
        onOk={handleAttrUpdate}
        onCancel={() => {
          console.log("Modal canceled");
          // Reset any temporary preview changes
          setLocalSalesAttr(salesAttr);
          setEditModalVisible(false);
        }}
        width={580}
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
            <Form.Item >
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
                     {value.image ? (
                     <Space direction="vertical" align="center">
                            <Image 
                              src={value.image} 
                              width={30} 
                              height={30} 
                              style={{ objectFit: 'cover' }} 
                            />
                      </Space>
                     ) :(<></>)}
                    <Input 
                      value={value.text}
                      style={{minWidth: 350}}
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
                      <div>
                        {value.image ? (
                           (
                            <Upload
                                     name="file"
                                     showUploadList={false}
                                     beforeUpload={beforeUpload}
                                     onChange={(info) => handleImageUpload(index, info)}
                                   >
                                     <Button size="small" icon={<UploadOutlined />}>
                                       更换图片
                                     </Button>
                                   </Upload>
                            )
                        ) : (
                          <Upload
                            name="file"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={(info) => handleImageUpload(index, info)}
                          >
                            <Button icon={<UploadOutlined />}>
                              添加图片
                            </Button>
                          </Upload>
                        )}
                      </div>
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
                    // Generate a unique ID for the new value (similar to demo data format)
                    const uniqueId = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
                    newValues.push({ 
                      text: '', 
                      value: uniqueId, // Use unique timestamp-based ID
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