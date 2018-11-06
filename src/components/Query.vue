<template>
  <div class="main-width trace-content">
    <div class="trace-content-title">商品信息查询</div>
    <div class="trace-query-input">
      <label for="input-cargo-id">商品ID</label>
      <input id="input-cargo-name" type="text" v-model="inputID">
      <div class="trace-button" :class="{ 'trace-button-active': inputID && !/\D/.test(inputID) }">
        <div @click="queryCargo(inputID)">查询</div>
      </div>
    </div>
    <div v-if="focusCargo">
      <div class="trace-no-cargo" v-if="notExist">商品不存在</div>
      <div class="trace-cargo-details" v-else>
        <p><span class="key">商品名称</span>{{focusCargo.name}}</p>
        <p><span class="key">创建者</span>{{focusCargo.traces[0]}}</p>
        <p>
          <span class="key">持有者</span>
          {{holder}}
          <span class="time">更新时间 {{focusCargo.updated.toString().substr(16, 8)}}</span>
        </p>
        <p><span class="key">流通次数</span>{{tracesLength}}</p>
        <ul class="trace-cargo-traces">
          <li v-for="(node, index) in focusCargo.traces" :key="index" :data="index">
            {{node}}
          </li>
        </ul>
        <div class="trace-content-title">转移</div>
        <div v-if="address === holder" class="trace-transfer">
          <div>
            <label for="input-cargo-target">目标地址</label>
            <input id="input-cargo-target" type="text" v-model="inputTarget" :disabled="transferState" >
            <div class="trace-button" :class="{ 'trace-button-active': utils.isAddress(inputTarget) && !transferState }">
              <div @click="transferCargo">{{transferState ? '转移中...' : '转移'}}</div>
            </div>
          </div>
          <div class="trace-notice">你是这个商品的当前持有者，有权转移改商品。转移权将同商品本身一同转移。</div>
        </div>
        <div class="trace-notice" v-else-if="!notExist">
          你不是这个商品的当前持有者，因此仅能浏览其转移记录
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

const zeroAddress = '0x0000000000000000000000000000000000000000'

export default {
  name: 'Query',
  data () {
    return {
      inputID: '',
      focusCargo: null,

      inputTarget: '',
      transferState: false
    }
  },
  computed: {
    ...mapState({
      utils: state => state.web3.utils
    }),
    ...mapGetters({
      'address': 'web3/address'
    }),
    tracesLength () {
      if (this.focusCargo) {
        return this.focusCargo.traces.length - 1
      } else {
        return 0
      }
    },
    holder () {
      if (this.focusCargo) {
        const traces = this.focusCargo.traces
        return traces[traces.length - 1]
      } else {
        return zeroAddress
      }
    },
    notExist () {
      if (this.focusCargo) {
        return !this.focusCargo.name && this.focusCargo.traces[0] === zeroAddress
      } else {
        return false
      }
    }
  },
  methods: {
    ...mapActions({
      'notice': 'notice',
      'getCargo': 'web3/getCargo',
      'transfer': 'web3/transfer'
    }),
    queryCargo (inputID) {
      if (!inputID || /\D/.test(inputID)) {
        return
      }
      this.inputID = inputID
      this.getCargo(inputID).then(res => {
        this.focusCargo = res
      })
    },
    transferCargo () {
      const target = this.inputTarget
      if (!this.utils.isAddress(target) || this.transferState) {
        return
      }
      const cargo = this.focusCargo
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
          this.notice(['error', `未能成功转移商品 输入参数可能有错误`, 10000])
        } else {
          this.notice(['error', `未能成功转移商品 可能是由于网络等原因导致的`, 10000])
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.trace-content
  margin-bottom 160px
.trace-query-input
  margin 10px 0 20px
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
  p
    line-height 30px
    margin 0
    display flex
  .key
    flex 0 0 80px
    color #999
  .time
    flex 1 0 110px
    color #2fa4d9
    text-align right
    font-size 12px
.trace-cargo-traces
  margin 10px auto 20px
  background-color #f0f0f0
  padding 10px
  border-radius 5px
  li
    width 320px
    margin auto
    text-align center
    font-size 12px
    border-radius 3px
    padding 4px
    background-color #fff
    margin-top 20px
    position relative
    &:before
      content attr(data)
      position absolute
      right 334px
    &:after
      content '⬇️'
      position absolute
      top -20px
      left 50%
      transform translateX(-50%)
  li:first-child
    margin-top 0
    &:after
      content none
.trace-transfer
  margin 10px 0 10px
  >div
    display flex
  .trace-button
    margin-left 20px
.trace-notice
  margin-top 6px
</style>
