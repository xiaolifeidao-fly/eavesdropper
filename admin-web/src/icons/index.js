import SvgIcon from '@/components/SvgIcon/index.vue'// svg component

// 自动导入所有的SVG文件
const svgFiles = import.meta.glob('./svg/*.svg')
const svgModules = {}

// 预加载所有SVG
for (const path in svgFiles) {
  const name = path.replace('./svg/', '').replace('.svg', '')
  svgModules[name] = svgFiles[path]
}

export default {
  install(app) {
    // 全局注册组件
    app.component('svg-icon', SvgIcon)
  }
}
