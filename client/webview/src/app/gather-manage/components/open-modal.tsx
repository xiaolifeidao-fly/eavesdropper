import ShowModal from '@/components/ShowModal'

import ModalCreate from './modal-create'
import GatherTool from './gather-tool'
const TARGET = {
  create: {
    title: '创建采集批次',
    width: 600,
    target: ModalCreate
  },
  update: {
    title: '修改采集批次',
    width: 600,
    target: ModalCreate
  },
  gatherTool: {
    title: '采集工具',
    width: 300,
    target: GatherTool,
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      margin: 0,
      padding: 0,
      height: '100vh',
      overflow: 'hidden'
    },
    className: 'gather-tool-modal'
  }
}

interface OpenModalProps {
  params: {
    type: string
    data?: any
    className?: string
    hideModal: () => void
    onSuccess?: () => void
    openModal?: (type: string, data?: any) => void
  }
}

function OpenModal(props: OpenModalProps) {
  return <ShowModal params={Object.assign({}, props.params, { targetMap: TARGET })} />
}

export default OpenModal
