import { getGpuList, getGpuInfo, updateGpuConfig, getGpuMetrics } from '@/api/gpu'

const state = {
  gpuList: [],
  currentGpu: null,
  metricsData: []
}

const mutations = {
  SET_GPU_LIST(state, list) {
    state.gpuList = list
  },
  SET_CURRENT_GPU(state, gpu) {
    state.currentGpu = gpu
  },
  SET_METRICS_DATA(state, data) {
    state.metricsData = data
  }
}

const actions = {
  async fetchGpuList({ commit }) {
    try {
      const response = await getGpuList()
      commit('SET_GPU_LIST', response.data)
      return response.data
    } catch (error) {
      console.error('获取GPU列表失败:', error)
      throw error
    }
  },

  async fetchGpuInfo({ commit }, id) {
    try {
      const response = await getGpuInfo(id)
      commit('SET_CURRENT_GPU', response.data)
      return response.data
    } catch (error) {
      console.error('获取GPU详情失败:', error)
      throw error
    }
  },

  async fetchGpuMetrics({ commit }, { id, params }) {
    try {
      const response = await getGpuMetrics(id, params)
      commit('SET_METRICS_DATA', response.data)
      return response.data
    } catch (error) {
      console.error('获取GPU指标数据失败:', error)
      throw error
    }
  },

  async updateConfig(_, { id, data }) {
    try {
      const response = await updateGpuConfig(id, data)
      return response.data
    } catch (error) {
      console.error('更新GPU配置失败:', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}