<template>
  <div class="app">
    <div class="side-bar">
      <div>
        <img class="logo" src="./assets/logger-logo.png" alt="">
      </div>
      <a href="https://yuewen.lexiangla.com/teams/k100074/docs/c935a20ee1c811eaae650a58ac135252?company_from=yuewen" class="route-list-item" target="_blank">
        <div class="icon-box">
          <img class="icon-item" src="./assets/help.png">
          <div class="icon-label">帮助文档</div>
        </div>
      </a>
      
      <router-link :to="v.path" v-for="(v) in list" :key="v.path" class="route-list-item">
        <div class="icon-box" :class="path == v.path ? 'active':''">
          <img class="icon-item"  :src="v.icon">
          <div class="icon-label">{{v.txt}}</div>
        </div>
      </router-link>

      <div class="last">
        <div class="icon-box">
          <div class="icon-label-l">{{$store.state.common.groupName}}</div>
        </div>
        <router-link to="/user" class="route-list-item">
          <div class="icon-box" :class="path == '/user' ? 'active':''">
            <img class="icon-item" src="./assets/user.png">
            <div class="icon-label">个人中心</div>
          </div>
        </router-link>
      </div>
    </div>

    <keep-alive>
      <router-view v-if="$route.meta.keepAlive" class="main-cont" @getLoginStatus="getLoginStatus"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" class="main-cont" @getLoginStatus="getLoginStatus"></router-view>

    <el-dialog
      title="登录"
      :modal-append-to-body="false"
      :visible.sync="dialogVisible"
      width="400px"
      center
      class="dialog-con"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form @submit.native.prevent>
        <el-form-item label="邮箱：" label-width="60px" prop="categoryName">
          <el-autocomplete
            class="autocomplete"
            width="400px"
            size="medium"
            v-model="ywaccount"
            :fetch-suggestions="querySearch"
            placeholder="请输入阅文邮箱"
            :trigger-on-focus="false"
            :select-when-unmatched="true"
            clearable
            @select="login"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button type="primary" @click="login">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
        path: '',
        dialogVisible: false,
        ywaccount: '',
        restaurants: [],
        groupId: '',
        list: [
          {
            path: '/testList',
            txt: '测试计划',
            icon: require('./assets/testList.png')
          },
          {
            path: '/excel',
            txt: '上传文档',
            icon: require('./assets/excel.png')
          },
          {
            path: '/logList',
            txt: '埋点列表',
            icon: require('./assets/logList.png')
          },
          {
            path: '/logger',
            txt: '埋点测试',
            icon: require('./assets/logger.png')
          },
        ]
      }
    },
    created() {
      this.getLoginStatus()
    },
    methods: {
      querySearch(queryString, cb) {
        if (queryString.includes('@')) {
          cb([])
        } else {
          cb([{ value: `${queryString}@yuewen.com`, address: `${queryString}@yuewen.com` }]);
        }
      },
      getLoginStatus() {
        const ywaccount = localStorage.getItem('ywaccount');
        this.groupId = localStorage.getItem('groupId');
        console.log(localStorage.getItem('groupId'));
        if (!ywaccount) {
          this.dialogVisible = true
        } else {
          this.ywaccount = ywaccount
          this.login()
        }
        this.$router.push('/logger')
      },
      login() {
        this.$fetch({
          url: '/eventTracking/api/login',
          type: 'post',
          data: {
            ywaccount: this.ywaccount.replace('@yuewen.com', '')
          }
        }).then((res) => {
          if (res.code === 0) {
            this.dialogVisible = false
            this.$message({
              message: '登录成功',
              type: 'success'
            })
            localStorage.setItem('ywaccount', this.ywaccount);
            this.$fetch({
              url: '/eventTracking/api/user/info'
            }).then((res) => {
              if (res.code === 0) {
                let map = res.data.groupInfo
                this.$store.commit('common_setUserInfo', {
                  ...res.data
                })
                if (!this.groupId) {
                  this.groupId = res.data.groupInfo[0].groupId
                  this.$store.commit('common_setGroupId', this.groupId)
                  this.$store.commit('common_setGroupName', res.data.groupInfo[0].groupName)
                  localStorage.setItem('groupId', this.groupId);
                } else {
                  let name = ''
                  this.$store.commit('common_setGroupId', this.groupId)
                  map.forEach(val => {
                    if (val.groupId == this.groupId) {
                      name = val.groupName
                    }
                  });
                  console.log(name);
                  this.$store.commit('common_setGroupName', name)
                  localStorage.setItem('groupId', this.groupId);
                }
              }
            })
          } else {
            this.$message({
              message: res.msg,
              type: 'error'
            })
          }
        })
      }
    },
    watch: {
      '$route.path' (newVal, oldVal) {
        this.path = newVal
      }
    }
  }
</script>

<style lang="scss">
@import './styles/var.scss';
.app {
  height: 100vh;
  display: flex;
  .autocomplete {
    display: block;
  }
  .route-list-item {
    text-decoration: none !important;
  }
  .last {
    position: absolute;
    width: 60px;
    bottom: 40px;
  }
  .side-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 60px;
    height: 100vh;
    z-index: 1000;
    color: #fff;
    background: $color1;
    .logo {
      display: block;
      width: 40px;
      margin: 20px auto 30px auto;
    }
    .active {
      background: $color2;
    }
    .icon-box {
      padding: 8px 0;
      margin: 12px 0;
    }
    .icon-item {
      margin: 0 auto;
      display: block;
      width: 30px;
    }
    .icon-label {
      margin-top: 6px;
      width: 100%;
      color: #fff;
      text-align: center;
      font-size: 12px;
      text-decoration: none !important;
    }
    .icon-label-l {
      margin-top: 6px;
      width: 100%;
      color: #fff;
      text-align: center;
      font-size: 14px;
      text-decoration: none !important;
    }
  }
  .main-cont {
    margin-left: 60px;
    width: 100%;
  }
}
</style>