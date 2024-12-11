'use client';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';

import { userPage } from '@api/auth/user.api'

const searchLabels = [
  {
    label: '手机号',
    key: 'mobile',
  }
]

const AdvancedSearchForm = () => {
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

  const getFields = () => {
    const count = expand ? 10 : 6;
    const children = [];

    for (let i = 0; i < count; i++) {
      if (i >= searchLabels.length) {
        break;
      }

      const { label, key } = searchLabels[i];

      children.push(
        <Col span={8} key={i}>
          <Form.Item
            name={key}
            label={label}
          >
            <Input placeholder="关键词搜索" />
          </Form.Item>
        </Col>,
      );
    }
    return children;
  };

  const onFinish = (values: any) => {
    const { mobile } = values;
    userPage({mobile, current: 1, pageSize: 10}).then(res => {
      console.log(res);
    })
  };

  return (
    <Form form={form} name="advanced_search" style={{ padding: 24 }} onFinish={onFinish}>
      <Row gutter={24}>{getFields()}</Row>
      <div style={{ textAlign: 'right' }}>
        <Space size="small">
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >
            清空
          </Button>
          {
            searchLabels.length > 6 && (
              <a
                style={{ fontSize: 12 }}
                onClick={() => {
                  setExpand(!expand);
                }}
              >
                <DownOutlined rotate={expand ? 180 : 0} /> 展开
              </a>
            )
          }
        </Space>
      </div>
    </Form>
  );
};

export default AdvancedSearchForm