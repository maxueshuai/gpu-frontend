const state = {
  servers: [],
  currentServer: null,
  serverStatus: {}
}

const mutations = {
  SET_SERVERS(state, servers) {
    state.servers = servers
  },
  SET_CURRENT_SERVER(state, server) {
    state.currentServer = server
  },
  UPDATE_SERVER_STATUS(state, { serverId, status }) {
    state.serverStatus = {
      ...state.serverStatus,
      [serverId]: status
    }
  }
}

const actions = {
  setServers({ commit }, servers) {
    commit('SET_SERVERS', servers)
  },
  setCurrentServer({ commit }, server) {
    commit('SET_CURRENT_SERVER', server)
  },
  updateServerStatus({ commit }, { serverId, status }) {
    commit('UPDATE_SERVER_STATUS', { serverId, status })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}