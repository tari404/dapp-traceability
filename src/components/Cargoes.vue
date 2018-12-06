<template>
  <div class="main-width">
    <div class="trace-content trace-account">
      <h2>{{$t('Account.current')}}</h2>
      <div>
        <img :src="user.img">
        <span>{{$t(`Account.player[${user.index}]`)}}</span>
      </div>
      <p>
        <span class="key">{{$t('Account.address')}}</span>
        <span class="hash">{{address}}</span>
      </p>
    </div>
    <div class="main-width trace-content">
      <h2 class="trace-content-title">{{$t('cargolist')}}</h2>
      <div class="trace-create-new" v-if="permissions[address] > 1" @click="startCreateCargo">{{$t('newcargo')}}</div>
      <div class="trace-cargoes-notice" v-if="hCNLoaded === 1">{{$t('loading')}}</div>
      <div class="trace-cargoes-notice" v-else-if="hCNLoaded === 2 && !holdCargoesNames.length">{{$t('Cargoes.norecords')}}</div>
      <ul class="trace-cargoes" v-else>
        <li class="trace-cargo" v-for="(cargo, index) in holdCargoesNames" :key="index" @click="cargoDetails(cargo)">
          <img :src="cargoImg">
          <span class="name">{{cargo.name}}</span>
          <span class="traces">{{cargo.traces.length ? cargo.traces.length - 1 : '...'}}</span>
        </li>
      </ul>
      <br class="trace-blank">
      <h2 class="trace-content-title">{{$t('cargoquery')}}</h2>
      <div class="trace-query">
        <input id="input-cargo-name" type="text" v-model="inputCargoID" :disabled="creationState" >
        <div class="trace-query-notice" v-if="!inputCargoID">{{$t('Cargoes.input')}}</div>
        <div class="trace-button" :class="{
          'trace-button-active': inputCargoID && !/\D/.test(inputCargoID)
        }" @click="queryCargo" >{{$t('Cargoes.query')}}</div>
      </div>
    </div>
    <div v-if="showModalBox" class="trace-modal">
      <div class="main">
        <div class="close" @click="closeModal">
          <span/>
          <span/>
        </div>
        <div class="trace-main-info">
          <h2>{{$t('newcargo')}}</h2>
          <input type="text" v-model="inputName">
          <div class="notice" v-if="!inputName">{{$t('Cargoes.inputname')}}</div>
          <div class="button" :class="{
            'button-active': inputName && !creationState
          }" @click="createCargo">{{creationState ? $t('creating') : $t('Cardoes.confirm')}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

import cargoImg from '@/assets/cargo.png'

export default {
  name: 'Cargoes',
  data () {
    return {
      cargoImg,

      inputName: '',
      inputCargoID: '',
      creationState: false,
      hCNLoaded: 0,
      holdCargoesNames: [],
      showModalBox: false
    }
  },
  computed: {
    ...mapState({
      permissions: state => state.web3.permissions,
      abi: state => state.web3.abi
    }),
    ...mapGetters({
      user: 'user',
      address: 'web3/address'
    })
  },
  mounted () {
    this.queryHoldCargoes()
    setTimeout(() => {
      this.hCNLoaded = this.hCNLoaded || 1
    }, 300)
  },
  methods: {
    ...mapActions({
      notice: 'notice',
      allHolding: 'web3/allHolding',
      createNewCargo: 'web3/createNewCargo'
    }),
    queryHoldCargoes () {
      this.allHolding().then(res => {
        this.holdCargoesNames = res
        this.hCNLoaded = 2
      })
    },
    cargoDetails (cargo) {
      this.$emit('queryDetails', cargo)
    },
    queryCargo () {
      const id = this.inputCargoID
      if (id && !/\D/.test(id)) {
        this.$emit('queryDetails', { id: this.inputCargoID})
      }
    },
    startCreateCargo () {
      this.showModalBox = true
    },
    closeModal () {
      this.showModalBox = false
    },
    createCargo () {
      if (!this.inputName || this.creationState) {
        return
      }
      const name = this.inputName
      this.creationState = true
      this.createNewCargo(name).then(res => {
        this.creationState = false
        if (res.events) {
          const id = res.events.NewCargo.returnValues._cargoID
          this.queryHoldCargoes()
          this.notice(['log', this.$t('Createnotice.success') + name + '<br>ID ' + id, 10000])
          this.inputName = ''
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', this.$t('Createnotice.error') + name + this.$t('Createnotice.unknow'), 10000])
        } else {
          this.notice(['error', this.$t('Createnotice.error') + name + this.$t('Createnotice.neterror'), 10000])
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.main-width
  margin-bottom 100px
h2
  margin 0 0 20px
  font-weight 500
  font-size 20px
  line-height 20px

.trace-account
  font-size 18px
  color #333
  div
    margin 30px 0
    display flex
    img
      width 40px
      height 40px
      border-radius 20px
      margin-right 20px
    span
      line-height 40px
  p
    margin 0
    display flex
    line-height 20px
    .key
      flex 0 0 140px
    .hash
      overflow hidden
      text-overflow ellipsis

.trace-create-new
  position absolute
  top 30px
  right 30px
  width 150px
  height 40px
  box-sizing border-box
  border-radius 20px
  color #fff
  background-color #1E64B4
  opacity .8
  line-height 40px
  text-align center
  cursor pointer
  transition opacity .4s
  &:hover
    opacity 1

.trace-cargoes
  display grid
  grid-template-columns repeat(4, 1fr)
  grid-gap 40px
  margin 40px 0
.trace-cargoes-notice
  text-align center
  margin 40px 0
  border solid 1px #dfdfdf
  border-radius 10px
  line-height 100px
  font-size 18px
  color #666
.trace-cargo
  cursor pointer
  height 104px
  border solid 1px #bfbfbf
  box-shadow 0 6px 20px rgba(0, 0, 0, 0.1)
  border-radius 10px
  padding 15px 11px
  align-items center
  box-sizing border-box
  position relative
  display flex
  img
    width 60px
    height 60px
    border-radius 50%
    margin 6px 8px
  .name
    white-space nowrap
    overflow hidden
    width 110px
    margin 0 10px
    font-size 18px
    color #666
    text-overflow ellipsis
  .traces
    position absolute
    right 16px
    bottom 14px
    line-height 14px
    font-size 14px
    color #1E64B4
    &:before
      content ''
      display block
      position absolute
      top 0
      left -18px
      width 14px
      height 14px
      background-size contain
      background-repeat no-repeat
      background-image url('../assets/path.svg')
.trace-query
  display flex
  margin-top 40px
  position relative
  input
    flex 0 1 500px
    height 60px
    border 1px solid #bfbfbf
    border-radius 10px
    font-size 18px
    padding 10px 20px
    position relative
    background transparent
    z-index 1
  .trace-query-notice
    position absolute
    left 22px
    line-height 62px
    color #999
    font-size 18px
    z-index 0
  .trace-button
    width 150px
    height 60px
    background-color #bfbfbf
    border-radius 10px
    line-height 60px
    text-align center
    font-size 18px
    color #fff
    margin-left 10px
    transition background-color .4s
  .trace-button-active
    background-color #1e64b4

@media screen and (max-width: 1100px)
  .trace-cargoes
    grid-template-columns repeat(3, 1fr)
@media screen and (max-width: 900px)
  .trace-cargoes
    grid-template-columns repeat(2, 1fr)
@media screen and (max-width: 560px)
  .trace-cargoes
    grid-template-columns repeat(1, 1fr)
</style>
