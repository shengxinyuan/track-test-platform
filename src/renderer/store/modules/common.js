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
    if (res == 1000) {
      state.groupName = '红袖'
    } else if (res == 1100) {
      state.groupName = '海外'
    } else if (res == 1200) {
      state.groupName = '起点'
    }
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
