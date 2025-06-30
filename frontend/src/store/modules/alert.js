const state = {
  show: false,
  type: 'success',
  message: ''
}

const mutations = {
  SHOW_ALERT(state, { type, message }) {
    state.show = true
    state.type = type
    state.message = message
  },
  HIDE_ALERT(state) {
    state.show = false
    state.type = 'success'
    state.message = ''
  }
}

const actions = {
  showAlert({ commit }, { type, message }) {
    commit('SHOW_ALERT', { type, message })
  },
  hideAlert({ commit }) {
    commit('HIDE_ALERT')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}