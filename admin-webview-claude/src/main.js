import { createApp } from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import '@/styles/index.scss' // global css

import App from './App.vue'
import store from './store'
import router from './router'

import svgIcon from './icons' // icon
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
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

const app = createApp(App)

// 注册svg图标
app.use(svgIcon)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, {
  locale: zhCn,
  size: Cookies.get('size') || 'default' // set element-ui default size
})

// 注册全局过滤器为全局属性
Object.keys(filters).forEach(key => {
  app.config.globalProperties[`$${key}`] = filters[key]
})

app.use(store)
app.use(router)
app.mount('#app')
