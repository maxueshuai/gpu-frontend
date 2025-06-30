const state = {
  tasks: [],
  currentTask: null,
  taskStatus: {}
}

const mutations = {
  SET_TASKS(state, tasks) {
    state.tasks = tasks
  },
  SET_CURRENT_TASK(state, task) {
    state.currentTask = task
  },
  UPDATE_TASK_STATUS(state, { taskId, status }) {
    state.taskStatus = {
      ...state.taskStatus,
      [taskId]: status
    }
  }
}

const actions = {
  setTasks({ commit }, tasks) {
    commit('SET_TASKS', tasks)
  },
  setCurrentTask({ commit }, task) {
    commit('SET_CURRENT_TASK', task)
  },
  updateTaskStatus({ commit }, { taskId, status }) {
    commit('UPDATE_TASK_STATUS', { taskId, status })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}