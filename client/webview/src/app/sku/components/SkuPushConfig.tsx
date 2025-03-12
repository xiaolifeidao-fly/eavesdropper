'use client'
import React, { useState, MutableRefObject } from 'react';
import { Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect, ProCard, ProFormList, ProForm, ProFormDigit, ProFormGroup, ProFormMoney } from '@ant-design/pro-components';
import { CloseCircleOutlined, SmileOutlined } from '@ant-design/icons';

import { getShopList } from '@api/shop/shop.api';
import { PriceRangeConfig } from "@model/sku/skuTask";
export interface SukPushConfigProp {
  setSourceAccount: (account: number) => void, // 资源账号
  priceRangeConfigFormRef: MutableRefObject<ProFormInstance | undefined>,
}

const SukPushConfig: React.FC<SukPushConfigProp> = (props) => {

  const [account, setAccount] = useState<number>();

  return (
    <ProCard
      bordered
      style={{
        height: '100%', // 确保 ProCard 的高度充满容器
        overflow: 'auto',
      }}
    >
      <ProFormSelect
        name="sourceAccoun"
        label="资源账号"
        placeholder="请选择资源账号"
        fieldProps={{ value: account }}
        onChange={(value: number) => {
          setAccount(value);
          props.setSourceAccount(value);
        }}
        request={async () => {
          const shopList = await getShopList();
          const sourceList: { value: number, label: string }[] = [];
          for (const shop of shopList) {
            sourceList.push({
              value: shop.resourceId,
              label: shop.name
            })
          }
          if (sourceList.length !== 0) {
            console.log(sourceList[0]);
            setAccount(sourceList[0].value);
            props.setSourceAccount(sourceList[0].value);
          }
          return sourceList
        }}
        required
      />
      <Space>加价区间</Space>
      <ProForm
        formRef={props.priceRangeConfigFormRef}
        submitter={{ render: (pr, doms) => { return [] } }}
        initialValues={
          {
            priceRangeList: [{
              minPrice: 0.01,
              maxPrice: 1000,
              priceMultiplier: 1.15,
              fixedAddition: 0,
              roundTo: "fen"
            }]
          }
        }
      >
        <ProFormList<PriceRangeConfig>
          name="priceRangeList"
          copyIconProps={{ Icon: SmileOutlined, tooltipText: '复制此项到末尾' }}
          deleteIconProps={{
            Icon: CloseCircleOutlined,
            tooltipText: '不需要这行了',
          }}
        >
          <ProFormGroup key="group">
            <ProFormMoney
              width="sm"
              name="minPrice"
              label="最小值"
              min={0}
              fieldProps={{ precision: 2 }}
            />
            <ProFormMoney
              width="sm"
              name="maxPrice"
              label="最大值"
              min={0}
              fieldProps={{ precision: 2 }}
            />
            <ProFormDigit
              width="xs"
              name="priceMultiplier"
              label="价格乘率"
              min={0}
              max={10}
              fieldProps={{ precision: 2 }}
            />
            <ProFormMoney
              width="sm"
              name="fixedAddition"
              label="加上"
              min={0}
              fieldProps={{ precision: 2 }}
            />
            <ProFormSelect
              width="xs"
              name="roundTo"
              label="保留单位"
              options={[
                { value: 'yuan', label: '元' },
                { value: 'jiao', label: '角' },
                { value: 'fen', label: '分' },
              ]}
            />
          </ProFormGroup>
        </ProFormList>
      </ProForm>
    </ProCard>
  );
}

export default SukPushConfig;