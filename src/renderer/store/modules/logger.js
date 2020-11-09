const state = {
  ownLoggerList: []
}

const getters = {
  
}

const mutations = {
  logger_setOwnLoggerList(state, res) {
    let list = []
    if (res && res.length) {
      res.forEach((val) => {
        if (val.eventPoint) {
          try {
            list.push(JSON.parse(val.eventPoint))
          } catch (error) {
            console.log(error);
          }
        } else {
          list.push(val)
        }
        
      });
    } else {
      list = []
    }
    state.ownLoggerList = list
  }
}

const actions = {
  
}

export default {
  state,
  getters,
  actions,
  mutations
}
