// import Vue from 'vue' // Removed
// import Vuex from 'vuex' // Removed
import { createStore } from 'vuex' // Added createStore
import getters from './getters'

// Vue.use(Vuex) // Removed

// Load modules using Vite's import.meta.glob
// Use eager: true to load modules synchronously, similar to require.context
// Adjust the path pattern if necessary
const modulesFiles = import.meta.glob('./modules/*.js', { eager: true })

const modules = {}
for (const path in modulesFiles) {
  // Extract module name from path: ./modules/app.js -> app
  const moduleName = path.replace(/^\.\/modules\/(.*)\.js$/, '$1')
  modules[moduleName] = modulesFiles[path].default
}

const store = createStore({ // Changed to createStore
  modules,
  getters
})

export default store
