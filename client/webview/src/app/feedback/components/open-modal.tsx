import ShowModal from '@/components/ShowModal'

import ModalCreate from './modal-create'

const TARGET = {
  create: {
    width: 600,
    target: ModalCreate
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
