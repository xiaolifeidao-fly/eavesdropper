import React, { useEffect } from 'react'
import { Modal } from 'antd'
import './style.css'

function ShowModal(props: any) {
  const { hideModal, type, targetMap } = props.params
  
  useEffect(() => {
    if (!type) return;
    
    // 当Modal是gatherTool时，为整个Modal添加自定义样式
    if (type === 'gatherTool') {
      const modalRoot = document.querySelector('.ant-modal-root');
      if (modalRoot) {
        modalRoot.classList.add('gather-tool-modal-root');
      }
      
      // 清理函数
      return () => {
        if (modalRoot) {
          modalRoot.classList.remove('gather-tool-modal-root');
        }
      };
    }
  }, [type]);
  
  if (!type) return null;
  
  const Class = targetMap[type];

  return (
    <Modal
      width={Class.width}
      title={Class.title}
      className={Class.className}
      open={!!type}
      onCancel={hideModal}
      footer={null}
      maskClosable={false}
      destroyOnClose
      style={Class.style}>
      <Class.target {...props.params} />
    </Modal>
  )
}

export default ShowModal
