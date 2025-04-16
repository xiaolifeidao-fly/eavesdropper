import { createStore } from 'vuex'
import getters from './getters'

// 使用Vite的方式动态导入模块
const modulesFiles = import.meta.globEager('./modules/*.js')

// 自动导入modules下的所有vuex模块
const modules = {}
for (const path in modulesFiles) {
  const moduleName = path.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')
  modules[moduleName] = modulesFiles[path].default
}

const store = createStore({
  modules,
  getters
})

export default store
