'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Spin } from 'antd';
import ProductEditForm from './components/ProductEditForm';
import { parseSku } from '@api/door/door.api';
import { DoorSkuDTO } from '@model/door/sku';

const { Title } = Typography;

// Update the interface to match what ProductEditForm expects
interface ProductData {
  data: {
    baseInfo: any;
    doorSkuSaleInfo: any;
    doorSkuImageInfo: any;
  }
}

export default function ProductEditPage() {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // This is just for demo purposes - in a real app, you'd get the source and params from query params or context
        const source = 'pdd';
        const params = { itemId: '720259418561' };
        
        const result = await parseSku(source, params);
        console.log(result);
        if (result) {
          // Transform DoorSkuDTO to match ProductData interface
          setProductData({
            data: {
              baseInfo: result.baseInfo,
              doorSkuSaleInfo: result.doorSkuSaleInfo,
              doorSkuImageInfo: result.doorSkuImageInfo
            }
          });
        } else {
          setError('No product data found');
        }
      } catch (err) {
        console.error('Failed to fetch product data:', err);
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading product data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ margin: '24px' }}>
        <Typography.Text type="danger">{error}</Typography.Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>商品微调</Title>
      {productData && <ProductEditForm productData={productData} />}
    </div>
  );
} 