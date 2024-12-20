import React from 'react';
import { Tabs, message, Upload, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;
const { TextArea } = Input;

const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const ImportSku: React.FC = () => {
  const importLinkTabs = () => {
    return [
      {
        key: 'excel-import',
        label: 'excel导入',
        children: <>
          <div style={{ height: '300px' }}>
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
              <p className="ant-upload-hint">支持xlsx、xls、csv文件</p>
            </Dragger>
          </div>
        </>,
      },
      {
        key: 'link-import',
        label: '链接导入',
        children: <>
          <TextArea
            placeholder="请输入商品链接,每行一个"
            style={{ height: '300px', resize: 'none' }}
          />
        </>,
      }
    ]
  }

  return (
    <>
      <Tabs defaultActiveKey="excel-import" items={importLinkTabs()} />
    </>
  )
}

export default ImportSku;