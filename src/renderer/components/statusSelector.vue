<template>
  <div class="cont">
    <div v-if="show">
      <div class="select-box">
        <el-button size="mini" type="success" icon="el-icon-check" circle @click="change(1)"></el-button>
        <el-button size="mini" type="primary" icon="el-icon-edit" @click="change(0)" circle></el-button>
        <el-button size="mini" type="danger" icon="el-icon-close" circle @click="change(2)"></el-button>
      </div>
    </div>
    <el-button 
      v-else 
      circle
      size="mini"
      :type="type"
      :icon="icon" 
      @click="toast"
    />
  </div>
</template>

<script>
  export default {
    name: 'status-selector',
    model: {
      prop: 'modelVal',
      event: 'change'
    },
    props: ['modelVal', 'info'],
    data () {
      return {
        show: false
      }
    },
    computed: {
      type() {
        return this.modelVal === 1 ? 'success' : this.modelVal=== 2 ? 'danger' : 'primary'
      },
      icon() {
        return this.modelVal === 1 ? 'el-icon-check' : this.modelVal=== 2 ? 'el-icon-close' : 'el-icon-edit'
      }
    },
    methods: {
      toast () {
        this.show = !this.show
      },
      change (status) {
        this.$emit('change', status)
        this.toast()
        // 发请求修改状态
        console.log(this.info, this.info.testPlanId);
        this.info && this.info.testPlanId && this.$fetch({
          url: '/eventTracking/api/testPlan/update',
          type: 'post',
          data: {
            testPlanId: this.info.testPlanId,
            status: 0,
            pointList: [{
              status: status,
              owner: this.$store.state.common.userInfo.userName,
              pointId: this.info.pointId,
              tpPointId: this.info.tpPointId,
              isInTestplan: 1
            }]
          }
        }).then((res) => {
          if (res.code === 0) {
            this.$message({
              message: '状态变更成功',
              type: 'success'
            })
          }
        })
      },
    }
  }
</script>

<style scoped lang="scss">
.cont {
  position: absolute;
  left: 0;
  display: block;
  margin: 0 6px;
  z-index: 2;
  .el-button--mini.is-circle {
    padding: 4px !important;
  }
  .select-box {
    background: rgba(0, 0, 0, .5);
    padding: 0 4px;
    border-radius: 4px;
  }
}
</style>
