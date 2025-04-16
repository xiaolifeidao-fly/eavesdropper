import { createApp } from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App.vue'
import store from './store'
import router from './router'

import icons from './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (import.meta.env.PROD) {
  import('../mock').then(({ mockXHR }) => {
    mockXHR()
  })
}

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

// 注册SVG图标
app.use(icons)

// register global utility filters
Object.keys(filters).forEach(key => {
  app.config.globalProperties.$filters = {
    ...app.config.globalProperties.$filters,
    [key]: filters[key]
  }
})

app.config.globalProperties.$filters = filters

app.use(store)
app.use(router)

app.mount('#app')
