import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Space, Select, message } from 'antd'

interface ModalCreateProps {
  data?: any
  hideModal: () => void
  onSuccess?: () => void
}

interface FromInfo {
  name: string
  source: string
  resourceId: number
}

const ModalCreate = (props: ModalCreateProps) => {
  const [form] = Form.useForm<FromInfo>()
  const { hideModal, onSuccess, data } = props

  const [sourceList, setSourceList] = useState<any[]>([])
  const [resourceList, setResourceList] = useState<any[]>([])
  const [isUpdate, setIsUpdate] = useState(false)

  useEffect(() => {
  }, [])


  return (
    <></>
  )
}

export default ModalCreate
