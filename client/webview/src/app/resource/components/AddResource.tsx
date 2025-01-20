'use client'
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

import { LabelValue } from '@model/base/base';
import { addResource as addResourceApi } from '@api/resource/resource.api';
import { AddResourceReq } from '@model/resource/resource';

type AddResourceForm = {
  source: string;
  tag: string;
  remark: string;
}

export type AddResourceModalProps = {
  sources: LabelValue[];
  tags: LabelValue[];
  onFinish: () => void;
}

export const AddResourceModal = (props: AddResourceModalProps) => {
  const [form] = Form.useForm<AddResourceForm>();
  return (
    <ModalForm<AddResourceForm>
      title="添加资源"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          添加资源
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        const req = new AddResourceReq(values.source, values.tag, values.remark)
        const result = await addResourceApi(req)
        if (result) {
          message.success('添加成功');
          props.onFinish()
          return true;
        }
        props.onFinish();
        message.error('添加失败');
        return false;
      }}
      layout="horizontal"
      grid
    >
      <ProFormSelect
        name="source"
        label="类型"
        placeholder="请选择类型"
        options={props.sources}
        colProps={{
          span: 24,
        }}
      />

      <ProFormSelect
        name="tag"
        label="标签"
        placeholder="请选择标签"
        options={props.tags}
      />

      <ProFormText
        name="remark"
        label="备注"
        placeholder="请输入备注"
      />
    </ModalForm>
  );
};

export default AddResourceModal;