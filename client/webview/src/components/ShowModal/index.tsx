import React from 'react'
import { Modal } from 'antd'

function ShowModal(props: any) {
  const { hideModal, type, targetMap } = props.params
  if (!type) return null
  const Class = type ? targetMap[type] : null

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
