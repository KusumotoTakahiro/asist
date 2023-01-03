function getDefaultState () {
  return {
    saveList: [],
    nowData: [],
    isLogin: false,
    nowID: 0
  }
}

export const state = getDefaultState()

export const mutations = {
  addSaveData: (state, text, time, title) => {
    const data = {}
    const id = (state.saveList).length
    data.text = text
    data.time = time
    data.title = title
    data.id = id
    state.saveList.push(data)
    state.nowID = id
  },
  login: (state) => {
    state.isLogin = true
  },
  addNowData: (state, nowData) => {
    state.nowData = nowData
  },
  addSelectedDatas: (state, selectedDatas) => {
    state.saveList[state.nowID].selected = selectedDatas
  },
  addNowID: (state, id) => {
    state.nowID = id
  }
}

export const getters = {
  getSaveList: (state) => {
    return state.saveList
  }
}
