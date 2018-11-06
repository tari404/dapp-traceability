import Vue from 'vue'
import Vuex from 'vuex'

import web3 from './web3'

Vue.use(Vuex)

const state = {
  noticeBoxTimer: 0,
  noticeBox: null,
  noticeTextBox: null,
  hold: false
}

const mutations = {
  bindNoticeBox (state, el) {
    state.noticeBox = el
    state.noticeTextBox = el.querySelector('p')
  },
  holdNoticeBox (state, hold) {
    state.hold = hold
    if (!state.noticeBoxTimer && !hold) {
      state.noticeBox.style.transform = 'translateY(110%)'
    }
  },
  closeNoticeBox (state) {
    state.noticeBox.style.transform = 'translateY(110%)'
    state.noticeBoxTimer = 0
  }
}

const actions = {
  notice ({ state }, [color, text, time]) {
    const el = state.noticeBox
    const tel = state.noticeTextBox
    if (!el) {
      return
    }
    let delay = 0
    if (state.noticeBoxTimer) {
      clearTimeout(state.noticeBoxTimer)
      delay = 300
    }
    switch (color) {
      case 'log':
        color = '#2fa4d9'
        break
      case 'warn':
        color = '#ed951f'
        break
      case 'error':
        color = '#d80315'
        break
    }
    el.style.transform = 'translateY(110%)'
    el.style.backgroundColor = color
    tel.innerHTML = text
    setTimeout(() => {
      el.style.transform = 'translateY(0%)'
    }, delay)
    state.noticeBoxTimer = setTimeout(() => {
      if (!state.hold) {
        el.style.transform = 'translateY(110%)'
      }
      state.noticeBoxTimer = 0
    }, delay + time)
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  modules: {
    web3
  },
  strict: false
})
