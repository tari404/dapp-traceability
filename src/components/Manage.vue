<template>
  <div class="main-width trace-content">
    <div class="trace-content-title">
      创建商品权限管理
      <span class="trace-update-time">更新时间 {{permissionsUpdated.toString().substr(16, 8)}}</span>
    </div>
    <div class="trace-notice">所有的权限更改操作都需要手续费！请不要无计划的随意变动<br>如果你的账户是多人/应用所使用的，则链上的数据随时可能发生变化，调用前请及时刷新数据</div>
    <ul class="trace-permission" :class="{ 'trace-permission-disable': switchState }">
      <li v-for="(value, key) in permissions" :key="key">
        <span class="name">{{accountName[key]}}</span>
        <span class="address">{{key}}</span>
        <span class="switch" :class="{ 'switch-on': value }" @click="togglePermission(key)" />
      </li>
    </ul>
    <div class="trace-notice">仅在展示版平台中可以看到预定义的地址权限列表</div>
    <br class="trace-blank">
    <div class="trace-content-title">权限查询</div>
    <div class="trace-premission-query">
      <label for="input-cargo-permission">账户地址</label>
      <input id="input-cargo-permission" type="text" v-model="inputAddress">
      <div class="trace-button" :class="{ 'trace-button-active': utils.isAddress(inputAddress) }">
        <div @click="queryPermission">查询</div>
      </div>
    </div>
    <div v-if="queryAddress">
      <ul class="trace-permission" :class="{ 'trace-permission-disable': switchState }">
        <li>
          <span class="address">{{queryAddress}}</span>
          <span class="switch" :class="{ 'switch-on': queryState }" @click="toSetPermission(queryAddress)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

const accountName = {
  '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf': '管理员',
  '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF': '普通1',
  '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69': '普通2',
  '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718': '普通3'
}

export default {
  name: 'Manage',
  data () {
    return {
      inputAddress: '',
      accountName,
      switchState: false,

      queryAddress: '',
      queryState: false
    }
  },
  computed: {
    ...mapState({
      utils: state => state.web3.utils,
      permissions: state => state.web3.permissions,
      permissionsUpdated: state => state.web3.permissionsUpdated
    })
  },
  methods: {
    ...mapActions({
      notice: 'notice',
      permissionOf: 'web3/permissionOf',
      setPermission: 'web3/setPermission'
    }),
    queryPermission () {
      const address = this.inputAddress
      if (!this.utils.isAddress(address)) {
        return
      }
      this.permissionOf(address).then(res => {
        this.queryAddress = address
        this.queryState = res
      })
    },
    togglePermission (address) {
      const setState = !this.permissions[address]
      this.switchState = true
      this.setPermission([address, setState]).then(res => {
        this.switchState = false
        if (res.events) {
          if (this.queryAddress === address) {
            this.queryState = setState
          }
          this.notice(['log', `账户${address}创建商品权限已${setState ? '打开' : '关闭'}`, 10000])
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', `未能成功设置权限 输入参数可能有错误或无权操作`, 10000])
        } else {
          this.notice(['error', `未能成功设置权限 可能是由于网络等原因导致的`, 10000])
        }
      })
    },
    toSetPermission () {
      this.switchState = true
      const address = this.queryAddress
      const setState = !this.queryState
      this.setPermission([address, setState]).then(res => {
        this.switchState = false
        if (res.events) {
          if (this.queryAddress === address) {
            this.queryState = setState
          }
          this.notice(['log', `账户${address}创建商品权限已${setState ? '打开' : '关闭'}`, 10000])
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', `未能成功设置权限 输入参数可能有错误或无权操作`, 10000])
        } else {
          this.notice(['error', `未能成功设置权限 可能是由于网络等原因导致的`, 10000])
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.trace-content
  margin-bottom 160px
.trace-update-time
  color #2fa4d9
  float right
  font-size 12px
.trace-permission
  position relative
  overflow hidden
  margin 10px 0 0
  padding 10px
  border-radius 5px
  border dashed 1px #ddd
  &:before
    content ''
    position absolute
    bottom 14px
    right 8px
    width 26px
    height 26px
    background-image url(../assets/pay_blue.svg)
    background-size contain
    background-position center
    background-repeat no-repeat
  li
    line-height 30px
    display flex
    .name
      flex 0 0 80px
    .address
      flex 0 1 420px
    .switch
      flex 0 0 32px
      width 32px
      border-radius 10px
      margin 5px 0
      display block
      background-color #ddd
      position relative
      cursor pointer
      transition color .4s
      &:after
        content ''
        position absolute
        top 2px
        left 2px
        width 16px
        height 16px
        border-radius 50%
        background-color #fff
        transition transform .4s
    .switch-on
      background-color #2fa4d9
      &:after
        transform translateX(12px)
.trace-permission-disable
  &:after
    content ''
    color #fff
    text-align center
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    background-color #0003
.trace-premission-query
  margin-top 10px
  display flex
  .trace-button
    margin-left 20px
@media screen and (max-width 600px)
  .trace-permission li .address
    font-size 12px
</style>
