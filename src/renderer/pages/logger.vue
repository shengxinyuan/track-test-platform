<template>
  <div class="logger">
    <PageHeader title="埋点测试 " :tip="` （${intStatus}  ip：${ip} port：${port}）`">
      <QrcodeComp :ip="ip" :port="port" />
    </PageHeader>

    <div class="tab">
      <el-button class="clear-btn" @click="clearAll">清除全部数据</el-button>
      <div class="table">
        <div class="flex">
          <el-col class="list list1">
            <h5 class="list-title">
              埋点列表
              <span class="fliter-box">
                <el-input size="small" clearable placeholder="请输入条件" v-model="fliterName" class="input-with-select">
                  <el-button slot="append" icon="el-icon-search" class="btn" @click="filterRawList"></el-button>
                </el-input>
              </span>
            </h5>
            <el-collapse accordion @change="selectTester" class="list-cont">
              <el-collapse-item v-for="(v, i) in rawList" :key="i" :name="i">
                <template slot="title">
                  <div class="title-box">
                    <div class="index">{{i + 1}}. </div>
                    <div class="name">
                      <div class="txt">{{v.name}}</div>
                      <div class="txt">{{v.raw['event_id'] || v.raw['eventId']}}</div>
                    </div>
                    <StatusSelector
                      v-model="v.status"
                      :info="v"
                      @click.stop.native
                      v-on:handelBugModal="handelBugModal"
                    />
                  </div>
                </template>
                <div class="detail-cont">
                  <div class="detail-info" v-for="(val, index) in v.infoList.filter((val) => val.value)" :key="index">
                    <span class="detail-info-key">{{val.key}}:</span>
                    <span class="detail-info-value">{{val.value}}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-col>

          <el-col class="list list2" v-if="selectedItem">
            <h5 class="list-title">
              <span class="title-txt">埋点对比</span>
              <el-button size="mini" icon="el-icon-delete" @click="deleteList('selectedLoggerList')"></el-button>
              <el-button size="mini" icon="el-icon-s-operation" @click="fliterSelectedLoggerList"></el-button>
              <el-checkbox v-model="toggleSaveData">切换保留数据</el-checkbox>

            </h5>
            <el-collapse class="list2-item-box list-cont">
              <el-collapse-item
                v-for="(selectedLogger, i) in selectedLoggerList"
                :key="i"
                :name="i"
                class="list2-item"
                :class="isSelect(selectedLogger)"
              >
                <template slot="title">
                  <div class="list2-item-title-box">
                    <p class="flex1">{{selectedLogger.eventId}}</p>
                    <p class="rightTxt">次数：{{selectedLogger.counter}}</p>
                  </div>
                </template>
                <el-collapse class="list2-item-box" v-if="selectedLogger.children">
                  <el-collapse-item v-for="(item, index) in selectedLogger.children" :key="item.infoList.time" :name="index" class="list2-item">
                    <template slot="title" >
                      <div class="list2-item-title-box" @click="showReceivePoint(item.raw.time)">
                        <p class="flex1 pd-left20">第{{item.num}}次 详细数据</p>
                      </div>
                    </template>
                    <div class="detail-cont">
                      <div class="detail-info" v-for="(val, index1) in item.infoList" :key="index1">
                        <template v-if="(dialogCheckList.length && dialogCheckList.includes(val.key)) || dialogCheckList.length === 0">
                          <span class="detail-info-key">{{val.key}}<statusIcon v-if="isSelect(selectedLogger) && val.status != 0" :status="val.status" />:</span>
                          <span class="detail-info-value">{{val.value}}</span>
                        </template>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-collapse-item>
            </el-collapse>
          </el-col>

          <el-col class="list list3">
            <div class="list-title">
              <span class="label">埋点记录</span>
              <el-button size="mini" v-if="!receiveStatus" @click="receiveStatus = !receiveStatus" icon="el-icon-video-play" type="primary">start</el-button>
              <el-button size="mini" v-else @click="receiveStatus = !receiveStatus" icon="el-icon-video-pause" type="danger">stop</el-button>
              <el-button size="mini" @click="deleteList('receiveList')" icon="el-icon-delete"></el-button>
              <el-button size="mini" @click="testAdd1">+</el-button>
              <el-button size="mini" @click="testAdd2">+</el-button>
            </div>
            <div class="list3-item-box list-cont" ref="list3">
              <div class="list3-item" v-for="(v, i) in receiveList" :key="v.time || i" :class="v.time === rightKey ? 'on' : ''">
                {{v}}
              </div>
            </div>
          </el-col>
        </div>
      </div>
    </div>

    <el-dialog
      title="展示字段"
      :visible.sync="dialogVisible"
      :before-close="handleClose">
      <div>
        <p>备注：(取功能测试点详情第一条的所有字段) </p>
        <p>(字段少请更新) =》 <el-button size="mini" @click="updateParseInfo">更新字段</el-button></p>
        <el-checkbox-group v-model="dialogCheckList">
          <el-checkbox class="check-item" :label="v" v-for="(v, i) in dialogList" :key="i"></el-checkbox>
        </el-checkbox-group>
      </div>
    </el-dialog>

    <el-dialog
        v-if="groupId == 1000"
        title="生成bug单"
        :visible.sync="isBugModelVisible"
        :modal-append-to-body="false"
        width="500px"
        center
        class="dialog-con"
      >
        <el-form :model="bugModel" ref="modifyForm" style="padding-right: 26px;">
          <el-form-item label="标题：" label-width="100px" required>
            <el-input v-model="bugModel.title" placeholder="请输入标题" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="描述：" label-width="100px" required>
            <el-input
              v-model="bugModel.description"
              type="textarea"
              :rows="3"
              placeholder="请输入内容描述"
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="版本：" label-width="100px" required>
            <el-input placeholder="请选择tapd迭代版本" v-model="bugModel.iterationId">
              <el-select v-model="bugModel.versionId" slot="prepend" @change="handleVerson(bugModel.versionId)" placeholder="请选择版本" style="width: 150px">
                <el-option
                  v-for="d in versionList"
                  :key="d.versionId"
                  :label="d.version"
                  :value="d.versionId"
                >
                  {{d.version}}
                </el-option>
              </el-select>
            </el-input>
          </el-form-item>
          <el-form-item label="平台：" label-width="100px" required>
            <el-select v-model="bugModel.module" placeholder="请选择平台" auto-complete="off" style="width: 100%" required>
              <el-option
                v-for="d in platformList"
                :key="d.id"
                :label="d.name"
                :value="d.name"
              >{{d.name}}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理人：" label-width="100px" required>
            <el-autocomplete
              popper-class="my-autocomplete"
              v-model="selectedOwner"
              :fetch-suggestions="querySearch"
              placeholder="请输入处理人p账号"
              @select="handleSelect"
              style="width: 100%;">
              <template slot-scope="{ item }">
                <span class="addr">{{ item.value }}</span>
              </template>
              <el-option
                v-for="d in platformList"
                :key="d.id"
                :label="d.name"
                :value="d.id"
              >{{d.name}}</el-option>
            </el-autocomplete>
          </el-form-item>
          <el-form-item style="text-align: center">
              <el-button type="primary" @click="createBug">确定</el-button>
              <el-button @click="cancel" style="margin-left: 35px;">取消</el-button>
            </el-form-item>
        </el-form>
      </el-dialog>
  </div>
