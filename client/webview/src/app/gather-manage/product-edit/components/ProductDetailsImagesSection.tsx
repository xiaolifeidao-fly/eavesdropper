import React, { useState } from 'react';
import { Card, Form, Modal, message, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
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

  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
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
    
    setImages(newImages);
    
    // We'd update the form here but since form is not in context, we just log
    console.log('Reordered images:', newImages);
  };

  const handleDelete = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
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
    setImages(newImages);
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
                              />
                              <Button
                                icon={<ArrowDownOutlined />}
                                disabled={index === images.length - 1}
                                onClick={() => handleMove(index, 'down')}
                              />
                              <Button 
                                danger 
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(index)}
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
          onClick={() => {
            message.info('Add image functionality would be implemented here');
          }}
        >
          添加详情图
        </Button>
      </Form.Item>

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