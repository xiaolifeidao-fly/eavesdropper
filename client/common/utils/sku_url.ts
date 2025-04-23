import { PDD, TB } from '@enums/source'

const tb_url = 'https://item.taobao.com/item.htm?id='
const pdd_url = 'https://mobile.yangkeduo.com/goods1.html?goods_id='

const getSkuUrl = (source: string, skuId: string) => {
  switch (source) {
    case PDD:
      return `${pdd_url}${skuId}`
    case TB:
      return `${tb_url}${skuId}`
    default:
      return ''
  }
}

export { getSkuUrl }