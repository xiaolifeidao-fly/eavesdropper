'use client'
import React from 'react';
import { List, Button, Progress } from 'antd';
import { FileOutlined, DeleteOutlined } from '@ant-design/icons';

export interface UploadFile {
  uid: string;
  name: string;
  urlCount: number;
  uploading: boolean;
  error: boolean;
}

interface FileUploadListProps {
  uploadFileList: UploadFile[];
  onDelete: (item: UploadFile, index: number) => void;
}

const FileUploadList = ({ uploadFileList, onDelete }: FileUploadListProps) => {
  return (
    <List
      locale={{ emptyText: '暂无文件' }}
      dataSource={uploadFileList}
      renderItem={(item, index) => (
        <List.Item key={index}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <FileOutlined style={{ fontSize: 18, marginRight: 10 }} />
            <span style={{ flex: 1 }}>{item.name}</span>
            <span style={{ color: item.error ? 'red' : 'green', marginRight: 10 }}>
              {item.error ? '上传失败' : '上传完成'}
            </span>
            <span style={{ marginRight: 10 }}>总数：{item.urlCount}</span>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => onDelete(item, index)}
              disabled={item.uploading}
            >
              删除
            </Button>
          </div>
        </List.Item>
      )}
    />
  );
};

export default FileUploadList;