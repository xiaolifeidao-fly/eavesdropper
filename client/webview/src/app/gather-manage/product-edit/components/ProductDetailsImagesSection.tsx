import React, { useState, useRef } from 'react';
import { Card, Form, Modal, message, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, SwapOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from '@hello-pangea/dnd';

interface ImageInfo {
  type: string;
  content: string;
}

interface ProductDetailsImagesSectionProps {
  imageInfos: ImageInfo[];
}

interface DragDropResult {
  source: {
    index: number;
  };
  destination?: {
    index: number;
  };
}

const ProductDetailsImagesSection: React.FC<ProductDetailsImagesSectionProps> = ({ 
  imageInfos = [] 
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [images, setImages] = useState<ImageInfo[]>(
    imageInfos.filter(img => img.type === 'image') || []
  );
  const [form] = Form.useForm();
  const formInstance = Form.useFormInstance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  // Update form whenever images change
  const updateFormImages = (newImages: ImageInfo[]) => {
    setImages(newImages);
    formInstance.setFieldsValue({
      doorSkuImageInfo: {
        ...formInstance.getFieldValue('doorSkuImageInfo'),
        doorSkuImageInfos: newImages
      }
    });
  };

  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const handleReplace = (index: number) => {
    setReplaceIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && replaceIndex !== null) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        message.error('请选择图片文件');
        return;
      }

      // 创建本地URL
      const localUrl = URL.createObjectURL(file);
      
      // 更新图片
      const newImages = [...images];
      newImages[replaceIndex] = {
        ...newImages[replaceIndex],
        content: localUrl
      };
      updateFormImages(newImages);
      
      message.success('图片替换成功');
      console.log('Replaced image at index:', replaceIndex, 'with:', localUrl);
    }
    
    // 重置
    setReplaceIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImage = () => {
    if (addFileInputRef.current) {
      addFileInputRef.current.click();
    }
  };

  const handleAddFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        message.error('请选择图片文件');
        return;
      }

      // 创建本地URL
      const localUrl = URL.createObjectURL(file);
      
      // 添加新图片到数组
      const newImage: ImageInfo = {
        type: 'image',
        content: localUrl
      };
      
      updateFormImages([...images, newImage]);
      
      message.success('图片添加成功');
      console.log('Added new image:', localUrl);
    }
    
    // 清理文件输入框
    if (addFileInputRef.current) {
      addFileInputRef.current.value = '';
    }
  };

  const handleReorder = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    const newImages = Array.from(images);
    const [removed] = newImages.splice(startIndex, 1);
    newImages.splice(endIndex, 0, removed);
    
    updateFormImages(newImages);
    
    // We'd update the form here but since form is not in context, we just log
    console.log('Reordered images:', newImages);
  };

  const handleDelete = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    updateFormImages(newImages);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }
    
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    updateFormImages(newImages);
  };

  return (
    <Card title="商品详情图" style={{ marginBottom: 16 }}>
      <Form.Item 
        name={['doorSkuImageInfo', 'doorSkuImageInfos']}
        label="商品详情图片"
        style={{ 
          zIndex: 100,
          width: 'calc(100% - 48px)', // Adjust width as needed
          maxHeight: 500,
          overflow: 'auto',
          marginBottom: 16 
        }}
      >
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="droppable" direction="vertical">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {images.map((image, index) => (
                  <Draggable key={index} draggableId={`image-${index}`} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: 16,
                          marginBottom: 8,
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          background: '#fff',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img 
                            src={image.content} 
                            alt={`Detail ${index + 1}`}
                            style={{ 
                              width: 80, 
                              height: 80, 
                              objectFit: 'cover',
                              marginRight: 16,
                              cursor: 'pointer'
                            }}
                            onClick={() => handlePreview(image.content)}
                          />
                          <div>
                            <Space>
                              <Button
                                icon={<ArrowUpOutlined />}
                                disabled={index === 0}
                                onClick={() => handleMove(index, 'up')}
                                title="上移"
                              />
                              <Button
                                icon={<ArrowDownOutlined />}
                                disabled={index === images.length - 1}
                                onClick={() => handleMove(index, 'down')}
                                title="下移"
                              />
                              <Button
                                icon={<SwapOutlined />}
                                onClick={() => handleReplace(index)}
                                title="替换图片"
                              />
                              <Button 
                                danger 
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(index)}
                                title="删除"
                              />
                            </Space>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <Button 
          type="dashed" 
          style={{ width: '100%', marginTop: 16 }} 
          icon={<PlusOutlined />}
          onClick={handleAddImage}
        >
          添加详情图
        </Button>
      </Form.Item>

      {/* 隐藏的文件输入框 - 替换用 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 隐藏的文件输入框 - 添加用 */}
      <input
        ref={addFileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAddFileChange}
      />

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default ProductDetailsImagesSection; 