<template>
  <div class="main-width trace-content">
    <div class="trace-content-title">我创建的商品</div>
    <div class="trace-cargoes-notice" v-if="cCNLoaded === 1">加载中...</div>
    <div class="trace-cargoes-notice" v-else-if="cCNLoaded === 2 && !createCargoesNames.length">没有对应记录</div>
    <ul class="trace-cargoes" v-else>
      <li class="trace-cargo" v-for="(cargo, index) in createCargoesNames" :key="index">
        <span class="name">{{cargo.name}}</span>
        <span class="traces">{{cargo.traces.length - 1}}</span>
      </li>
    </ul>
    <div class="trace-content-title">我拥有的商品</div>
    <div class="trace-cargoes-notice" v-if="hCNLoaded === 1">加载中...</div>
    <div class="trace-cargoes-notice" v-else-if="hCNLoaded === 2 && !holdCargoesNames.length">没有对应记录</div>
    <ul class="trace-cargoes" v-else>
      <li class="trace-cargo" v-for="(cargo, index) in holdCargoesNames" :key="index">
        <span class="name">{{cargo.name}}</span>
        <span class="traces">{{cargo.traces.length - 1}}</span>
      </li>
    </ul>
    <div class="trace-content-title">创建新商品</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Notice from '@/components/Notice'

export default {
  name: 'Cargoes',
  data () {
    return {
      cCNLoaded: 0,
      createCargoesNames: [],
      hCNLoaded: 0,
      holdCargoesNames: [],
    }
  },
  computed: {
    ...mapState({
      abi: state => state.web3.abi
    })
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
      'allCreated': 'web3/allCreated',
      'allHolding': 'web3/allHolding'
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
  margin 10px 0 20px
.trace-cargoes-notice
  margin 10px 0 20px
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
  padding 10px
  line-height 24px
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
@media screen and (max-width 800px)
  .trace-cargoes
    grid-template-columns repeat(3, 1fr)
@media screen and (max-width 600px)
  .trace-cargoes
    grid-template-columns repeat(2, 1fr)
</style>
