function getDefaultState () {
  return {
    saveList: [],
    nowData: [],
    isLogin: false
  }
}

export const state = getDefaultState()

export const mutations = {
  addSaveData: (state, text, time, title) => {
    const data = {}
    data.text = text
    data.time = time
    data.title = title
    state.saveList.push(data)
  },
  login: (state) => {
    state.isLogin = true
  },
  addNowData: (state, nowData) => {
    state.nowData = nowData
  }
}

export const getters = {
  getSaveList: (state) => {
    return state.saveList
  }
}
