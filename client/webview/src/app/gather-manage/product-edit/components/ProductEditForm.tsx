'use client';

import React, { useState } from 'react';
import { Form, Button, message, Space } from 'antd';
import BasicInfoSection from './BasicInfoSection';
import ProductAttributesSection from './ProductAttributesSection';
import MainImagesSection from './MainImagesSection';
import SalesAttributeDetailsSection from './SalesAttributeDetailsSection';
import ProductDetailsImagesSection from './ProductDetailsImagesSection';
import { DoorSkuDTO } from '@model/door/sku';
import { SkuItem } from '@model/door/sku';

interface ProductEditFormProps {
  productData: DoorSkuDTO;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ productData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with product data
  React.useEffect(() => {
    if (productData) {
      // Prepare productAttributes structure for the new editable format
      const productAttributes: { [key: string]: string[] } = {};
      if (productData.baseInfo.skuItems && Array.isArray(productData.baseInfo.skuItems)) {
        productData.baseInfo.skuItems.forEach(item => {
          if (item.value && Array.isArray(item.text)) {
            productAttributes[item.value] = item.text;
          }
        });
      }

      form.setFieldsValue({
        baseInfo: productData.baseInfo,
        doorSkuSaleInfo: productData.doorSkuSaleInfo,
        doorSkuImageInfo: productData.doorSkuImageInfo,
        productAttributes: productAttributes,
      });
    }
  }, [productData, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Get the latest form values to ensure we have all changes
      const allFormValues = form.getFieldsValue();
      console.log('Current form values from getFieldsValue:', allFormValues);
      console.log('Submitting form with values from onFinish:', values);
      
      // Ensure we have the latest product attributes and sales info
      const latestBaseInfo = allFormValues.baseInfo || {};
      const latestDoorSkuSaleInfo = allFormValues.doorSkuSaleInfo || {};
      
      // Deep merge salesAttr to preserve all attributes
      const mergedSalesAttr = {
        ...productData.doorSkuSaleInfo.salesAttr,
        ...latestDoorSkuSaleInfo.salesAttr,
        ...values.doorSkuSaleInfo?.salesAttr
      };
      
      // Deep merge salesSkus to preserve all SKU properties
      const originalSalesSkus = productData.doorSkuSaleInfo.salesSkus || [];
      const latestSalesSkus = latestDoorSkuSaleInfo.salesSkus || [];
      const valuesSalesSkus = values.doorSkuSaleInfo?.salesSkus || [];
      
      // Use the latest salesSkus if available, otherwise fall back to original
      const mergedSalesSkus = latestSalesSkus.length > 0 ? latestSalesSkus : 
                             valuesSalesSkus.length > 0 ? valuesSalesSkus : 
                             originalSalesSkus;
      
      // Merge both values to ensure we have the latest data
      const finalValues = {
        ...productData, // Start with original data
        ...allFormValues, // Apply form changes
        ...values, // Apply latest values from onFinish
        baseInfo: {
          ...productData.baseInfo,
          ...latestBaseInfo,
          ...values.baseInfo,
          
          // Ensure skuItems (product attributes) are from the latest form state
          skuItems: latestBaseInfo.skuItems || productData.baseInfo.skuItems
        },
        doorSkuSaleInfo: productData.doorSkuSaleInfo
      };
      
      console.log('Final merged values:', finalValues);
      console.log('Product attributes (skuItems):', finalValues.baseInfo.skuItems);
      console.log('Sales attributes (salesAttr):', finalValues.doorSkuSaleInfo.salesAttr);
      console.log('Sales SKUs (salesSkus):', finalValues.doorSkuSaleInfo.salesSkus);
      console.log('Total salesAttr keys:', Object.keys(finalValues.doorSkuSaleInfo.salesAttr || {}).length);
      console.log('Total salesSkus count:', finalValues.doorSkuSaleInfo.salesSkus?.length || 0);
      
      // Here you would call your API to save the changes
      // await saveSku(finalValues);
      message.success('Product updated successfully');
    } catch (error) {
      console.error('Failed to update product:', error);
      message.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Handle product attributes changes
  const handleProductAttributesChange = (updatedSkuItems: SkuItem[]) => {
    console.log('Product attributes updated:', updatedSkuItems);
    
    // Ensure updatedSkuItems is an array
    if (!Array.isArray(updatedSkuItems)) {
      console.warn('updatedSkuItems is not an array:', updatedSkuItems);
      return;
    }
    
    const currentBaseInfo = form.getFieldValue('baseInfo') || {};
    form.setFieldsValue({
      baseInfo: {
        ...currentBaseInfo,
        skuItems: updatedSkuItems
      }
    });
  };

  if (!productData) {
    return <div>No product data available</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        baseInfo: productData.baseInfo,
        doorSkuSaleInfo: productData.doorSkuSaleInfo,
        doorSkuImageInfo: productData.doorSkuImageInfo,
        productAttributes: (() => {
          const productAttributes: { [key: string]: string[] } = {};
          if (productData.baseInfo.skuItems && Array.isArray(productData.baseInfo.skuItems)) {
            productData.baseInfo.skuItems.forEach(item => {
              if (item.value && Array.isArray(item.text)) {
                productAttributes[item.value] = item.text;
              }
            });
          }
          return productAttributes;
        })(),
      }}
    >
      <BasicInfoSection data={productData.baseInfo} />
      
      <MainImagesSection images={productData.baseInfo.mainImages} />
      
      
      <ProductAttributesSection 
        data={Array.isArray(productData.baseInfo.skuItems) ? productData.baseInfo.skuItems : []} 
        onChange={handleProductAttributesChange}
      />
      
      <SalesAttributeDetailsSection 
        salesAttr={productData.doorSkuSaleInfo.salesAttr}
        salesSkus={productData.doorSkuSaleInfo.salesSkus}
        onUpdateSalesAttr={(updatedSalesAttr) => {
          console.log("Updating sales attributes:", updatedSalesAttr);
          form.setFieldsValue({
            doorSkuSaleInfo: {
              ...form.getFieldValue('doorSkuSaleInfo'),
              salesAttr: updatedSalesAttr
            }
          });
          productData.doorSkuSaleInfo.salesAttr = updatedSalesAttr;
        }}
        onUpdateSalesSkus={(updatedSalesSkus) => {
          console.log("Updating sales SKUs:", updatedSalesSkus);
          form.setFieldsValue({
            doorSkuSaleInfo: {
              ...form.getFieldValue('doorSkuSaleInfo'),
              salesSkus: updatedSalesSkus
            }
          });
          productData.doorSkuSaleInfo.salesSkus = updatedSalesSkus;

        }}
      />
      
      <ProductDetailsImagesSection 
        imageInfos={productData.doorSkuImageInfo.doorSkuImageInfos}
      />
      
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductEditForm; 