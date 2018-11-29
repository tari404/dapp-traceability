<template>
  <div id="app">
    <nav>
      <div class="main-width">
        <h1>{{$t('title')}}</h1>
        <div class="trace-i18n">
          <span :class="{ 'focus': $i18n.locale === 'sc' }"
            @click="toggleLang('sc')">简体中文</span>
          <span :class="{ 'focus': $i18n.locale === 'en' }"
            @click="toggleLang('en')">English</span>
        </div>
        <div v-if="route === 'query'" class="trace-back" @click="goback">{{$t('goback')}}</div>
      </div>
    </nav>
    <section v-if="beforeEnter">
      <div class="trace-intro trace-content main-width">
        <p>{{$t('intro')}}<br>{{$t('introduction')}}</p>
        <p>
          {{$t('characterintro')}}
          <br>
          {{$t('characters[0]')}}
          <br>
          {{$t('characters[1]')}}
          <br>
          {{$t('characters[2]')}}
        </p>
        <div class="trace-intro-start" @click="start">{{$t('start')}}</div>
      </div>
    </section>
    <section v-else-if="beforeLogin">
      <div class="trace-login trace-content main-width">
        <h2>{{$t('login')}}</h2>
        <p>{{$t('Account.select')}}</p>
        <div class="trace-login-select" :class="{
          'trace-login-select-open': showOptions
        }" @click="clickSelector">
          <ul class="trace-login-options" :style="{
            'transform': `translateY(${-selected * 80}px)`
          }">
            <li v-for="(user, index) in defaultUsers" :key="index"
              @click="selectOption($event, index)">
              <img :src="user.img">
              <span>{{$t(`Account.player[${user.index}]`)}}</span>
            </li>
          </ul>
        </div>
        <div class="trace-login-start" @click="login">{{$t('login')}}</div>
      </div>
    </section>
    <section v-else-if="!beforeRefresh">
      <cargoes v-if="route === 'info'" @queryDetails="showDetails" />
      <query v-if="route === 'query'" :cargoID='focusCargoID' />
    </section>
    <notice />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Notice from '@/components/Notice'
import Cargoes from '@/components/Cargoes'
import Query from '@/components/Query'

export default {
  name: 'App',
  data () {
    return {
      beforeEnter: true,
      beforeLogin: true,
      beforeRefresh: false,
      userIndex: 0,

      showOptions: false,
      selected: 0,

      route: 'info',
      focusCargoID: 0
    }
  },
  computed: {
    ...mapState({
      defaultUsers: state => state.defaultUsers
    })
  },
  created () {
    this.checkNetwork()
  },
  methods: {
    ...mapActions({
      checkNetwork: 'web3/checkNetwork',
      updateUser: 'web3/updateUser'
    }),
    toggleLang (locale) {
      this.$i18n.locale = locale
      document.title = this.$t('title')
    },
    goback () {
      this.route = 'info'
    },
    start () {
      this.beforeEnter = false
    },
    login () {
      this.updateUser(this.selected)
      this.beforeLogin = false
    },
    clickSelector (event) {
      if (!this.showOptions) {
        this.showOptions = true
        event.stopPropagation()
        document.addEventListener('click', this.closeSelector)
      }
    },
    closeSelector () {
      this.showOptions = false
      document.removeEventListener('click', this.closeSelector)
    },
    selectOption (event, index) {
      if (!this.showOptions) {
        return
      }
      this.selected = index
    },
    toggleRoute (index) {
      this.route = index
    },
    showDetails (cargo) {
      this.route = 'query'
      this.focusCargoID = cargo.id
    }
  },
  components: {
    Notice,
    Cargoes,
    Query
  }
}
</script>

<style lang="stylus">
body
  margin 0
  background-color #f0f4f8
  font-family Avenir,Helvetica,Arial,sans-serif
  -webkit-text-size-adjust none
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
  flex 0 1 1200px
  min-width 480px
  box-sizing border-box

.trace-blank
  line-height 20px

nav
  height 90px
  padding 0 15px
  display flex
  margin-bottom 60px
  background-color #fff
  box-shadow 0 2px 4px #0001
  h1
    color #333
    font-size 20px
    font-weight 600
    line-height 40px
    text-align center
  .main-width
    position relative
