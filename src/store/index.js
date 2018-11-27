import Vue from 'vue'
import Vuex from 'vuex'

import web3 from './web3'

Vue.use(Vuex)

const defaultUsers = [
  {
    index: 0,
    name: '生产厂家',
    img: require('@/assets/head/01.png'),
    address: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
  },
  {
    index: 1,
    name: '代销商1',
    img: require('@/assets/head/02.png'),
    address: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'
  },
  {
    index: 2,
    name: '代销商2',
    img: require('@/assets/head/03.png'),
    address: '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69'
  },
  {
    index: 3,
    name: '消费者',
    img: require('@/assets/head/04.png'),
    address: '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718'
  }
]

const cache = new Map()

const state = {
  defaultUsers,
  noticeBoxTimer: 0,
  noticeBox: null,
  noticeTextBox: null,
  hold: false,

  userIndex: 0
}

const getters = {
  user (state) {
    return defaultUsers[state.userIndex]
  },
  userByAddress: _ => address => {
    const fromCache = cache.get(address)
    if (fromCache) {
      return fromCache
    } else {
      const fromConfig = defaultUsers.find(item => item.address === address)
      cache.set(address, fromConfig)
      return fromConfig
    }
  }
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
  getters,
  mutations,
  actions,
  modules: {
    web3
  },
  strict: false
})
