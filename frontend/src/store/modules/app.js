const state = {
  sidebar: {
    opened: true
  },
  alertCount: 0
}

const mutations = {
  TOGGLE_SIDEBAR: (state) => {
    state.sidebar.opened = !state.sidebar.opened
  },
  SET_ALERT_COUNT: (state, count) => {
    state.alertCount = count
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  setAlertCount({ commit }, count) {
    commit('SET_ALERT_COUNT', count)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 