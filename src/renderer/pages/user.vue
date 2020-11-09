<template>
  <div class="user">
    <PageHeader title="个人中心">
      <div class="el-dropdown-link dropdown-title">
        <i class="el-icon-setting user-icon"></i>
        <el-dropdown @command="handleCommand">
          <span>
            {{userInfo.userName}}
            <i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logOut">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </PageHeader>
    <div class="user-cont">
      <div class="aside">
        <div class="aside-con">
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <span style="display: block">{{userInfo.userName}}</span>
        </div>
      </div>
      <div class="cont-box">
        <el-form class="form" ref="form" :model="userInfo" label-width="80px">
          <el-form-item label="用户邮箱:">
            <el-input v-model="userInfo.ywaccount" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称:">
            <el-input v-model="userInfo.userName" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="角色:">
            <el-input v-model="userInfo.roleName" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="项目组:">
            <el-select v-model="groupId" placeholder="请选择平台" @change="save" style="width: 220px">
              <el-option
                v-for="(item, key) in userInfo.groupInfo"
                :key="key"
                :label="item.groupName"
                :value="+item.groupId">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-button v-if="userInfo.roleId == -1" type="primary" size="small" class="log-btn" @click="openAddUserDialog">新增用户</el-button>
      </div>
    </div>

    <el-dialog
      title="新增用户"
      :modal-append-to-body="false"
      :visible.sync="dialogStatus"
      width="400px"
      center
    >
      <el-form @submit.native.prevent>
        <el-form-item label="邮箱:" label-width="60px" prop="categoryName">
          <el-autocomplete
            class="autocomplete"
            width="400px"
            size="medium"
            v-model="addUserInfo.ywaccount"
            :fetch-suggestions="querySearch"
            placeholder="请输入阅文邮箱"
            :trigger-on-focus="false"
            :select-when-unmatched="true"
            clearable
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="姓名:" label-width="60px">
          <el-input v-model="addUserInfo.userName" placeholder="请输入姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色:" label-width="60px">
          <el-select v-model="addUserInfo.roleId" placeholder="请选择角色" style="width: 220px" @change="selectRoleId">
            <el-option
              v-for="(item, key) in roleList"
              :key="key"
              :label="item.name"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目:" label-width="60px">
          <el-select v-model="addUserInfo.groupIds" placeholder="请选择项目" style="width: 220px" multiple>
            <el-option
              v-for="(item, key) in userInfo.groupInfo"
              :key="key"
              :label="item.groupName"
              :value="+item.groupId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button type="primary" @click="addUser">确定</el-button>
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
        imageUrl: 'https://readx-her-1252317822.picsh.myqcloud.com/boss/test/background/123/user_1602904082_7030.png',
        userInfo: {
          userName: '',
          ywaccount: '',
          p_account: '',
          roleId: '',
          roleName: '',
          groupInfo: []
        },
        groupId: null,
        dialogStatus: false,
        addUserYwaccount: '',
        addUserGroupId: '',
        addUserInfo: {
          userName: '',
          ywaccount: '',
          p_account: '',
          roleId: '',
          roleName: '',
          groupIds: []
        },
        roleList: [
          {
            name: '管理员',
            value: -1
          },
          {
            name: '开发',
            value: 1
          },
          {
            name: '测试',
            value: 2
          }
        ]
      }
    },

    activated () {
      this.loadData()
    },

    methods: {
      selectRoleId() {
        this.roleList.forEach((item) => {
          if (item.value === this.addUserInfo.roleId) {
            this.addUserInfo.roleName = item.name
          }
        })
      },
      querySearch(queryString, cb) {
        if (queryString.includes('@')) {
          cb([])
        } else {
          cb([{ value: `${queryString}@yuewen.com`, address: `${queryString}@yuewen.com` }]);
        }
      },

      addUser(e) {
        this.$fetch({
            url: '/eventTracking/api/admin/userManage',
            type: 'post',
            data: {
              userName: this.addUserInfo.userName,
              yw_account: this.addUserInfo.ywaccount.replace('@yuewen.com', ''),
              p_account: this.addUserInfo.p_account,
              roleId: this.addUserInfo.roleId,
              roleName: this.addUserInfo.roleName,
              groupIds: this.addUserInfo.groupIds
            }
          }).then((res) => {
            if (res.code === 0) {
              this.$message({
                message: '成功',
                type: 'success'
              })
            }
          })
      },

      loadData() {
        this.$fetch({
          url: '/eventTracking/api/user/info'
        }).then((res) => {
          if (+res.code === 0) {
            this.groupId = +this.$store.state.common.groupId
            res.data.ywaccount = res.data.ywaccount + '@yuewen.com'
            this.userInfo = Object.assign(this.userInfo, res.data);
          }
        })
      },

      save() {
        this.$store.commit('common_setGroupId', this.groupId)
        localStorage.setItem('groupId', this.groupId);

        this.$message({
          message: '切换成功',
          type: 'success',
        });
      },

      handleCommand(command) {
        localStorage.removeItem('ywaccount')
        localStorage.removeItem('groupId')
        this.$emit('getLoginStatus')
      },

      openAddUserDialog() {
        this.dialogStatus = true
      }
    }
  }
</script>

<style lang="scss" scoped>
  .user {
    height: 100vh;
    background-color: rgba(242, 245, 248, 0.46);
    border-radius: 8px;
    box-shadow: 0px 0px 5px -1px #f8f8f9;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .dropdown-title {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .el-dropdown-link {
    cursor: pointer;
  }
  .log-btn {
    margin-top: 20px;
    height: 30px;
  }
  .user-cont {
    display: flex;
    flex: 1;
  }
  .aside {
    width: 200px;
    background-color: rgba(215, 234, 249, 0.6);
    display: flex;
    justify-content: center;
  }
  .avatar {
    height: 100px;
    width: 100px;
    padding-bottom: 16px;
  }
  .aside-con {
    margin-top: 140px;
    text-align: center;
  }
  .cont-box {
    margin-left: 140px;
    padding-top: 140px;
    display: flex;
    justify-content: center;
  }
  .form {
    display: block;
    margin: 16px;
    width: 300px;
  }
</style>
