<template>
  <div class="main-width trace-content">
    <div class="trace-content-title">我创建的商品</div>
    <div class="trace-cargoes-notice" v-if="cCNLoaded === 1">加载中...</div>
    <div class="trace-cargoes-notice" v-else-if="cCNLoaded === 2 && !createCargoesNames.length">没有对应记录</div>
    <ul class="trace-cargoes" v-else>
      <li class="trace-cargo" v-for="(cargo, index) in createCargoesNames" :key="index">
        <span class="detials" @click="cargoDetails(cargo)"></span>
        <span class="name">{{cargo.name}}</span>
        <span class="traces">{{cargo.traces.length - 1}}</span>
      </li>
    </ul>
    <br class="trace-blank">
    <div class="trace-content-title">我拥有的商品</div>
    <div class="trace-cargoes-notice" v-if="hCNLoaded === 1">加载中...</div>
    <div class="trace-cargoes-notice" v-else-if="hCNLoaded === 2 && !holdCargoesNames.length">没有对应记录</div>
    <ul class="trace-cargoes" v-else>
      <li class="trace-cargo" v-for="(cargo, index) in holdCargoesNames" :key="index">
        <span class="detials" @click="cargoDetails(cargo)"></span>
        <span class="name">{{cargo.name}}</span>
        <span class="traces">{{cargo.traces.length - 1}}</span>
      </li>
    </ul>
    <br class="trace-blank">
    <div class="trace-content-title">创建新商品</div>
    <div v-if="permissive">
      <div class="trace-create">
        <div>
          <label for="input-cargo-name">商品名称</label>
          <input id="input-cargo-name" type="text" v-model="inputName" :disabled="creationState" >
          <div class="trace-button" :class="{ 'trace-button-active': inputName && !creationState }">
            <div @click="createCargo">{{creationState ? '创建中...' : '创建'}}</div>
          </div>
        </div>
        <div class="trace-notice">如果点击创建后长时间没有反应，请通过<a target="_blank" href="https://www.truescan.net/tx">TrueScan</a>确认交易状态，谨慎<a @click="refreshCreateButton" href="javascript: void 0">强制刷新</a></div>
      </div>
    </div>
    <div v-else class="trace-notice">该账号无权限创建商品，如有疑问请联系该合约管理员</div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Notice from '@/components/Notice'

export default {
  name: 'Cargoes',
  data () {
    return {
      inputName: '',
      creationState: false,
      cCNLoaded: 0,
      createCargoesNames: [],
      hCNLoaded: 0,
      holdCargoesNames: [],
    }
  },
  computed: {
    ...mapState({
      permissions: state => state.web3.permissions,
      abi: state => state.web3.abi
    }),
    ...mapGetters({
      address: 'web3/address'
    }),
    permissive () {
      return !!this.permissions[this.address]
    }
  },
  mounted () {
    this.queryCreateCargoes()
    this.queryHoldCargoes()
    setTimeout(() => {
      this.cCNLoaded = this.cCNLoaded || 1
      this.hCNLoaded = this.hCNLoaded || 1
    }, 300)
  },
  methods: {
    ...mapActions({
      notice: 'notice',
      allCreated: 'web3/allCreated',
      allHolding: 'web3/allHolding',
      createNewCargo: 'web3/createNewCargo'
    }),
    queryCreateCargoes () {
      this.allCreated().then(res => {
        this.createCargoesNames = res
        this.cCNLoaded = 2
      })
    },
    queryHoldCargoes () {
      this.allHolding().then(res => {
        this.holdCargoesNames = res
        this.hCNLoaded = 2
      })
    },
    cargoDetails (cargo) {
      this.$emit('queryDetails', cargo)
    },
    refreshCreateButton () {
      this.creationState = false
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
          this.queryCreateCargoes()
          this.queryHoldCargoes()
          this.notice(['log', `商品记录创建成功 名称：${name}<br>ID：${id}`, 10000])
          this.inputName = ''
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', `未能成功创建商品记录：${name} 请和管理员确认是否有操作权限`, 10000])
        } else {
          this.notice(['error', `未能成功创建商品记录：${name} 可能是由于网络等原因导致的`, 10000])
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.trace-content
  margin-bottom 160px
.trace-cargoes
  display grid
  grid-template-columns repeat(4, 1fr)
  grid-gap 4px
  margin-top 10px
.trace-cargoes-notice
  margin-top 10px
  text-align center
  font-size 14px
  color #666
  border solid 1px #ddd
  border-radius 3px
  padding 10px
  line-height 24px
.trace-cargo
  border solid 1px #ddd
  border-radius 3px
  padding 10px 10px 10px 12px
  line-height 24px
  position relative
  overflow hidden
  .detials
    position absolute
    right -3px
    bottom  -8px
    transform rotate(45deg)
    width 10px
    height 20px
    background-color #0d85da
    display block
    cursor pointer
    opacity .6
    transition opacity .3s
    &:hover
      opacity 1
  .name
    display inline-block
    white-space nowrap
    overflow hidden
    vertical-align bottom
    width 120px
    text-overflow ellipsis
  .traces
    font-size 14px
    float right
    position relative
    color #0387dc
    &:before
      content ''
      display block
      position absolute
      top 5px
      left -18px
      width 14px
      height 14px
      background-size contain
      background-origin center
      background-repeat no-repeat
      background-image url('../assets/path.svg')
.trace-create
  margin-top 10px
  >div:first-child
    display flex
  .trace-button
    margin-left 20px
.trace-notice
  margin-top 6px
@media screen and (max-width 800px)
  .trace-cargoes
    grid-template-columns repeat(3, 1fr)
@media screen and (max-width 600px)
  .trace-cargoes
    grid-template-columns repeat(2, 1fr)
</style>
