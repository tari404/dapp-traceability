<template>
  <div class="main-width trace-content">
    <h2>商品详情</h2>
    <div class="trace-transfer" @click="startTransferCargo">{{$t('transcargo')}}</div>
    <div v-if="cargo">
      <div class="trace-no-cargo" v-if="notExist">商品不存在</div>
      <div class="trace-cargo-details" v-else>
        <div class="name">
          <img :src="cargoImg">
          <span>{{cargo.name}}</span>
        </div>
        <div>
          <p>
            <span class="key">创建者</span>
            <span class="address">{{cargo.traces[0]}}</span>
          </p>
          <p>
            <span class="key">持有者</span>
            <span class="address">{{holder}}</span>
          </p>
          <p><span class="key">流通次数</span>{{tracesLength}}</p>
        </div>
        <ul class="trace-cargo-traces">
          <li v-for="(node, index) in cargo.traces" :key="index">
            <user-head :address="node" />
            <span>{{node}}</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-else-if="loaded === 1">加载中...</div>
    <div v-if="showModalBox" class="trace-modal">
      <div class="main">
        <div class="close" @click="closeModal">
          <span/>
          <span/>
        </div>
        <div class="trace-main-info">
          <h2>销售商品</h2>
          <input type="text" v-model="inputTarget">
          <div class="notice" v-if="!inputTarget">输入销售地址</div>
          <div class="button" :class="{
            'button-active': utils.isAddress(inputTarget) && !transferState
          }" @click="transferCargo">确定销售</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import UserHead from './UserHead'

import cargoImg from '@/assets/cargo.png'

const zeroAddress = '0x0000000000000000000000000000000000000000'

export default {
  name: 'Query',
  props: ['cargoID'],
  data () {
    return {
      cargoImg,
      cargo: null,

      loaded: 0,
      inputTarget: '',
      showModalBox: false,
      transferState: false
    }
  },
  watch: {
    cargoID (id) {
      this.cargo = null
      this.queryCargo(id)
    }
  },
  computed: {
    ...mapState({
      utils: state => state.web3.utils
    }),
    ...mapGetters({
      address: 'web3/address'
    }),
    tracesLength () {
      if (this.cargo) {
        return this.cargo.traces.length - 1
      } else {
        return 0
      }
    },
    holder () {
      if (this.cargo) {
        const traces = this.cargo.traces
        return traces[traces.length - 1]
      } else {
        return zeroAddress
      }
    },
    notExist () {
      if (this.cargo) {
        return !this.cargo.name && (this.cargo.traces[0] === zeroAddress || !this.cargo.traces[0])
      } else {
        return false
      }
    }
  },
  mounted () {
    this.queryCargo(this.cargoID)
    setTimeout(() => {
      this.loaded = this.loaded || 1
    }, 300)
  },
  methods: {
    ...mapActions({
      notice: 'notice',
      getCargo: 'web3/getCargo',
      transfer: 'web3/transfer'
    }),
    queryCargo (inputID) {
      if (!inputID || /\D/.test(inputID)) {
        return
      }
      this.inputID = inputID
      this.getCargo(inputID).then(res => {
        console.log(1)
        this.loaded = 2
        this.cargo = res
      })
    },
    startTransferCargo () {
      this.showModalBox = true
    },
    closeModal () {
      this.showModalBox = false
    },
    transferCargo () {
      const target = this.inputTarget
      if (!this.utils.isAddress(target) || this.transferState) {
        return
      }
      const cargo = this.cargo
      if (!cargo) {
        return
      }
      this.transferState = true
      this.transfer([cargo.id, target]).then(res => {
        this.transferState = false
        if (res.events) {
          cargo.update()
          this.inputTarget = ''
          this.notice(['log', `商品：${cargo.name}已转移至账户：${target}`, 10000])
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', `未能成功转移商品 输入参数可能有错误或无权操作`, 10000])
        } else {
          this.notice(['error', `未能成功转移商品 可能是由于网络等原因导致的`, 10000])
        }
      })
    }
  },
  components: {
    UserHead
  }
}
</script>

<style lang="stylus" scoped>
.trace-content
  margin-bottom 100px
h2
  margin 0 0 40px
  font-weight 500
  font-size 20px
  line-height 20px
.trace-query-input
  margin-top 10px
  display flex
  #input-cargo-name
    flex 1 1 auto
  .trace-button
    margin-left 20px
    flex 0 0 80px
.trace-no-cargo
  text-align center
  color #bbb
  background-color #f0f0f0
  border-radius 3px
  padding 10px
.trace-cargo-details
  .name
    margin 30px 0
    display flex
    align-items center
    img
      width 40px
      height 40px
      border-radius 50%
    span
      margin-left 20px
      font-size 18px
      color #666
  p
    color #333
    font-size 18px
    line-height 18px
    margin 30px 0
    display flex
  .key
    flex 0 0 100px
  .address
    overflow hidden
    text-overflow ellipsis
.trace-cargo-traces
  background-color #f2f5fa
  padding 30px
  border-radius 10px
  display flex
  flex-direction column-reverse
  li
    width 700px
    height 60px
    box-sizing border-box
    border-radius 10px
    border solid 1px #bfbfbf
    margin 40px auto 0
    text-align center
    font-size 18px
    padding 10px 20px
    background-color #fff
    position relative
    display flex
    align-items center
    justify-content space-between
    &:after
      content ''
      position absolute
      width 20px
      height 20px
      top -30px
      left 50%
      background-size contain
      background-position center
      background-repeat no-repeat
      background-image url(../assets/arrow_down.svg)
      transform translateX(-50%) rotate(180deg)
    span
      margin 0 40px 0 20px
  li:last-child
    margin-top 0
    &:after
      content none
.trace-transfer
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
</style>
