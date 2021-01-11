const state = {
  userInfo: {
  },
  groupId: 1000,
  groupName: '红袖'
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
  common_setGroupName(state, res) {
    state.groupName = res
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
