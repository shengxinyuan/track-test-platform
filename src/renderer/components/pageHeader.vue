<template>
  <div class="header">
    <div class="header-left">
      <h1 class="title">{{title}}</h1>
      <p class="header-tip">{{tip}}</p>
    </div>
    <div class="header-right">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'page-header',
    props: ['title', 'tip'],
    data () {
      return {
        show: false
      }
    },

  }
</script>

<style lang="scss" scoped>
@import '../styles/var.scss';
.header {
  height: 66px;
  background-color: #fff;
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 0px 5px -1px #999;
}

.header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  h1 {
    font-size: 20px;
    font-weight: normal;
  }
  .header-tip {
    font-size: 14px;
    color: $color3;
  }
}

.header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
