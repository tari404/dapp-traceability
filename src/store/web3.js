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
    this.update()
  }
  update () {
    Promise.all([
      contract.methods.cargoNameOf(this.id).call(),
      contract.methods.tracesOf(this.id).call()
    ]).then(([name, traces]) => {
      this.name = name
      this.traces = traces
      this.updated = new Date()
    }).catch(() => {
      this.updated = false
    })
    return this
  }
}
const nameMap = new Map()
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
  { priKey: '0x01', address: '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf' },
  { priKey: '0x02', address: '0x2b5ad5c4795c026514f8317c7a215e218dccd6cf' },
  { priKey: '0x03', address: '0x6813eb9362372eef6200f3b1dbc3f819671cba69' },
  { priKey: '0x04', address: '0x1eff47bc3a10a45d4b230b5d10e37751fe6aa718' }
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
    }
  }
}
