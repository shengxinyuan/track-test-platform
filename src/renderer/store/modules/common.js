const state = {
  userInfo: {
  },
  groupId: 1000
}

const getters = {
  
}

const mutations = {
  common_setUserInfo(state, res) {
    state.userInfo = res
  },
  common_setGroupId(state, res) {
    state.groupId = res
  },
}

const actions = {
  
}

export default {
  state,
  getters,
  actions,
  mutations
}
