'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { ProFormInstance } from '@ant-design/pro-components';
import { StepsForm, ProFormSelect } from '@ant-design/pro-components';
import { Modal, message, Button } from 'antd';

import ImportSku from './SkuLinkUpload';
import type { LinkInfo } from './SkuLinkUpload';
import SkuPushProgress from './SkuPushProgress';
import type { SkuUrl } from './SkuPushProgress';
import { getResourceSourceList as getResourceSourceListApi } from '@api/resource/resource.api';
import SukPushConfig from './SkuPushConfig';
import { StoreApi } from '@eleapi/store/store';
import { SkuPublishConfig, PriceRangeConfig, SkuTaskOperationType } from "@model/sku/skuTask";

interface PushSkuStepsFormProps {
  taskId?: number;
  setTaskId: (taskId: number) => void;
  operationType: string;
  setOperationType: (operationType: string) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onClose: () => void;
  urls?: string[];
  source?: string;
}

const SkuPushStepsForm: React.FC<PushSkuStepsFormProps> = (props) => {

  const [skuSource, setSkuSource] = useState<string>("pdd");
  const [sourceList, setSourceList] = useState<{}[]>([]); // 链接来源列表
  const [sourceAccount, setSourceAccount] = useState<number>(0);
  const [pushConfig, setPushConfig] = useState<SkuPublishConfig>(new SkuPublishConfig());
  const priceRangeConfigFormRef = useRef<ProFormInstance>();
  const [pushSkuFlag, setPushSkuFlag] = useState(false);
  const [current, setCurrent] = useState(0);
  const [uploadUrlList, setUploadUrlList] = useState<LinkInfo[]>([]); // 链接列表
  const [urls, setUrls] = useState<SkuUrl[]>([]);
  const [onPublishFinish, setOnPublishFinish] = useState(false);

  const store = new StoreApi();

  useEffect(() => {
    console.log('loading SkuPushStepsForm...')
    // 如果任务id存在，则设置任务id, 可能通过重新发布任务和继续执行任务进来
    if (props.taskId && props.operationType) {
      // setOperationType(props.operationType);
      setCurrent(2); // 设置当前步骤为第二步
      setPushSkuFlag(true);
    } else if (props.urls) {
      if (!props.source) {
        message.error('商品来源不能为空');
        return;
      }
      setSkuSource(props.source);
      setUrls(props.urls.map(url => ({ url })));
      setCurrent(1); // 设置当前步骤为第二步
    } else {
      initSource();
      initPriceRangeConfig();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.taskId, props.operationType])

  const initSource = async () => {
    const resourceSourceList = await getResourceSourceListApi();
    const sourceList: {}[] = [];
    for (const resourceSource of resourceSourceList) {
      sourceList.push({
        value: resourceSource.value,
        label: resourceSource.label,
      })
    }
    setSourceList(sourceList);
  }

  const initPriceRangeConfig = async () => {
    const priceRangeConfig = await store.getItem(`sku_publish_config`);
    if (priceRangeConfig) {
      setPushConfig(priceRangeConfig);
    } else {
      const defaultPriceRangeConfig = new SkuPublishConfig();
      defaultPriceRangeConfig.priceRate = [new PriceRangeConfig(0.01, 100, 1.1, 0, 'yuan')];
      setPushConfig(defaultPriceRangeConfig);
    }
  }

  const onCancel = () => {
    // if (taskId > 0) {
    //   store.removeItem(`task_${taskId}`);
    // }
    props.setVisible(false);
    props.setTaskId(0);
    setCurrent(0);
    setUploadUrlList([]);
    setPushSkuFlag(false);
    setUrls([]);
    setOnPublishFinish(false);
    // setPushConfig(new SkuPublishConfig());
    setSourceAccount(0);
    props.onClose(); // 关闭弹窗
  }

  return (
    <>
      <StepsForm
        current={current}
        onCurrentChange={(current) => {
          setCurrent(current);
        }}
        submitter={{
          render: (props) => {
            const lastStep = 2;
            const step = props.step;
            const buttons = [];
            const buttonNextText = step === lastStep ? "确认发布" : "下一步";
            buttons.push(<Button key={`cancel-${step}`} onClick={() => { onCancel() }}>取消</Button>);
            buttons.push(
              <Button
                type="primary" key={`submit-${step}`}
                onClick={() => props.onSubmit?.()} disabled={step === lastStep && !onPublishFinish}>
                {buttonNextText}
              </Button>
            );
            return buttons;
          }
        }}
        containerStyle={{ width: '100%' }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="发布商品"
              width={2000}
              onCancel={onCancel}
              open={props.visible}
              footer={submitter}
              destroyOnClose
            >
              {dom}
            </Modal>
          );
        }}
      >
        {/* 第一步： 导入链接 */}
        <StepsForm.StepForm
          name="import"
          title="导入链接"
          style={{ height: '400px' }}
          onFinish={async () => {
            if (skuSource === "") {
              message.error('请选择商品来源');
              return false;
            }

            if (uploadUrlList.length === 0) {
              message.error('请先导入链接');
              return false;
            }
            const urls: SkuUrl[] = uploadUrlList.map(item => { return { url: item.url } });
            setUrls(urls);
            return true;
          }}
        >
          <ProFormSelect
            name="source"
            label="链接来源"
            placeholder="请选择来源"
            initialValue={skuSource}
            options={sourceList}
            onChange={(value: string) => {
              setSkuSource(value);
            }}
            required
          />
          <ImportSku uploadUrlList={uploadUrlList} setUploadUrlList={setUploadUrlList} />
        </StepsForm.StepForm>

        {/* 发布配置 */}
        <StepsForm.StepForm
          name="config"
          title="发布配置"
          style={{ height: '400px' }}
          onFinish={async () => {
            if (!sourceAccount || sourceAccount === 0) {
              message.error('请选择资源账号');
              return false;
            }

            // 加价区间数据校验
            let isValid = true;
            const data = priceRangeConfigFormRef.current?.getFieldsFormatValue?.();
            const priceRangeList = data.priceRangeList;

            if (Array.isArray(priceRangeList)) {
              // 遍历 priceRangeList 中的每个元素
              priceRangeList.forEach((item, index) => {
                if (
                  item.minPrice === undefined ||
                  item.maxPrice === undefined ||
                  item.priceMultiplier === undefined ||
                  item.fixedAddition === undefined ||
                  item.roundTo === undefined
                ) {
                  isValid = false;
                  console.error(`第 ${index + 1} 项数据不完整`, item);
                }
              })
            }

            if (!isValid) {
              message.error('请确保所有加价区间数据都已填写完整');
              return;
            }

            if (pushSkuFlag) {
              return true;
            }
            setPushSkuFlag(true);

            pushConfig.priceRate = priceRangeList;
            setPushConfig(pushConfig);

            // 保存配置
            store.setItem(`sku_publish_config`, pushConfig);
            return true;
          }}
        >
          <SukPushConfig
            setSourceAccount={setSourceAccount}
            priceRangeConfigFormRef={priceRangeConfigFormRef}
            pushConfig={pushConfig}
            setPushConfig={setPushConfig}
          />
        </StepsForm.StepForm>

        {/* 第二步： 发布进度 */}
        <StepsForm.StepForm
          name="progress"
          title="发布进度"
          style={{ height: '400px' }}
          onFinish={async () => {
            onCancel(); // 关闭弹窗
            message.success('发布完成');
            return false;
          }}
        >
          <SkuPushProgress
            operationType={props.operationType}
            publishStatus={pushSkuFlag}
            publishResourceId={sourceAccount}
            publishConfig={pushConfig}
            skuSource={skuSource}
            urls={urls}
            onPublishFinish={setOnPublishFinish}
            setTaskId={props.setTaskId}
            taskId={props.taskId}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default SkuPushStepsForm;