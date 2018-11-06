<template>
  <div style="display: contents;">
    <div id="tc-notice" @mouseover="holdNotice" @mouseleave="releaseNotice">
      <p />
      <span class="tc-notice-close" @click="closeNotice">X</span>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'Notice',
  mounted () {
    this.bindNoticeBox(this.$el.querySelector('#tc-notice'))
  },
  methods: {
    ...mapMutations([
      'bindNoticeBox',
      'holdNoticeBox',
      'closeNoticeBox'
    ]),
    holdNotice () {
      this.holdNoticeBox(true)
    },
    releaseNotice () {
      this.holdNoticeBox(false)
    },
    closeNotice () {
      this.closeNoticeBox()
    }
  }
}
</script>

<style lang="stylus" scoped>
#tc-notice
  position fixed
  width 100vw
  min-height 60px
  bottom 0
  left 0
  z-index 20
  box-shadow 0px -4px 4px #0001
  transition transform .6s, opacity .3s
  transform translateY(110%)
  padding 20px
  box-sizing border-box
  line-height 20px
  color #fff
  opacity .9
  &:hover
    opacity 1
.tc-notice-close
  position absolute
  top 50%
  right 20px
  transform translateY(-50%)
  cursor pointer
</style>
