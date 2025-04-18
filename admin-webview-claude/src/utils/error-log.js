import { nextTick } from 'vue'
import store from '@/store'
import { isString, isArray } from '@/utils/validate'
import settings from '@/settings'

// you can set in settings.js
// errorLog:'production' | ['production', 'development']
const { errorLog: needErrorLog } = settings

function checkNeed() {
  const env = import.meta.env.MODE
  if (isString(needErrorLog)) {
    return env === needErrorLog
  }
  if (isArray(needErrorLog)) {
    return needErrorLog.includes(env)
  }
  return false
}

// 导出错误处理程序函数，将在main.js中使用
export function setupErrorHandler(app) {
  if (checkNeed()) {
    app.config.errorHandler = function(err, vm, info) {
      // Vue 3中使用nextTick
      nextTick(() => {
        store.dispatch('errorLog/addErrorLog', {
          err,
          vm,
          info,
          url: window.location.href
        })
        console.error(err, info)
      })
    }
  }
}
