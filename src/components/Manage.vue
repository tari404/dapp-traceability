<template>
  <div class="main-width trace-content">
    <div class="trace-content-title">
      创建商品权限管理
      <span class="trace-update-time">更新时间 {{permissionsUpdated.toString().substr(16, 8)}}</span>
    </div>
    <div class="trace-notice">所有的权限更改操作都需要手续费！请不要无计划的随意变动<br>如果你的账户是多人/应用所使用的，则链上的数据随时可能发生变化，调用前请及时刷新数据</div>
    <ul class="trace-permission" :class="{ 'trace-permission-disable': true }">
      <li v-for="(value, key) in permissions" :key="key">
        <span class="name">{{accountName[key]}}</span>
        <span class="address">{{key}}</span>
        <span class="switch" :class="{ 'switch-on': value }" @click="togglePermission(key)" />
      </li>
    </ul>
    <div class="trace-notice">仅在展示版平台中可以看到预定义的地址权限列表</div>
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
      accountName
    }
  },
  computed: {
    ...mapState({
      permissions: state => state.web3.permissions,
      permissionsUpdated: state => state.web3.permissionsUpdated
    })
  },
  methods: {
    ...mapActions({
      notice: 'notice',
      setPermission: 'web3/setPermission'
    }),
    togglePermission (address) {
      const setState = !this.permissions[address]
      this.setPermission([address, setState]).then(res => {
        if (res.events) {
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
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    background-color #0001
@media screen and (max-width 600px)
  .trace-permission li .address
    font-size 12px
</style>
