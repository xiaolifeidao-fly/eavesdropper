'use client'
import React, { useEffect, useState } from 'react';
import { Button, Space, Steps, Checkbox, InputNumber, Select, message } from 'antd';
import type { FormProps } from 'antd';
import { ProForm, ProFormSelect, ProCard, ProFormItemRender, ProFormItem, ProFormList, ProFormGroup, ProFormText } from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';

import { getShopList } from '@api/shop/shop.api';
import { SkuPublishConfig, PriceRangeConfig } from "@model/sku/skuTask";

const { Step } = Steps;

export interface SukPushConfigProp {
  setSourceAccount: (account: number) => void,
  priceRangeConfig: PriceRangeConfig | undefined,
  setPriceRangeConfig: (config: PriceRangeConfig | undefined) => void,
}

const SukPushConfig: React.FC<SukPushConfigProp> = (props) => {

  const [account, setAccount] = useState<number>();
  const [sourceList, setSourceList] = useState<{}[]>([]);
  const [priceRangeCheck, setPriceRangeCheck] = useState(true);
  const [current, setCurrent] = useState(0);
  const [responsive, setResponsive] = useState(false);

  useEffect(() => {
    initSourceAccount();
  }, []);

  const initSourceAccount = async () => {
    const shopList = await getShopList();
    const sourceList: {}[] = [];
    for (const shop of shopList) {
      sourceList.push({
        value: shop.resourceId,
        label: shop.name
      })
    }
    setSourceList(sourceList);
  }

  const stepTitles = [
    "请选择资源账号",
    "加价区间"
  ];

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <ProCard
        split={responsive ? 'horizontal' : 'vertical'}
        bordered
        style={{
          height: '100%', // 确保 ProCard 的高度充满容器
        }}
      >
        <ProCard
          colSpan={responsive ? 24 : 4}
        >
          <Steps
            direction={responsive ? 'horizontal' : 'vertical'}
            size="small"
            current={current}
          >
            {stepTitles.map((title, index) => (
              <Step key={index} title={title} />
            ))}
          </Steps>
          <Space>
            <Button
              key="pre"
              onClick={() => setCurrent(current - 1)}
              disabled={current === 0}
            >
              上一步
            </Button>
            <Button
              key="next"
              type="primary"
              onClick={() => {
                if (current == 0) {
                  if (!account || account === 0) {
                    message.error('请选择资源账号');
                    return;
                  }
                }
                setCurrent(current + 1)
              }}
              disabled={current === stepTitles.length - 1}
            >
              下一步
            </Button>
          </Space>
        </ProCard>
        <ProCard>
          {
            current === 0 &&
            <>
              <ProFormSelect
                name="sourceAccoun"
                label="资源账号"
                placeholder="请选择资源账号"
                options={sourceList}
                onChange={(value: number) => {
                  setAccount(value);
                  props.setSourceAccount(value)
                }}
                required
              />
            </>
          }
          {
            current === 1 &&
            <>
              <div>
                <Checkbox
                  defaultChecked={false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setPriceRangeCheck(!checked);
                    if (checked || !props.priceRangeConfig) {
                      const defaultPriceRangeConfig = new PriceRangeConfig(0.01, 200, 1, 0, "yuan");
                      props.setPriceRangeConfig(defaultPriceRangeConfig);
                    }
                  }}
                >
                  <span>价格区间设置:</span>
                </Checkbox>
                <Space>
                  <InputNumber<number>
                    disabled={priceRangeCheck}
                    defaultValue={0.01}
                    min={0.01}
                    step={0.01}
                    onChange={(value) => {
                      if (props.priceRangeConfig) {
                        props.priceRangeConfig.minPrice = value || 0.01;
                        props.setPriceRangeConfig(props.priceRangeConfig);
                      }
                    }}
                  />
                  <span>到</span>
                  <InputNumber<number>
                    disabled={priceRangeCheck}
                    defaultValue={200}
                    min={0.01}
                    step={0.01}
                    onChange={(value) => {
                      if (props.priceRangeConfig) {
                        props.priceRangeConfig.maxPrice = value || 200;
                        props.setPriceRangeConfig(props.priceRangeConfig);
                      }
                    }}
                  />
                  <span>价格乘以</span>
                  <InputNumber<number>
                    disabled={priceRangeCheck}
                    defaultValue={1}
                    min={0}
                    max={1000}
                    step={0.01}
                    onChange={(value) => {
                      if (props.priceRangeConfig) {
                        props.priceRangeConfig.priceMultiplier = value || 1;
                        props.setPriceRangeConfig(props.priceRangeConfig);
                      }
                    }}
                  />
                  <span>加上</span>
                  <InputNumber<number>
                    disabled={priceRangeCheck}
                    defaultValue={0}
                    min={0}
                    step={0.01}
                    onChange={(value) => {
                      if (props.priceRangeConfig) {
                        props.priceRangeConfig.fixedAddition = value || 0.01;
                        props.setPriceRangeConfig(props.priceRangeConfig);
                      }
                    }}
                  />
                  <span>保留到</span>
                  <Select
                    defaultValue={"yuan"}
                    style={{ width: 80 }}
                    disabled={priceRangeCheck}
                    onChange={(value) => {
                      if (props.priceRangeConfig) {
                        props.priceRangeConfig.roundTo = value;
                        props.setPriceRangeConfig(props.priceRangeConfig);
                      }
                    }}
                    options={[
                      { value: 'yuan', label: '元' },
                      { value: 'jiao', label: '角' },
                      { value: 'fen', label: '分' },
                    ]}
                  />
                </Space>
              </div>
            </>
          }
        </ProCard>
      </ProCard>
    </RcResizeObserver>
  );
}

export default SukPushConfig;