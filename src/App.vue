<template>
  <div id="app">
    <nav>
      <div class="main-width">
        <h1>商品溯源平台</h1>
        <div class="trace-user">
          使用<span :class="{'focus': admin}" @click="toggleUser(true, 0)">管理员</span>
          <span :class="{'focus': !admin && userIndex === 1}" @click="toggleUser(false, 1)">普通1</span>
          <span :class="{'focus': !admin && userIndex === 2}" @click="toggleUser(false, 2)">普通2</span>
          <span :class="{'focus': !admin && userIndex === 3}" @click="toggleUser(false, 3)">普通3</span>账号
        </div>
      </div>
    </nav>
    <section>
      <div class="main-width trace-account">
        账户地址：{{address}}
      </div>
    </section>
    <section>
      <div class="main-width">
        <span class="trace-network-name">合约名称：{{contractName}}</span>
        <span class="trace-network-state" :style="{
          'color': networkState === 1 ? '#2fa4d9' : '#d80315'
        }">{{networkNotice}}</span>
      </div>
    </section>
    <section>
      <div class="main-width">
        <ul class="trace-menu">
          <li v-for="(item, index) in menu"
            :key="'m'+index"
            :class="{ 'focus': route === 'm'+index }"
            @click="toggleRoute('m'+index)">{{item}}</li>
          <li v-if="admin" v-for="(item, index) in adminMenu"
            :key="'a'+index"
            :class="{ 'focus': route === 'a'+index }"
            @click="toggleRoute('a'+index)">{{item}}</li>
        </ul>
      </div>
    </section>
    <section v-if="!beforeRefresh">
      <cargoes v-show="route === 'm0'" @queryDetails="showDetails" />
      <query v-show="route === 'm1'" ref="query" />
      <manage v-show="route === 'a0'" />
    </section>
    <notice />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Notice from '@/components/Notice'
import Cargoes from '@/components/Cargoes'
import Query from '@/components/Query'
import Manage from '@/components/Manage'

export default {
  name: 'App',
  data () {
    return {
      beforeRefresh: false,

      admin: true,
      userIndex: 0,
      route: 'm0',
      menu: [
        '商品查看',
        '查询管理'
      ],
      adminMenu: [
        '权限管理'
      ]
    }
  },
  computed: {
    ...mapState({
      contractName: state => state.web3.name,
      networkState: state => state.web3.state
    }),
    ...mapGetters({
      address: 'web3/address'
    }),
    networkNotice () {
      switch (this.networkState) {
        case 1:
          return '网络连接正常'
        case 2:
          return '网络连接异常'
        default:
          return ''
      }
    }
  },
  created () {
    this.checkNetwork()
  },
  methods: {
    ...mapActions({
      checkNetwork: 'web3/checkNetwork',
      updateUser: 'web3/updateUser'
    }),
    toggleRoute (index) {
      this.route = index
    },
    toggleUser (isAdmin, index) {
      if (this.admin === isAdmin && this.index === index) {
        return
      }
      if (/a/.test(this.route) && isAdmin === false) {
        this.route = 'm0'
      }
      this.beforeRefresh = true
      this.$nextTick(() => {
        this.beforeRefresh = false
      })
      this.admin = isAdmin
      this.userIndex = index
      this.updateUser(index)
    },
    showDetails (cargo) {
      this.route = 'm1'
      this.$refs.query.queryCargo(cargo.id)
    }
  },
  components: {
    Notice,
    Cargoes,
    Query,
    Manage
  }
}
</script>

<style lang="stylus">
body
  margin 0
  background-color #f0f4f8
  font-family Avenir,Helvetica,Arial,sans-serif
body::-webkit-scrollbar
  display none
  width 0
  height 0
  opacity 0
a
  color inherit
ul
  margin 0
  padding 0
li
  list-style none

.main-width
  margin auto
  flex 0 1 800px
  min-width 480px
  box-sizing border-box

.trace-blank
  line-height 20px

nav
  height 80px
  padding 0 10px
  display flex
  background-color #fff
  box-shadow 0 2px 4px #0001
  h1
    margin 0
    display inline
    font-size 20px
    font-weight 400
    line-height 40px
  .trace-user
    margin 5px 0
    float right
    line-height 20px
    color #666
    span
      display inline-block
      padding 4px
      margin 0 2px
      border dashed 1px #ddd
      border-radius 3px
      cursor pointer
    .focus
      background-color #0d85da
      border-color #0d85da
      color #fff
section
  margin 20px 10px
  display flex

label
  display block
  line-height 40px
  width 90px
  height 40px
input
  font-family inherit
  font-size inherit
  box-sizing border-box
  border-radius 3px
  border 1px solid #ddd
  font-size 16px
  outline none
  height 40px
  margin 0
  padding 0 9px

.trace-account
  padding 10px 20px
  border-radius 5px
  border dashed 1px #aaa
  color #666

.trace-network-name
  font-size 16px
  line-height 24px
.trace-network-state
  float right
  font-size 14px
  line-height 24px

.trace-menu
  float left
  border-radius 5px
  overflow hidden
  display flex
  box-shadow 0 2px 4px #0001
  li
    width 110px
    height 60px
    line-height 60px
    text-align center
    background-color #fff
    margin-right 1px
  .focus
    background-color #0d85da
    color #fff
.trace-content
  background-color #fff
  border-radius 5px
  background-color #fff
  padding 20px
  box-shadow 0 2px 4px #0001
.trace-content-title
  font-size 18px
  line-height 30px

.trace-notice
  font-size 12px
  color #666

.trace-button
  border-radius 3px
  color #fff
  width 150px
  height 40px
  text-align center
  line-height 40px
  background-color #ccc
  transition background-color .4s
  div
    border-radius 3px
    transition background-color .4s,transform .4s
    background-color #bbb
.trace-button-active
  background-color #0072c1
  div
    background-color #0d85da
    cursor pointer
    transform translateY(-6px)
    &:hover
      transform translateY(-3px)

.trace-decimals
  font-size 14px
  color #666
</style>
