import { createApp } from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import '@/styles/index.scss' // global css

import App from './App.vue'
import store from './store'
import router from './router'

import 'virtual:svg-icons-register' // Import for vite-plugin-svg-icons

import './permission' // permission control - Needs review for Vue 3 compatibility
import { setupErrorHandler } from './utils/error-log' // Import setup function
import SvgIcon from '@/components/SvgIcon/index.vue' // Import SvgIcon component

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

// Register global components
app.component('svg-icon', SvgIcon)

// Setup global error handler
setupErrorHandler(app)

app.use(store)
app.use(router)

app.mount('#app')
