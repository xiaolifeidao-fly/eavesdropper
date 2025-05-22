'use client';

import React, { useState } from 'react';
import { Form, Button, message, Space } from 'antd';
import BasicInfoSection from './BasicInfoSection';
import ProductAttributesSection from './ProductAttributesSection';
import MainImagesSection from './MainImagesSection';
import SalesAttributeDetailsSection from './SalesAttributeDetailsSection';
import ProductDetailsImagesSection from './ProductDetailsImagesSection';
import { DoorSkuDTO } from '@model/door/sku';



interface ProductEditFormProps {
  productData: DoorSkuDTO;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ productData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with product data
  React.useEffect(() => {
    if (productData) {
      form.setFieldsValue({
        baseInfo: productData.baseInfo,
        doorSkuSaleInfo: productData.doorSkuSaleInfo,
        doorSkuImageInfo: productData.doorSkuImageInfo,
      });
    }
  }, [productData, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      console.log('Submitting form with values:', values);
      // Here you would call your API to save the changes
      // await saveSku(values);
      message.success('Product updated successfully');
    } catch (error) {
      console.error('Failed to update product:', error);
      message.error('Failed to update product');
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <BasicInfoSection data={productData.baseInfo} />
      
      <MainImagesSection images={productData.baseInfo.mainImages} />
      
      
      <ProductAttributesSection data={productData.baseInfo.skuItems} />
      
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
        }}
        onUpdateSalesSkus={(updatedSalesSkus) => {
          console.log("Updating sales SKUs:", updatedSalesSkus);
          form.setFieldsValue({
            doorSkuSaleInfo: {
              ...form.getFieldValue('doorSkuSaleInfo'),
              salesSkus: updatedSalesSkus
            }
          });
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