.trace-i18n
  position absolute
  top 50%
  right 0
  transform translateY(-50%)
  padding 0 4px
  font-size 14px
  display flex
  span
    display block
    line-height 30px
    height 30px
    border solid 1px #bfbfbf
    box-sizing border-box
    color #666
    cursor pointer
  span:first-child
    border-right none
    padding 0 4px 0 8px
    border-radius 15px 0 0 15px
  span:last-child
    border-left none
    padding 0 8px 0 4px
    border-radius 0 15px 15px 0
  .focus
    background-color #1e64b4
    color #fff
    border-color #1e64b4
.trace-back
  position absolute
  top 50%
  left 0
  transform translateY(-50%)
  color #333
  cursor pointer
  transition color .3s
  &:hover
    color #1e64b4
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
  border-radius 10px
  background-color #fff
  padding 40px 30px
  box-shadow 0 2px 4px #0001
  margin-bottom 20px
  position relative

.trace-notice
  margin-top 4px
  font-size 12px
  color #666

.trace-intro
  padding 20px 100px
  p
    font-size 18px
    line-height 30px
    color #666
  .trace-intro-start
    width 300px
    height 60px
    background #1E64B4
    border-radius 10px
    line-height 60px
    text-align center
    color #fff
    font-size 18px
    cursor pointer
    margin 100px auto 80px

.trace-login
  flex 0 1 800px
  margin auto
  padding 20px 150px
  h2
    margin 60px auto
    font-weight 400
    text-align center
    font-size 24px
    line-height 30px
    color #333
  p
    margin 20px 0
    font-size 18px
    line-height 20px
    color #666
  .trace-login-start
    width 300px
    height 60px
    background #1E64B4
    border-radius 10px
    line-height 60px
    text-align center
    color #fff
    font-size 18px
    cursor pointer
    margin 60px auto 80px

.trace-login-select
  cursor pointer
  height 80px
  border solid 1px #d2d2d2
  border-radius 10px
  overflow hidden
  position relative
  &:after
    content ''
    position absolute
    right 24px
    top 35px
    width 0
    height 0
    border-top solid 13px #bfbfbf
    border-left solid 10px transparent
    border-right solid 10px transparent
    transition transform .4s, opacity .4s
.trace-login-select-open
  overflow visible
  li:nth-child(even)
    background-color #f9f9f9
  &:after
    transform scaleY(0)
    opacity 0
.trace-login-options
  border solid 1px #d2d2d2
  border-radius 10px
  overflow hidden
  position absolute
  left -1px
  top -1px
  width 100%
  transition transform .4s
  li
    height 80px
    line-height 80px
    display flex
    background-color #fff
  img
    width 40px
    height 40px
    border-radius 20px
    margin 20px 24px
  span
    font-size 18px
    color #333

.trace-modal
  position fixed
  top 0
  left 0
  background-color #0004
  width 100%
  height 100%
  display flex
  align-items center
  z-index 10
  .main
    margin auto
    padding 40px
    box-sizing border-box
    width 700px
    background-color #fff
    border-radius 10px
    position relative
  .close
    position absolute
    top -40px
    right 0
    width 30px
    height 30px
    box-sizing border-box
    border-radius 15px
    border solid 2px #fff
    cursor pointer
    span
      position absolute
      top 12px
      left 3px
      display block
      height 2px
      width 20px
      background-color #fff
      &:first-child
        transform rotate(45deg)
      &:last-child
        transform rotate(-45deg)
  h2
    font-weight 400
    text-align center
    font-size 20px
    color #333
    margin-bottom 40px
  input
    display block
    width 500px
    height 60px
    border 1px solid #d2d2d2
    border-radius 10px
    font-size 18px
    margin auto
    padding 10px 20px
    position relative
    background transparent
    z-index 1
  .notice
    position absolute
    left 121px
    top 100px
    line-height 62px
    color #999
    font-size 18px
    z-index 0
  .button
    width 300px
    height 60px
    background #bfbfbf
    border-radius 10px
    line-height 60px
    text-align center
    color #fff
    font-size 18px
    cursor pointer
    margin 60px auto 20px
    transition background-color 0.4s
  .button-active
    background-color #1E64B4

.trace-decimals
  font-size 14px
  color #666
</style>
