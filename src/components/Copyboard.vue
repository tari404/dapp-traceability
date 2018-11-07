<template>
  <div id="copy-board">
    <p>复制地址 <span>{{state}}</span></p>
    <ul>
      <li :class="{ 'clicked': clicked === 0 }">管理员</li>
      <li :class="{ 'clicked': clicked === 1 }">普通1</li>
      <li :class="{ 'clicked': clicked === 2 }">普通2</li>
      <li :class="{ 'clicked': clicked === 3 }">普通3</li>
    </ul>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import { mapGetters } from 'vuex'

export default {
  name: 'Copyboard',
  data () {
    return {
      state: '',
      clicked: -1,
      sto: 0
    }
  },
  computed: {
    ...mapGetters({
      address: 'web3/addressByIndex'
    })
  },
  mounted () {
    const lists = this.$el.querySelectorAll('li')
    lists.forEach((list, index) => {
      const clipboard = new Clipboard(list, {
        text: () => this.address(index)
      })
      clipboard.on('success', () => {
        this.state = '成功'
        this.clicked = index
        requestAnimationFrame(() => {
          this.clicked = -1
        })
        clearTimeout(this.sto)
        this.sto = setTimeout(() => {
          this.state = ''
        }, 2400)
      })
      clipboard.on('error', () => {
        this.state = '失败'
        clearTimeout(this.sto)
        this.sto = setTimeout(() => {
          this.state = ''
        }, 1400)
      })
    })
  }
}
</script>

<style lang="stylus" scoped>
#copy-board
  position fixed
  bottom 0
  left 0
  font-size 12px
p
  margin 0
  padding 1px 6px
  border-top-right-radius 5px
  color #fff
  background-color #0d85da80
ul
  display flex
li
  padding 2px 5px
  cursor pointer
  background-color #fff
  color #0006
  transition color .4s, background-color 2.4s
  &:hover
    color #000a
.clicked
  background-color #0d85da
  transition none
</style>
