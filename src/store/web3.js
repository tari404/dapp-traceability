import Web3 from 'web3'

import ABI from './ABI.json'

const contractAddress = '0xdB587ef6aaA16b5719CDd3AaB316F0E70473e9Be'

const web3 = new Web3('https://api.truescan.net/rpc')
const contract = new web3.eth.Contract(ABI, contractAddress)
window.contract = contract
class Cargo {
  constructor (id) {
    this.id = id
    this.name = '...'
    this.traces = []
    this.updated = false
    contract.methods.cargoNameOf(this.id).call().then(name => {
      this.name = name
    })
    this.update()
  }
  update () {
    contract.methods.tracesOf(this.id).call().then(traces => {
      this.traces = traces
      this.updated = new Date()
    }).catch(() => {
      this.updated = false
    })
    return this
  }
}
const nameMap = new Map()
window.nameMap = nameMap
function findOrCreateCargoInfo (id) {
  const cache = nameMap.get(id)
  if (cache) {
    return cache.update()
  } else {
    const cargo = new Cargo(id)
    nameMap.set(id, cargo)
    return cargo
  }
}

const defaultUser = [
  { priKey: '0x01', address: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf' },
  { priKey: '0x02', address: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF' },
  { priKey: '0x03', address: '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69' },
  { priKey: '0x04', address: '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718' }
]

defaultUser.forEach(account => {
  const ac = web3.eth.accounts.privateKeyToAccount(account.priKey)
  web3.eth.accounts.wallet.add(ac)
})

export default {
  namespaced: true,
  state: {
    utils: web3.utils,
    abi: web3.eth.abi,
    methods: contract.methods,

    state: 0,
    name: '...',

    userIndex: 0,
    contractAddress
  },
  getters: {
    address (state) {
      return defaultUser[state.userIndex].address
    }
  },
  mutations: {
    updateNetworkState (state, name) {
      if (name) {
        state.name = name
        state.state = 1
      } else {
        state.name = '...'
        state.state = 2
      }
    },
    updateUser (state, index) {
      state.userIndex = index
    }
  },
  actions: {
    checkNetwork ({ commit, dispatch }) {
      contract.methods.name().call().then(res => {
        commit('updateNetworkState', res)
      }).catch(() => {
        commit('updateNetworkState', false)
        setTimeout(() => {
          dispatch('checkNetwork')
        }, 3000)
      })
    },
    getCargo (_, id) {
      return findOrCreateCargoInfo(id)
    },
    allCreated ({ state, dispatch }, address) {
      address = address || defaultUser[state.userIndex].address
      return contract.methods.allCreated(address).call().then(res => {
        return res.map(id => {
          return findOrCreateCargoInfo(id)
        })
      }).catch(() => {
        dispatch('checkNetwork')
      })
    },
    allHolding ({ state, dispatch }, address) {
      address = address || defaultUser[state.userIndex].address
      return contract.methods.allHolding(address).call().then(res => {
        return res.map(id => {
          return findOrCreateCargoInfo(id)
        })
      }).catch(() => {
        dispatch('checkNetwork')
      })
    },
    createNewCargo ({ state, dispatch }, name) {
      name = name || 'UNNAMED'
      const address = defaultUser[state.userIndex].address
      return contract.methods.createNewCargo(name).send({
        from: address,
        gasPrice: 1,
        gas: 3000000
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    },
    transfer ({ state, dispatch }, [id, target]) {
      const address = defaultUser[state.userIndex].address
      return contract.methods.transfer(id, target).send({
        from: address,
        gasPrice: 1,
        gas: 3000000
      }).catch(err => {
        dispatch('checkNetwork')
        return err
      })
    }
  }
}
