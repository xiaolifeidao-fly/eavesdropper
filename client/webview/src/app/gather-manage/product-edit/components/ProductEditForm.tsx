'use client';

import React, { useState } from 'react';
import { Form, Button, message, Space } from 'antd';
import BasicInfoSection from './BasicInfoSection';
import ProductAttributesSection from './ProductAttributesSection';
import MainImagesSection from './MainImagesSection';
import SalesAttributesSection from './SalesAttributesSection';
import SalesAttributeDetailsSection from './SalesAttributeDetailsSection';
import ProductDetailsImagesSection from './ProductDetailsImagesSection';


interface ProductData {
  data: {
    baseInfo: any;
    doorSkuSaleInfo: any;
    doorSkuImageInfo: any;
  }
}

interface ProductEditFormProps {
  productData: ProductData;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ productData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with product data
  React.useEffect(() => {
    if (productData?.data) {
      form.setFieldsValue({
        baseInfo: productData.data.baseInfo,
        doorSkuSaleInfo: productData.data.doorSkuSaleInfo,
        doorSkuImageInfo: productData.data.doorSkuImageInfo,
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

  if (!productData?.data) {
    return <div>No product data available</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        baseInfo: productData.data.baseInfo,
        doorSkuSaleInfo: productData.data.doorSkuSaleInfo,
        doorSkuImageInfo: productData.data.doorSkuImageInfo,
      }}
    >
      <BasicInfoSection data={productData.data.baseInfo} />
      
      <ProductAttributesSection data={productData.data.baseInfo.skuItems} />
      
      <MainImagesSection images={productData.data.baseInfo.mainImages} />
      
      <SalesAttributesSection 
        salesAttr={productData.data.doorSkuSaleInfo.salesAttr}
        price={productData.data.doorSkuSaleInfo.price}
        quantity={productData.data.doorSkuSaleInfo.quantity}
      />
      
      <SalesAttributeDetailsSection 
        salesAttr={productData.data.doorSkuSaleInfo.salesAttr}
        salesSkus={productData.data.doorSkuSaleInfo.salesSkus}
      />
      
      <ProductDetailsImagesSection 
        imageInfos={productData.data.doorSkuImageInfo.doorSkuImageInfos}
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