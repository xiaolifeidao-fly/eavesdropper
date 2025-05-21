'use client'
import React, { useState, MutableRefObject, useEffect } from 'react';
import { Space, Button } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect, ProCard, ProFormList, ProForm, ProFormDigit, ProFormGroup, ProFormMoney } from '@ant-design/pro-components';
import { CloseCircleOutlined, SmileOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { StoreApi } from '@eleapi/store/store';
import { useRouter } from 'next/navigation';

import { getShopList } from '@api/shop/shop.api';
import { PriceRangeConfig, SkuPublishConfig } from "@model/sku/skuTask";
import { ShopStatus } from '@model/shop/shop';
import { MonitorPxxSkuApi } from '@eleapi/door/sku/pxx.sku';


export interface SukPushConfigProp {
  setSourceAccount: (account: number) => void, // 资源账号
  priceRangeConfigFormRef: MutableRefObject<ProFormInstance | undefined>,
  pushConfig: SkuPublishConfig,
  setPushConfig: (pushConfig: SkuPublishConfig) => void
}

const SukPushConfig: React.FC<SukPushConfigProp> = (props) => {
  const store = new StoreApi();
  const [account, setAccount] = useState<number>();
  const router = useRouter();

  useEffect(() => {
    console.log('loading SkuPushConfig...')
    initPriceRangeConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPriceRangeConfig = async () => {
    let priceRangeConfig = await store.getItem(`sku_publish_config`);
    if (!priceRangeConfig) {
      priceRangeConfig = new SkuPublishConfig();
      priceRangeConfig.priceRate = [new PriceRangeConfig(0.01, 1000, 1.1, 0, 'yuan')];
      await store.setItem(`sku_publish_config`, priceRangeConfig);
    }

    props.setPushConfig(priceRangeConfig);
    props.priceRangeConfigFormRef.current?.setFieldsValue({
      priceRangeList: [{
        minPrice: priceRangeConfig.priceRate?.[0]?.minPrice,
        maxPrice: priceRangeConfig.priceRate?.[0]?.maxPrice,
        priceMultiplier: priceRangeConfig.priceRate?.[0]?.priceMultiplier,
        fixedAddition: priceRangeConfig.priceRate?.[0]?.fixedAddition,
        roundTo: priceRangeConfig.priceRate?.[0]?.roundTo
      }]
    });
  }

  return (
    <ProCard
      bordered
      style={{
        height: '100%', // 确保 ProCard 的高度充满容器
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Space size={16}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
          <Button
            icon={<HomeOutlined />}
            type="primary"
            onClick={() => router.push('/')}
          >
            回首页
          </Button>
        </Space>
      </div>
      <ProFormSelect
        name="sourceAccoun"
        label="资源账号"
        placeholder="请选择资源账号"
        fieldProps={{ value: account }}
        onChange={(value: number) => {
          setAccount(value);
          props.setSourceAccount(value);
          store.setItem(`sku_publish_source_account`, value);
        }}
        request={async () => {
          const shopList = await getShopList();
          const sourceList: { value: number, label: string, disabled: boolean }[] = [];
          for (const shop of shopList) {
            let label = shop.name;
            let disabled = false
            // 禁用选择已失效的账号
            if (shop.status === ShopStatus.LosEffective) {
              label = `${label}（已失效）`
              disabled = true
            }
            sourceList.push({
              value: shop.resourceId,
              label: label,
              disabled: disabled
            })
          }
          // 获取上次选择的账号
          const lastAccount = await store.getItem(`sku_publish_source_account`);
          // 判断lastAccount是否在sourceList中
          if (lastAccount && sourceList.find(item => item.value === lastAccount && item.disabled === false)) {
            setAccount(lastAccount);
            props.setSourceAccount(lastAccount);
          } else if (sourceList.length !== 0) {
            // 找到第一个未失效的账号
            const firstValidAccount = sourceList.find(item => item.disabled === false);
            if (firstValidAccount) {
              setAccount(firstValidAccount.value);
              props.setSourceAccount(firstValidAccount.value);
            }
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
              minPrice: props.pushConfig.priceRate?.[0]?.minPrice,
              maxPrice: props.pushConfig.priceRate?.[0]?.maxPrice,
              priceMultiplier: props.pushConfig.priceRate?.[0]?.priceMultiplier,
              fixedAddition: props.pushConfig.priceRate?.[0]?.fixedAddition,
              roundTo: props.pushConfig.priceRate?.[0]?.roundTo
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