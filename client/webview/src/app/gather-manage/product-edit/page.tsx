'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Spin, message } from 'antd';
import ProductEditForm from './components/ProductEditForm';
import { getDoorRecord, parseSku } from '@api/door/door.api';
import { DoorSkuDTO } from '@model/door/sku';

const { Title } = Typography;

// Update the interface to match what ProductEditForm expects

export default function ProductEditPage() {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const itemKey = params.get('itemId');
        if(!itemKey){
          return;
        }
        setLoading(true);
        // This is just for demo purposes - in a real app, you'd get the source and params from query params or context
        const source = 'pdd';
        const doorKey = "PxxSkuMonitor";
        const type = source;
        const skuResult = await getDoorRecord(doorKey, itemKey, type);
        if(!skuResult){
          return;
        }
        const result = await parseSku(source, JSON.parse(skuResult.data));
        if (result) {
          // Transform DoorSkuDTO to match ProductData interface
          setProductData(result);
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
    console.log("productData", productData)
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