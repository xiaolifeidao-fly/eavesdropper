// 开发环境导入组件
export default file => {
  // 使用Vite的动态导入
  const modules = import.meta.glob('../views/**/*.vue')
  const path = `../views${file}.vue`
  return modules[path]
}
