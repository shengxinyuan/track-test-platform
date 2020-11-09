<template>
  <div class="testList">
    <PageHeader title="测试计划列表"/>
    <div class="list-header">
      <el-button type="primary" size="small" class="log-btn" @click="handelModal">创建计划</el-button>
    </div>
      <div
        class="table-con"
      >
        <el-table :data="testList" class="table" height="80vh" stripe border>
          <el-table-column prop="name" label="计划名称" width="300"></el-table-column>
          <el-table-column prop="version" label="版本"  width="100"></el-table-column>
          <el-table-column label="平台" width="80">
            <template slot-scope="scope">
              <span>{{platform(scope.row.platform)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <span>{{scope.row.status == '0' ? '未开始' : '已完成'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="150"></el-table-column>
          <el-table-column prop="operator" label="创建人" width="120"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                @click="handleDelete(scope.$index, scope.row)">删除</el-button>
              <el-button
                size="mini"
                type="text"
                @click="goLogger(scope.$index, scope.row)">开始测试</el-button>
              <el-button
                size="mini"
                type="text"
                @click="testDetail(scope.$index, scope.row)">查看详情</el-button>
              <el-button
                size="mini"
                type="text"
                @click="goLogList(scope.$index, scope.row)">修改埋点</el-button>
            </template>
        </el-table-column>
        </el-table>
      </div>

      <el-dialog
        title="创建计划"
        :visible.sync="modifyFormVisible"
        :modal-append-to-body="false"
        width="400px"
        center
        class="dialog-con"
      >
        <el-form :model="testModel" ref="modifyForm" style="padding-right: 26px;">
          <el-form-item label="名称：" label-width="100px" prop="categoryName">
            <el-input v-model="testModel.planName" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="版本：" label-width="100px" prop="categoryLevel">
            <el-select v-model="testModel.versionId" placeholder="请选择版本" auto-complete="off" style="width: 224px">
              <el-option
                v-for="d in versionList"
                :key="d.versionId"
                :label="d.version"
                :value="d.versionId"
              >
                {{d.version}}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="平台：" label-width="100px" >
            <el-select v-model="testModel.platform" placeholder="请选择平台" auto-complete="off" style="width: 224px">
              <el-option
                v-for="d in platformList"
                :key="d.id"
                :label="d.name"
                :value="d.id"
              >{{d.name}}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="text-align: center">
              <el-button type="primary" @click="save">确定</el-button>
              <el-button @click="cancel">取消</el-button>
            </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog
        title="测试用例详情"
        :visible.sync="detailShow"
        :modal-append-to-body="false"
        width="600px"
        center
        class="dialog-con"
      >
        <el-form :model="testDetailInfo" ref="modifyForm">
          <el-form-item label="当前进度：" label-width="100px" style="border: 1px solid rgba(153, 153, 153, 0.28)">
            <span class="span-item">{{`总数：${testDetailInfo.results.totalCount}`}}</span>
            <span class="span-item">{{`成功：${testDetailInfo.results.successCount}`}}</span>
            <span class="span-item">{{`失败：${testDetailInfo.results.failedCount}`}}</span>
            <span class="span-item">{{`未选中：${testDetailInfo.results.unCheckCount}`}}</span>
            <span class="span-item">{{`忽略：${testDetailInfo.results.ignoreCount}`}}</span>
          </el-form-item>
          <el-form-item label="用例名称：" label-width="100px">
            <span>{{testDetailInfo.testPlanName}}</span>
          </el-form-item>
          <el-form-item label="用例版本：" label-width="100px">
            <span>{{version(testDetailInfo.versionId)}}</span>
          </el-form-item>
          <el-form-item label="用例平台：" label-width="100px" >
            <span>{{platform(testDetailInfo.platform)}}</span>
          </el-form-item>
          <el-form-item label="创建人：" label-width="100px" >
            <span>{{testDetailInfo.operator}}</span>
          </el-form-item>
        </el-form>
      </el-dialog>
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
        platformList: [
          {
            id: 1,
            name: 'IOS',
          },
          {
            id: 2,
            name: 'Android',
          },
          {
            id: 3,
            name: 'Flutter',
          }
        ],
        modifyFormVisible: false, // 是否打开创建用例弹窗
        detailShow: false, // 是否打开测试用例详情弹窗
        testListInfo: [], // 测试计划列表
        testModel: {
          planName: '',
          versionId: '',
          platform: '',
          pointList: []
        }, // 测试计划单元
        groupId: '',
        versionList: [],
        testDetailInfo: {
          testPlanId: 10,
          testPlanName: "红袖-iOS-8.8.0-202009011011",
          groupId: 1000,
          versionId: 1,
          status: 0,
          operator: "周怡婷",
          platform: 1,
          createTime: "2020-10-14",
          pointList: [
            {
              id: 19,
              eventId: "hx_A_login_account",
              versionId: 2,
              operator: "周怡婷",
              status: 0,
              isAvaliable: 1
            }
          ],
          results: {
            totalCount: 1,
            successCount: 1,
            failedCount: 0,
            unCheckCount: 0,
            ignoreCount: 0
          }
        }
      }
    },

    activated () {
      this.groupId = this.$store.state.common.groupId

      Promise.all([this.loadTestPlanData(), this.loadVersionData()]).then(res=>{
        console.log(res);
      })
    },

    computed: {
      testList() {
        return this.testListInfo
      }
    },

    methods: {
      loadTestPlanData() {
        return new Promise((resolve, reject) => {
          this.$fetch({
            url: '/eventTracking/api/testPlan/list',
            data: {
              groupId: this.groupId,
            }
          }).then((res) => {
            if (res.code === 0) {
              this.testListInfo = res.data.list
            }
          })
        });
      },

      loadVersionData() {
        return new Promise((resolve,reject)=>{
          this.$fetch({
            url: '/eventTracking/api/version/list',
            data: {
              groupId: this.groupId,
            }
          }).then((res) => {
            if (res.code == '0') {
              this.versionList = res.data.versionList;
            }
          })
        })
      },

      platform(platformId) {
        var index = this.platformList.findIndex((e) => {
          if (e.id === platformId) return true
        })

        if (index != -1) {
          return this.platformList[index].name
        }
        return '未知平台'
      },

      version(versionId) {
        var index = this.versionList.findIndex((e) => {
          if (e.id === versionId) return true
        })

        if (index != -1) {
          return this.versionList[index].version
        }
        return '未知版本'
      },

      handelModal() {
        this.testModel = {}
        this.modifyFormVisible = this.modifyFormVisible ? false : true
      },

      /*
      * 删除用例
      */
      handleDelete(index, testPlan) {
        const model = Object.assign(testPlan, {status: -1})
        this.$confirm('删除后不可恢复哦～, 是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$fetch({
            url: '/eventTracking/api/testPlan/update',
            type: 'POST',
            data: model
          }).then((res) => {
            if (res.code === 0) {
              this.$message({
                showClose: true,
                message:  `删除成功`,
                type: 'success',
                center: true
              });
              this.loadTestPlanData()
            }
            if(res.code === -1) {
              this.$message({
                showClose: true,
                message:  `该测试计划已完成，不可再修改或删除`,
                type: 'info',
                center: true
              });
            }
          }).catch((err) => {
            this.$message.error(err.msg || '删除失败啦，请重试哇');
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      goLogger(index, testPlan) {
        const testPlanId = testPlan.testPlanId
        this.$router.push(`/logger?testPlanId=${testPlanId}`)
      },

      goLogList(index, testPlan) {
        const testPlanId = testPlan.testPlanId
        this.$router.push(`/logList?testPlanId=${testPlanId}`)
      },

      /*
      * 查看详情
      */
      testDetail(index, testPlan) {
        const testPlanId = testPlan.testPlanId
        this.$fetch({
          url: '/eventTracking/api/testPlan/get',
          data: {
            testPlanId: testPlanId,
          }
        }).then((res) => {
          if (res.code == 0) {
            this.testDetailInfo = res.data
            // console.log(this.testDetailInfo)
            this.detailShow = !this.detailShow
          }
        })
      },

      /*
      * 保存创建
      */
      save() {
        this.testModel.groupId = this.groupId;
        if (!this.testModel.versionId) {
          this.$message({
            message: '没有版本，不能创建计划',
            type: 'error'
          })
          return
        }
        this.$fetch({
          url: '/eventTracking/api/testPlan/create',
          type: 'POST',
          data: this.testModel
        }).then((res) => {
          if (res.code == '0') {
            this.handelModal()
            this.$router.push(`/logList?testPlanId=${res.data.testPlanId}`)
          }
        })
      },

      /*
      * 取消创建
      */
      cancel() {
        this.testModel = {}
        this.modifyFormVisible = this.modifyFormVisible ? false : true
      }
    }
  }
</script>

<style lang="scss" scoped>
  .testList {
    background: #f8f8f9
  }
  .list-header {
    height: 54px;
    margin-left: 16px;
    margin-right: 16px;
    border-bottom: 1px solid rgba(153, 153, 153, 0.28);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .table-con {
    margin: 16px;
  }
  .table {
    width: 100%;
    overflow: scroll;
  }
  .dialog-con {
    // margin-left: 26px;

    .num-con {
      border: 1px solid rgba(153, 153, 153, 0.28);
    }

    .span-item {
      margin-right: 20px
    }
  }
</style>
