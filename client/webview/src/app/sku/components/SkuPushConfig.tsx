'use client'
import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import { Button, Space, Steps, message } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProFormSelect, ProCard, ProFormList, ProForm, ProFormDigit, ProFormGroup, ProFormMoney } from '@ant-design/pro-components';
import { CloseCircleOutlined, SmileOutlined } from '@ant-design/icons';

import { getShopList } from '@api/shop/shop.api';
import { PriceRangeConfig } from "@model/sku/skuTask";

const { Step } = Steps;

export interface SukPushConfigProp {
  setSourceAccount: (account: number) => void, // 资源账号
  priceRangeConfigFormRef: MutableRefObject<ProFormInstance | undefined>,
}

const SukPushConfig: React.FC<SukPushConfigProp> = (props) => {

  const [account, setAccount] = useState<number>();
  const [sourceList, setSourceList] = useState<{}[]>([]);
  const [current, setCurrent] = useState(0);

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
    <ProCard
      bordered
      style={{
        height: '100%', // 确保 ProCard 的高度充满容器
      }}
    >
      <ProCard
        colSpan={4}
      >
        <Steps
          direction={"vertical"}
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
            <ProForm
              formRef={props.priceRangeConfigFormRef}
              submitter={{ render: (pr, doms) => { return [] } }}
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
          </>
        }
      </ProCard>
    </ProCard>
  );
}

export default SukPushConfig;