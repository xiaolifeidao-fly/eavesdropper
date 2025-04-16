// import Vue from 'vue' // Removed
import { nextTick } from 'vue' // Import nextTick
import store from '@/store'
import { isString, isArray } from '@/utils/validate'
import settings from '@/settings'

// you can set in settings.js
// errorLog:'production' | ['production', 'development']
const { errorLog: needErrorLog } = settings

function checkNeed() {
  // Use import.meta.env.MODE for Vite environment
  const env = import.meta.env.MODE 
  // console.log('Current env mode:', env)
  // console.log('Need error log setting:', needErrorLog)
  if (isString(needErrorLog)) {
    return env === needErrorLog
  }
  if (isArray(needErrorLog)) {
    return needErrorLog.includes(env)
  }
  return false
}

// Export a setup function to be called in main.js
export function setupErrorHandler(app) {
  if (checkNeed()) {
    app.config.errorHandler = (err, instance, info) => {
      // Don't ask me why I use nextTick, it just a hack.
      // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
      // Might not be necessary in Vue 3?
      nextTick(() => {
        // Try to get component name
        const componentName = instance?.type?.__name || // <script setup> name
                              instance?.type?.name ||   // Options API name
                              'UnknownComponent'

        console.error(`Error in ${componentName} (${info}):`, err);

        store.dispatch('errorLog/addErrorLog', {
          err,
          // vm, // Removed vm
          instanceInfo: { // Pass relevant instance info if needed, carefully
              name: componentName,
              // props: instance?.props, // Avoid passing large objects if possible
          },
          info, // Error type (e.g., "render function", "created hook")
          url: window.location.href
        })
        // console.error(err, info) // Original console logging
      })
    }
  }
}
