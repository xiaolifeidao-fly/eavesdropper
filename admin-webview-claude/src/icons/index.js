// 使用Vite方式导入SVG图标
import SvgIcon from '@/components/SvgIcon/index.vue'

const svgFiles = import.meta.glob('./svg/*.svg', { eager: true })

// 提取图标名称
const iconNames = Object.keys(svgFiles).map(key => {
  const name = key.replace(/^\.\/svg\//, '').replace(/\.svg$/, '')
  return name
})

export default {
  install(app) {
    // 注册SvgIcon组件
    app.component('svg-icon', SvgIcon)
  }
}
