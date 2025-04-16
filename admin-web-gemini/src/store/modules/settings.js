// import variables from '@/styles/element-variables.scss' // Removed
import defaultSettings from '@/settings'

// Destructure theme along with other settings
const { showSettings, tagsView, fixedHeader, sidebarLogo, theme } = defaultSettings

const state = {
  theme: theme, // Use theme from defaultSettings
  showSettings: showSettings,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

