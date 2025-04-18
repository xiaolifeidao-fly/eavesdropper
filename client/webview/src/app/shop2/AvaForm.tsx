'use client';
import { Button, Col, Form, Input, Row, Select, Space, theme } from 'antd';
import { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';

const { Option } = Select;

const searchLabels = [
    '名称'
]

const AdvancedSearchForm = () => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [expand, setExpand] = useState(false);
  
    const formStyle: React.CSSProperties = {
      maxWidth: 'none',
      background: token.colorFillAlter,
      borderRadius: token.borderRadiusLG,
      padding: 24,
    };
  
    const getFields = () => {
      const count = searchLabels.length;
      const children = [];
      for (let i = 0; i < count; i++) {
        children.push(
          <Col span={8} key={i}>
            {i % 3 !== 1 ? (
              <Form.Item
                name={`field-${i}`}
                label={searchLabels[i]}
                rules={[
                  {
                    required: true,
                    message: '请输入搜索内容',
                  },
                ]}
              >
                <Input placeholder="关键词搜索" />
              </Form.Item>
            ) : (
              <Form.Item
                name={`field-${i}`}
                label={searchLabels[i]}
                rules={[
                  {
                    required: true,
                    message: '请输入内容',
                  },
                ]}
                initialValue="1"
              >
                <Select>
                  <Option value="1">
                    电影
                  </Option>
                  <Option value="2">电视剧</Option>
                </Select>
              </Form.Item>
            )}
          </Col>,
        );
      }
      return children;
    };
  
    const onFinish = (values: any) => {
      console.log('Received values of form: ', values);
    };
  
    return (
      <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
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
          </Space>
        </div>
      </Form>
    );
  };

export default AdvancedSearchForm