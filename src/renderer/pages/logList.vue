<template>
  <div class="logList">
    <PageHeader title="待测埋点列表" :tip="!mode ? '（请选择埋点开始测试）' : ''"/>
    <div class="table-con">
      <el-button @click="clearFilter">清除所有过滤器</el-button>
      <span>全部版本共有：{{pointList.length}}个埋点，选中：{{multipleSelection.length || selectList.length}}个埋点</span>
      <vxe-table
        v-if="pointList.length"
        ref="logListTable"
        :data="pointList"
        class="logList-table"
        height="auto"
        border
        stripe
        show-overflow="ellipsis"
        @checkbox-change="handleSelectionChange"
      >
        <vxe-table-column
          width="40"
          type="checkbox">
        </vxe-table-column>
        <vxe-table-column
          title="版本"
          field="versionName"
          width="100"
          :filters="filtersVersionList"
          :filter-multiple="true"
        >
        </vxe-table-column>
        <vxe-table-column title="状态" width="100" v-if="mode">
          <template slot-scope="scope">
            <span>{{scope.row.status | filterStatus}}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="eventName"
          width="300"
          title="事件中文名">
        </vxe-table-column>
        <vxe-table-column
          field="eventId"
          width="300"
          title="eventId">
        </vxe-table-column>
        <vxe-table-column
          field="tester"
          title="测试人员"
          width="auto"
          :filters="[...filtersIOSList]">
        </vxe-table-column>
        <vxe-table-column
          field="developerIos"
          title="开发人员(iOS)"
          width="auto"
          :filters="filtersIOSList">
        </vxe-table-column>
        <vxe-table-column
        width="auto"
          field="developerAndroid"
          title="开发人员(Android)"
          :filters="filtersAndroidList">
        </vxe-table-column>
      </vxe-table>
    </div>
    
    <div>
      <el-button type="primary" class="conform-btn" @click="btnClick">{{ mode === 'test' ? '修改用例' : '开始测试'}}</el-button>
    </div>
  </div>
</template>

<script>
  import PageHeader from '../components/pageHeader'
  export default {
    components: {
      PageHeader
    },
    data() {
      return {
        mode: '', //如有testPlanId，就是测试用例的选择 test
        pointList: [],
        multipleSelection: [],
        selectList: [],
        testPlanId: '',
        filtersVersionList: [],
        filtersTestList: [],
        filtersIOSList: [],
        filtersAndroidList: []
      }
    },
    activated() {
      this.getEventPoint()
    },
    filters: {
      filterStatus(status) {
        let txt = ''
        // 0：待验证 1：验证通过 2：验证不通过 -1：无需验证
        switch (status) {
          case 0: 
            txt = '待验证'
            break;
          case 1: 
            txt = '验证成功'
            break;
          case 2: 
            txt = '验证失败'
            break;
          default: 
            txt = ''
        }
          
        return txt
      }
    },
    methods: {
      getTestPlanId() {
        if (this.$route.query.testPlanId) {
          this.mode = 'test'
          this.testPlanId = this.$route.query.testPlanId
        } else {
          this.mode = ''
          this.testPlanId = ''
        }
      },
      getEventPoint() {
        const loading = this.$loading({
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0)'
        });
        this.getTestPlanId()
        this.$fetch({
          url: '/eventTracking/api/eventPoint/list',
          data: {
            groupId: this.$store.state.common.groupId,
            testplanId: this.testPlanId
          }
        }).then((res) => {
          if (res.code === 0) {
            loading.close();
            let pointList = res.data.pointList
            let filtersVersion = []
            let filtersTest = []
            let filtersIOS = []
            let filtersAndroid = []
            
            if (pointList && pointList.length) {
              this.selectList = [] 
              pointList.forEach((val) => {
                if (val.isInTestplan === 1) {
                  this.selectList.push(val)
                }
                const eventPoint = JSON.parse(val.eventPoint)
                val.versionName = eventPoint.raw['任务版本']
                val.developerIos = eventPoint.raw['iOS']
                val.developerAndroid = eventPoint.raw['Android']
                val.tester = eventPoint.raw['验证']
                val.eventName = eventPoint.raw['事件中文名']
                if (eventPoint.raw['任务版本'] && !filtersVersion.includes(eventPoint.raw['任务版本'])) {
                  filtersVersion.push(eventPoint.raw['任务版本'])
                }
                if (eventPoint.raw['iOS'] && !filtersIOS.includes(eventPoint.raw['iOS'])) {
                  filtersIOS.push(eventPoint.raw['iOS'])
                }
                if (eventPoint.raw['Android'] && !filtersAndroid.includes(eventPoint.raw['Android'])) {
                  filtersAndroid.push(eventPoint.raw['Android'])
                }
                if (eventPoint.raw['验证'] && !filtersTest.includes(eventPoint.raw['验证'])) {
                  filtersTest.push(eventPoint.raw['验证'])
                }
              })
              
              filtersVersion.forEach((val) => {
                this.filtersVersionList.push({
                  label: val,
                  value: val
                })
              })
              filtersTest.forEach((val) => {
                this.filtersTestList.push({
                  label: val,
                  value: val
                })
              })
              filtersIOS.forEach((val) => {
                this.filtersIOSList.push({
                  label: val,
                  value: val
                })
              })
              filtersAndroid.forEach((val) => {
                this.filtersAndroidList.push({
                  label: val,
                  value: val
                })
              })

              this.pointList = res.data.pointList

              this.$nextTick(() => {
                this.selectList.forEach(row => {
                  this.$refs.logListTable.toggleCheckboxRow(row);
                });
              })
            }
          }
        })
      },
      btnClick() {
        if (this.mode === 'test') {
          let pointList = []
          this.multipleSelection.forEach((val) => {
            pointList.push({
              status: val.status || 0,
              owner: val.tpOperator || '',
              pointId: val.pointId,
              tpPointId: val.tpPointId,
              isInTestplan: 1
            })
          })
          // 取消选择的也传给后端
          this.selectList.forEach((val) => {
            if (!this.multipleSelection.includes(val)) {
              pointList.push({
                status: val.status || 0,
                owner: val.tpOperator || '',
                pointId: val.pointId,
                tpPointId: val.tpPointId,
                isInTestplan: 0
              })
            }
          })

          this.$fetch({
            url: '/eventTracking/api/testPlan/update',
            type: 'post',
            data: {
              testPlanId: this.testPlanId,
              status: 0,
              pointList,
            }
          }).then((res) => {
            if (res.code === 0) {
              this.$router.push('/testList')
              this.$message({
                message: '成功',
                type: 'success'
              })
            }
          })
        } else {
          this.$store.commit('logger_setOwnLoggerList', [...this.multipleSelection])
          this.$router.push('/logger')
        }
      },
      clearFilter() {
        this.$refs.logListTable.clearFilter();
      },
      handleSelectionChange({ records }) {
        this.multipleSelection = records
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../styles/var.scss';
.logList {
  height: 100vh;
  background: #f8f8f9
}
.table-con {
  margin: 16px;
  height: calc(100% - 150px);
  overflow: hidden;
  .logList-table {
    margin-top: 16px;
    width: 98%;
  }
}
.conform-btn {
  margin: 0 16px;
}
</style>