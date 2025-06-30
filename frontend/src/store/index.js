import { createStore } from 'vuex'
import user from './modules/user'
import task from './modules/task'
import server from './modules/server'
import alert from './modules/alert'
import app from './modules/app'

const store = createStore({
  state: {
    loading: false,
    error: null
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  },
  getters: {
    isLoading: state => state.loading,
    error: state => state.error
  },
  modules: {
    user,
    task,
    server,
    alert,
    app
  }
})

export default store