<template>
  <div class="user-head">
    <img :src="user.img">
    <span>{{$t(`Account.player[${user.index}]`)}}</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserHead',
  props: ['address'],
  computed: {
    ...mapGetters({
      userByAddress: 'userByAddress'
    }),
    user () {
      return this.userByAddress(this.address)
    }
  }
}
</script>

<style lang="stylus" scoped>
.user-head
  display flex
  align-items center
  margin 0 10px
  img
    width 40px
    height 40px
    border-radius 50%
  span
    margin 0 10px
</style>
