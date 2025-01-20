'use client'
import React from 'react';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

import { LabelValue } from '@model/base/base';
import { updateResource as updateResourceApi } from '@api/resource/resource.api';
import { UpdateResourceReq } from '@model/resource/resource';

type UpdateResourceForm = {
  source: string;
  tag: string;
  remark: string;
}

export type UpdateResourceModalProps = {
  id: number;
  form: UpdateResourceForm;
  sources: LabelValue[];
  tags: LabelValue[];
  onFinish: () => void;
}

export const UpdateResourceModal = (props: UpdateResourceModalProps) => {
  const [form] = Form.useForm<UpdateResourceForm>();

  return (
    <ModalForm<UpdateResourceForm>
      title="修改资源"
      trigger={<Button key="edit" type="link" style={{ paddingRight: 0, paddingLeft: 0 }}>修改</Button>}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        const req = new UpdateResourceReq(values.tag, values.remark)
        const result = await updateResourceApi(props.id, req)
        if (result) {
          message.success('修改成功');
          props.onFinish()
          return true;
        }
        props.onFinish();
        message.error('修改失败');
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
        initialValue={props.form.source}
        disabled
        colProps={{
          span: 24,
        }}
      />

      <ProFormSelect
        name="tag"
        label="标签"
        placeholder="请选择标签"
        options={props.tags}
        initialValue={props.form.tag}
      />

      <ProFormText
        name="remark"
        label="备注"
        placeholder="请输入备注"
        initialValue={props.form.remark}
      />
    </ModalForm>
  );
};

export default UpdateResourceModal;