</template>

<script>
  import PageHeader from '../components/pageHeader'
  import StatusSelector from '../components/statusSelector'
  import StatusIcon from '../components/statusIcon'
  import QrcodeComp from '../components/qrcode'
  import getIPAdress from '../../utils/getIPAdress'
  import parseUrl from '../../utils/parseUrl'

  export default {
    components: {
      PageHeader,
      StatusSelector,
      StatusIcon,
      QrcodeComp
    },
    data() {
      return {
        intStatus: '未连接',
        receiveStatus: true, //是否开始接收数据
        json: [
          {
            name: '默认埋点Test',
            status: '',
            raw: {
              '页面':'Test页面',
              '事件':'Test事件',
              '事件中文名':'默认埋点Test',
              'event_id':'hx_P_test',
              'event_type':'P',
              'pagename':'1',
              'pdt':'Y(0|1 是否当日看到test页面)',
              'extend1': '{"params1":"aaa"}'
            },
            infoList: [
              {
                key: '页面',
                value: 'Test页面'
              },
              {
                key: '事件',
                value: 'Test事件'
              },
              {
                key: '事件中文名',
                value: '默认埋点Test'
              },
              {
                key: 'event_id',
                value: 'hx_P_test'
              },
              {
                key: 'event_type',
                value: 'P'
              },
              {
                key: 'pagename',
                value: '1'
              },
              {
                key: 'pdt',
                value: 'Y(0|1 是否当日看到test页面)'
              },
              {
                key: 'extend1',
                value: '{"params1":"aaa"}'
              }
            ]
          },
        ],
        rawList: [
          {
            name: '默认埋点Test',
            status: '',
            raw: {
              '页面':'Test页面',
              '事件':'Test事件',
              '事件中文名':'默认埋点Test',
              'event_id':'hx_P_test',
              'event_type':'P',
              'pagename':'1',
              'pdt':'Y(0|1 是否当日看到test页面)',
              'extend1': '{"params1":"aaa"}'
            },
            infoList: [
              {
                key: '页面',
                value: 'Test页面'
              },
              {
                key: '事件',
                value: 'Test事件'
              },
              {
                key: '事件中文名',
                value: '默认埋点Test'
              },
              {
                key: 'event_id',
                value: 'hx_P_test'
              },
              {
                key: 'event_type',
                value: 'P'
              },
              {
                key: 'pagename',
                value: '1'
              },
              {
                key: 'pdt',
                value: 'Y(0|1 是否当日看到test页面)'
              },
              {
                key: 'extend1',
                value: '{"params1":"aaa"}'
              }
            ]
          },
        ],
        selectedItem: '',
        selectedLoggerList: [], //选择的埋点数据列表
        receiveList: [], // 接收到的埋点数据列表
        ip: '',
        port: '3003',
        rightKey: '',
        fliterName: '',
        dialogVisible: false,
        dialogCheckList: [],
        dialogList: [],
        testPlanId: '',
        toggleSaveData: false, // 切换埋点不清除 埋点对比列表
        versionList: [],
        selectedOwner:'',
        userList: [],
        isBugModelVisible: false,
        bugModel: {
          workspaceId: 20374132,
          title: '',
          description: '',
          versionId: 2,
          iterationId: "",
          module: "",
          owner_username: "",
          owner_paccount: ""
        }, //bug 单子单元
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
        ]
      }
    },
    mounted () {
      this.webSocket()
      this.ip = getIPAdress()
    },
    activated() {
      this.updateJson()
    },
    computed: {
      groupId() {
        return this.$store.state.common.groupId
      }
    },
    methods: {
      // 进入页面后更新数据
      updateJson() {
        if (this.$store.state.logger.ownLoggerList.length) {
          this.json = this.$store.state.logger.ownLoggerList
          this.rawList = this.$store.state.logger.ownLoggerList
          this.$store.commit('logger_setOwnLoggerList', [])
        } else if (this.$route.query.testPlanId) {
          this.testPlanId = this.$route.query.testPlanId
          this.$fetch({
            url: '/eventTracking/api/eventPoint/list',
            data: {
              groupId: this.groupId,
              testplanId: this.testPlanId
            }
          }).then((res) => {
            if (res.code === 0) {
              this.pointList = res.data.pointList
              if (this.pointList && this.pointList.length) {
                let list = []
                this.pointList.forEach((val) => {
                  if (val.isInTestplan === 1) {
                    list.push({
                      ...JSON.parse(val.eventPoint),
                      isInTestplan: val.isInTestplan,
                      status: val.status,
                      tpOperator: val.tpOperator,
                      pointId: val.pointId,
                      tpPointId: val.tpPointId,
                      testPlanId: this.testPlanId
                    })
                  }
                })
                this.json = list
                this.rawList = list
              }
            }
          })
        }
      },
      // 待测埋点列表过滤按钮
      filterRawList() {
        if (!this.fliterName) {
          this.rawList = this.json
          return
        }
        let list = []
        let name = this.fliterName
        this.json.forEach((val) => {
          let status = val.infoList.some((v) => {
            return v && v.value && v.value.toString().includes(name)
          })
          if (status) {
            list.push(val)
          }
        })
        this.rawList = list
      },
      // 选中后在Receive内标亮展示
      showReceivePoint (time) {
        this.rightKey = time
      },
      // 选择埋点进行比较（唯一）
      selectTester(index) {
        this.selectedItem = this.rawList[index]
        if (this.selectedItem && !this.toggleSaveData) {
          this.selectedLoggerList = []
        }
        this.rightKey = ''
      },
      // 新增埋点数据
      addLogger (event) {
        // const groupId = this.$store.state.common.groupId
        if (this.receiveStatus) {
          let raw = event.data
          
          if (this.groupId == 1101) {// 海外PC
            raw = decodeURIComponent(raw)
            raw = parseUrl(raw)
          } else if (this.groupId == 1102) {// 海外M站
            raw = decodeURIComponent(raw)
            raw = parseUrl(raw)
          } else if (this.groupId == 1200) {// 起点
            if (/android/.test(raw) && /oaid/.test(raw)) {
              // 起点android
              try {
                let list = []
                list = raw.split('&')

                let obj = {}
                list.forEach((val, i) => {
                  let list = []
                  list = val.split('=')
                  obj[list[0]] = list[1]
                })
                raw = obj
              } catch (error) {
                console.log('android', error);
              }
            } else {
              // 起点ios
              try {
                let list = []
                list = raw.split('&')

                let obj = {}
                list.forEach((val, i) => {
                  let list = []
                  list = val.split('=')
                  obj[list[0]] = list[1]
                })
                raw = obj
              } catch (error) {
                console.log('android', error);
              }
            }
          } else if (/^\[HxBI/.test(raw)) {
            // 红袖iOS
            try {
              let rawJson = raw.replace('[HxBI]: ', '')
              raw = JSON.parse(rawJson)
            } catch (error) {
              console.log('iOS', error);
            }
          } else if (/^\[QdiBI/.test(raw)) {
            // 海外iOS
            console.log(event);
            try {
              let rawJson = raw.replace('[QdiBI]: ', '')
              raw = JSON.parse(rawJson)
            } catch (error) {
              console.log('iOS', error);
            }
          } else if (/android/.test(raw)) {
            try {
              // 红袖android
              raw = JSON.parse(raw)
            } catch (error) {
              // 海外android
              try {
                raw = parseUrl(raw)
              } catch (error) {
                console.log('android', error);
              }
            }
          } else {
            this.receiveList.push(raw)
            return
          }

          if (typeof raw === 'object') {
            raw.time = +new Date()
            raw['event_id'] = raw.event_id || raw.eid || raw.eventId
          }

          // 起点数据event_id拼接
          if(!raw['event_id'] && this.groupId == 1200) {
            raw['event_id'] = this.getQDEventId(raw)
          }

          this.receiveList.push(raw)

          // 选中埋点，埋点比对找到相同的eventId进行比对
          if (this.selectedItem) {
            const reg = /^[Y]|\u679a\u4e3e/;
            let hasEventId = false
            let infoList = []
            let eventId = raw['event_id'] || raw['eventId']
            let isSelect = this.selectedItem.raw['event_id'] === eventId //非起点匹配，因为event_id唯一
            // 起点even_id 模糊匹配
            if (this.groupId == 1200) {
              isSelect = this.compareQDEventId(eventId)
            }

            Object.entries(raw).forEach(([k, v]) => {
              const value = this.selectedItem.raw[k]
              if (!value) {
                status = 0 // ignore
              } else if (value == v || value.toString().includes('任意值Y')) {
                status = 1 // success
              } else if ((reg.test(value)
                || k == 'extend1'
                || k == 'param'
                || value.toString().includes('非固定值')
                || this.groupId == 1200)
                &&  value != v) { // '非固定值'校验目前只有起点
                status = 3
              } else if (!reg.test(value) && value != v) {
                status = 2  // danger
              } else {
                status = 4
              }

              infoList.push({
                key: k,
                value: v,
                status
              })
            })

            this.selectedItem.infoList.forEach((info) => {
              if (!/[\u4E00-\u9FA5]+/.test(info.key) && (info.key != 'iOS') && (info.key != 'Android')) {
                let res = infoList.some((val) => {
                  return info.key == val.key
                })
                if (!res) {
                  infoList.push({
                    key: info.key,
                    value: '',
                    status: 2  // selectedItem中所有给出的字段，即使是不确定是我值，若上报数据中数据为空，status会重置为 2（danger）
                  })
                }
              }
            })
            this.selectedLoggerList.forEach((val, index) => {
              if (val.eventId === eventId) {
                val.children.push({
                  eventId: eventId,
                  infoList: infoList,
                  raw: raw,
                  num: val.children.length + 1 || 0
                })
                val.counter++
                hasEventId = true
              }
            })
            if (!hasEventId) {
              this.selectedLoggerList.push({
                eventId: eventId,
                counter: 1,
                children: isSelect ? [{
                  eventId: eventId,
                  infoList: infoList,
                  raw: raw,
                  num: 1
                }] : [{
                  eventId: eventId,
                  infoList: infoList,
                  raw: raw,
                  num: 1
                }]
              })
            }
          }

          this.$nextTick(() => {
            this.$refs.list3.scrollTop = 10000000
          })
        }
      },
      // 是否匹配到上报数据
      isSelect(selectedLogger) {
        // 起点event_id 需要模糊匹配
        if (this.groupId == 1200) {
          return this.compareQDEventId(selectedLogger.eventId) ? 'select' : ''
        } else {
          return selectedLogger.eventId === this.selectedItem.raw['event_id'] ? 'select' : ''
        }
      },
      // 获取【起点】的 event_id
      getQDEventId(raw) {
        const eventIdList = ['pn','event','col','button','pdid']
        let event_id = ''
        let count = 0
        eventIdList.forEach((val) => {
          if (raw[val] && !raw[val].toString().includes('非固定值') && !(raw[val] == 'Y')) {
            count++
            if (count === 1) {
              event_id = raw[val]
            } else {
              event_id += '_' + raw[val]
            }
          } else {
            count++
            if (count === 1) {
              event_id = ' '
            } else {
              event_id += '_' + ' '
            }
          }
        })
        return event_id
      },
      // 模糊匹配起点的event_id
      compareQDEventId(eventId) {
        let isSelect = false
        const selectedList = this.selectedItem.raw['event_id'].split('_')
        const currentList = eventId.split('_')
        for(let i = 0; i < selectedList.length; i++) {
          if (selectedList[i] != ' ') {
            isSelect = selectedList[i] === currentList[i]
            if (!isSelect) {
              break
            }
          }
        }
        return isSelect
      },
      // 删除
      deleteList(list) {
        this[list] = []
      },
      clearAll() {
        this.json = []
        this.rawList = []
        this.selectedItem = ''
        this.selectedLoggerList = []
        this.receiveList = []
        this.rightKey = ''
        this.fliterName = ''
        this.dialogCheckList = []
        this.dialogList = []
      },
      // 过滤埋点列表按钮
      fliterSelectedLoggerList () {
        if (this.dialogList.length == 0) {
          this.updateParseInfo()
        }
        this.dialogVisible = true
      },
      // 关闭筛选字段弹窗
      handleClose(done) {
        done();
      },
      // 更新解析的字段
      updateParseInfo() {
        if (
          this.selectedLoggerList &&
          this.selectedLoggerList[0] &&
          this.selectedLoggerList[0].children &&
          this.selectedLoggerList[0].children[0] &&
          this.selectedLoggerList[0].children[0].raw
        ) {
          let raw = this.selectedLoggerList[0].children[0].raw
          Object.entries(raw).forEach(([k, v]) => {
            this.dialogList.push(k)
          })
          this.dialogCheckList = this.dialogList
        }
      },
      // webSocket服务
      webSocket () {
        this.socket = new WebSocket('ws://localhost:3003/logger')
        this.socket.addEventListener('open', (event) => {
          this.intStatus = '服务已启动'
        })
        this.socket.addEventListener('error', (event) => {
          console.log(event)
        })
        this.socket.addEventListener('message', this.addLogger)
      },
      // 新增测试数据1
      testAdd1 () {
        this.addLogger({data: JSON.stringify({
          "logtime":"2020-08-14 20:29:49",
          "platform":"android",
          "version":"8.7.1",
          "uid":"0",
          "imei":"bca61f1752f59fa3",
          "qimei":"15a4a93065de726a",
          "os_version":"10",
          "network_type":"wifi",
          "shw":"1440*2792",
          "event_id":"hx_P_test",
          "event_type":"P",
          "load_source":"1000014",
          "guid":"461415703",
          "pdt":"1",
          "extend1": {
            'aaa': 1,
            'bbb': 2
          }
        })})
      },
      // 新增测试数据2
      testAdd2 () {
        this.addLogger({data: JSON.stringify({
          "logtime":"2020-08-14 20:29:49",
          "platform":"android",
          "version":"8.7.1",
          "uid":"0",
          "imei":"bca61f1752f59fa3",
          "qimei":"15a4a93065de726a",
          "os_version":"10",
          "network_type":"wifi",
          "shw":"1440*2792",
          "event_id":"hx_P_openapp",
          "event_type":"P",
          "load_source":"1000014",
          "guid":"461415703",
          "pagename":"openapp",
          "pdt":"1",
        })})
      },

      /**
       * 支持一键提bug功能
       */
      // 展开bug单modal
      handelBugModal() {
        Promise.all([this.loadVersionData(), this.loadUserData()]).then(res => {
          this.isBugModelVisible = this.isBugModelVisible ? false : true
        })
      },
      loadVersionData() {
        return this.$fetch({
          url: '/eventTracking/api/version/list',
          data: {
            groupId: this.groupId,
          }
        }).then((res) => {
          if (res.code == '0') {
            this.versionList = res.data.versionList;
          }
        })
      },
      loadUserData() {
        return this.$fetch({
          url: '/eventTracking/api/user/list',
        }).then((res) => {
          if (res.code == '0') {
            const groupInfo = res.data.groupInfo
            groupInfo.forEach((val) => {
              if (val.groupId == this.groupId) {
                this.bugModel.workspaceId = val.workspaceId
                this.userList = val.userList;
              }
            })
          }
        })
      },
      handleVerson(versionId) {
        this.versionList.forEach((val) => {
          if (val.versionId == versionId) {
            this.bugModel.iterationId = val.iterationId
          }
        })
      },
      /*处理人搜索*/
      querySearch(queryString, cb) {
        const userList = this.userList;
        let results = []
        userList.forEach((val) => {
          results.push({
            value: val.p_account + '(' + val.userName + ')'
          })
        })
        results = queryString ? results.filter(this.createFilter(queryString)) : results;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      createFilter(queryString) {
        return (user) => {
          return (user.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
        };
      },
      /* 匹配选中的 P账号 & username */
      handleSelect(selectOwner) {
        const list = selectOwner.value.split('(')
        this.bugModel.owner_username = list[1].split(')')[0]
        this.bugModel.owner_paccount = list[0]
      },
      /* 生成bug单 */
      createBug() {
        this.$fetch({
          url: '/eventTracking/api/bug/create',
          type: 'POST',
          data: this.bugModel
        }).then((res) => {
          if (res.code == '0') {
            this.selectedOwner = ''
            this.bugModel = {}
            this.isBugModelVisible = this.isBugModelVisible ? false : true
          }
        })
      },

      /* 取消生成bug单*/
      cancel() {
        this.selectedOwner = ''
        this.bugModel = {}
        this.isBugModelVisible = this.isBugModelVisible ? false : true
      }
    },
  }
</script>

<style lang="scss" scoped>
.logger {
  height: 100vh;
}
.log-header {
  background: #fafafa;
  color: rgba(48, 100, 239, 1);
  font-size: 24px;
  padding: 6px 16px;
  .net-status {
    font-size: 18px;
  }
}
.tab {
  margin: 10px 16px;
}
.clear-btn {
  margin: 10px 0;
}
.detail-cont {
  display: block;
  border-top: 1px solid #E4E7ED;
}
.detail-info {
  padding: 0 0 0 10px;
  line-height: 20px;
  font-size: 14px;
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  .detail-info-key {
    display: block;
    color: rgba(48, 100, 239, 1);
    margin-right: 6px;
    width: 90px;
    text-align: right;
  }
  .detail-info-value {
    flex: 1;
  }
}

.list-title {
  font-weight: normal;
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  margin: 0;
  font-size: 16px;
}

.list {
  height: calc(100vh - 150px);
  border: 1px solid #E4E7ED;
  border-radius: 4px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  .list-cont {
    flex: 1;
    overflow-y: scroll;
  }
}
.list1 {
  width: 450px;
  .list-title {
    overflow: hidden;
    background: #fafafa;
    padding-right: 0;
    .input-with-select {
      width: 240px;
    }
    .btn:active {
      color: rgba(48, 100, 239, 1);
    }
    .fliter-box {
      font-size: 14px;
      margin-left: 20px;
      font-weight: normal;
    }
  }
  .title-box {
    font-family: Arial, Helvetica, sans-serif;
    position: relative;
    display: flex;
    height: 48px;
    width: 100%;
    .index {
      margin-left: 36px;
    }
    .name {
      margin-left: 8px;
      flex: 1;
      display: flex;
      overflow: hidden;
      height: 100%;
      justify-content: center;
      flex-direction: column;
      .txt {
        line-height: 1.4;
      }
    }
  }
}
.list2 {
  margin-left: 6px;
  width: 400px;
  .list-title {
    background: #fafafa;
    .title-txt {
      font-weight: normal;
      margin-right: 20px;
    }
  }
  .list2-item-box {
    flex: 1;
    color: rgb(255, 255, 255);
    font-family: Arial, Helvetica, sans-serif;
  }
  .list2-item {
    width: 100%;
    word-break: break-all;
    word-wrap: break-word;
    border-bottom: 1px solid rgb(241, 241, 241);
    font-size: 14px;
  }
  .list2-item-title-box {
    width: 100%;
    height: 100%;
    line-height: 1;
    display: flex;
    align-items: center;
    margin-left: 20px;
    .rightTxt {
      margin-left: 4px;
    }
  }
  .detail-info-key {
    width: 120px;
  }
}
.list3 {
  flex: 1;
  margin-left: 6px;
  .list-title {
    font-weight: normal;
    border-bottom: 1px solid #E4E7ED;
    background: #fafafa;
    .label {
      margin-right: 20px;
    }
  }
  .list3-item-box {
    flex: 1;
  }
  .list3-item {
    box-sizing: border-box;
    width: 100%;
    word-break:break-all;
    word-wrap:break-word;
    color: #000;
    border-bottom: 1px solid #E4E7ED;
    font-size: 14px;
    line-height: 1.2;
    padding: 4px 16px;
    background: #fff;
    font-family: Arial, Helvetica, sans-serif;
  }
  .on {
    background: #ccc;
  }
}
.flex {
  display: flex;
}
.flex1 {
  flex: 1;
}
.marginH20 {
  margin: 0 20px;
}
.pd-left20 {
  padding-left: 20px;
}
.check-item {
  width: 120px;
}
</style>
