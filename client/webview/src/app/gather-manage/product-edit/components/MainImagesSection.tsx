import React, { useState } from 'react';
import { Card, Form, Upload, Modal, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface MainImagesSectionProps {
  images: string[];
}

const MainImagesSection: React.FC<MainImagesSectionProps> = ({ images = [] }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const fileList: UploadFile[] = images.map((url, index) => ({
    uid: `-${index}`,
    name: `image-${index}.png`,
    status: 'done',
    url,
  }));

  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = file.url || '';
    }

    setPreviewImage(file.url || file.preview || '');
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <Card title="主图" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['baseInfo', 'mainImages']} 
        label="商品主图"
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e && e.fileList;
        }}
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          beforeUpload={() => false}
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
      </Form.Item>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default MainImagesSection; 