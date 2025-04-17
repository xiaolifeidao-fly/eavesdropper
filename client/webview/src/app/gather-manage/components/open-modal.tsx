import ShowModal from '@/components/ShowModal'

import ModalCreate from './modal-create'
import GatherTool from './gather-tool'
const TARGET = {
  create: {
    title: '创建采集',
    width: 600,
    target: ModalCreate
  },
  gatherTool: {
    title: '采集工具',
    width: 400,
    target: GatherTool
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
