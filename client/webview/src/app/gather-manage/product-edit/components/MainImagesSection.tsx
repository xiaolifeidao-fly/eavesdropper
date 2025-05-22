import React, { useState, useEffect } from 'react';
import { Card, Form, Modal, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';

interface MainImagesSectionProps {
  images: string[];
}

const MainImagesSection: React.FC<MainImagesSectionProps> = ({ images = [] }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [imageList, setImageList] = useState<(string | null)[]>([null, null, null, null, null]);

  // Initialize image list with provided images
  useEffect(() => {
    // 过滤掉undefined或空字符串的URL，并确保每个URL都是唯一的
    const validUrls = Array.from(new Set(images.filter(url => url && url.trim() !== '')));
    
    // Create a new array with 5 slots, filling with valid URLs or null
    const initialList = Array(5).fill(null).map((_, i) => i < validUrls.length ? validUrls[i] : null);
    setImageList(initialList);
  }, [images]);
  
  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = (url: string, index: number) => {
    setPreviewImage(url);
    setPreviewVisible(true);
    setPreviewTitle(`Image-${index}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          // Replace the image at the specific index
          const newImages = [...imageList];
          newImages[index] = reader.result.toString();
          setImageList(newImages);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card title="主图" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['baseInfo', 'mainImages']} 
        label="商品主图"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {imageList.map((imageUrl, index) => (
            <div 
              key={`image-slot-${index}`} 
              style={{ 
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{ 
                  width: '104px', 
                  height: '104px', 
                  border: '1px dashed #d9d9d9',
                  borderRadius: '2px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#f5f5f5',
                  cursor: imageUrl ? 'pointer' : 'default'
                }}
                onClick={() => imageUrl && handlePreview(imageUrl, index)}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`Product image ${index}`}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      objectFit: 'contain' 
                    }}
                  />
                ) : (
                  <div style={{ color: '#999' }}>空</div>
                )}
              </div>
              <Button 
                size="small" 
                onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
              >
                替换
                <input
                  id={`image-upload-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  style={{ display: 'none' }}
                />
              </Button>
            </div>
          ))}
        </div>
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