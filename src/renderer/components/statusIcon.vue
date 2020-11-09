<template>
  <div class="cont">
    <el-button 
      size="mini"
      :type="type"
      :icon="icon" 
      circle
    />
  </div>
</template>

<script>
  export default {
    name: 'status-icon',
    props: ['status'],
    data () {
      return {
        show: false
      }
    },
    computed: {
      type() {
        return this.status == 1 ? 'success' : this.status == 2 ? 'danger' :  'primary'
      },
      icon() {
        return this.status == 1 ? 'el-icon-check' : this.status == 2 ? 'el-icon-close' : 'el-icon-edit'
      }
    }
  }
</script>

<style scoped>
  .cont {
    display: inline-block;
    margin: 0 2px;
  }
  .el-button--mini.is-circle {
    padding: 0px !important;
  }
</style>
