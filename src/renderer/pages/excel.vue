<template>
  <div class="excel">
    <PageHeader title="上传埋点文档"/>
    <div class="option">
      <span class="blue">文档解析模式：</span>
      <i class="el-icon-star-on blue"></i>
      <el-select v-model="mode" placeholder="请选择" >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    
    <el-upload
      class="upload-demo"
      ref="upload"
      drag
      action="https://jsonplaceholder.typicode.com/posts/"
      :file-list="fileList"
      :on-change="onChange"
      :auto-upload="false">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="tip-cont">只能上传excel文件</div>
      <div slot="tip" class="tip-cont red">当前项目：「{{project}}」，文档上传远端请注意操作</div>
      <div slot="tip" class="tip-cont red">上传文档前，请先点击立即使用去查看是否解析正确</div>
    </el-upload>
    <div class="excel-btn">
      <el-button @click="update" type="danger">上传远端</el-button>
      <el-button @click="use" type="primary">立即使用</el-button>
    </div>
  </div>
</template>

<script>
  import XLSX from 'xlsx'
  import PageHeader from '../components/pageHeader'
  import { formatAllXlsxJson, getUpTableCellValue } from '../../utils/parseXlsxJson'
  export default {
    components: {
      PageHeader,
    },
    data() {
      return {
        groupId: this.$store.state.common.groupId,
        fileList: [],
        mode: 'current',
        options: [{
          value: 'all',
          label: '全部版本'
        }, {
          value: 'current',
          label: '当前任务版本'
        }],
        json: []
      }
    },
    computed: {
      project() {
        let groupName = ''
        let groupId = this.groupId
        let groupInfo = this.$store.state.common.userInfo && this.$store.state.common.userInfo.groupInfo
        groupInfo && groupInfo.length && groupInfo.forEach((item) => {
          if (item.groupId == groupId) {
            groupName = item.groupName
          }
        })
        return groupName
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      onChange (file) {
        let reader = new FileReader()
        reader.readAsBinaryString(file.raw)
        reader.onload = ev => {
          let workBook = XLSX.read(ev.target.result, {type: 'binary', cellDates: true})
          // 只取第一个sheet
          let workSheet = workBook.Sheets[workBook.SheetNames[0]]
          
          // 起点规则
          if (this.groupId == 1200) {
            let data = XLSX.utils.sheet_to_json(workSheet)
            data.forEach((item) => {
              for (let key in item) {
                if (item[key] == 'N') {
                  delete item[key] 
                }
              }
            })
            const formatDate = data.map((item) => {
              let infoList = []
              const eventIdList = ['pagename', 'event', 'col_name', 'button', 'pagedataid']
              item['event_id'] = ''
              eventIdList.forEach((val) => {
                if (item[val] && !item[val].includes('非固定值')) {
                  item['event_id'] += item[val] + '_'
                }
              })
              

              Object.entries(item).forEach(([k, v]) => {
                infoList.push({
                  key: k,
                  value: v
                })
              })
              return {
                name: item['事件中文名'],
                status: '',
                infoList: infoList,
                raw: item
              }
            })
            this.excelJsonChange(formatDate)

          } else {
            // 只读第4列开始的数据
            workSheet['!ref'] = workSheet['!ref'].replace('A1', 'D2')
            let data = XLSX.utils.sheet_to_json(workSheet)
            console.log(data);
            if (this.mode === 'current') {
              data = data.filter((val) => {
                return val['任务版本'] == workBook.SheetNames[0]
              })
            }
            
            const formatDate = data.map((item) => {
              let infoList = []
              item['event_id'] = item['event_id'] || item.eid
              Object.entries(item).forEach(([k, v]) => {
                infoList.push({
                  key: k,
                  value: v
                })
              })
              return {
                name: item['事件中文名'] || item['事件描述'],
                status: '',
                infoList: infoList,
                raw: item
              }
            })
            this.excelJsonChange(formatDate)
          }
        }
      },
      excelJsonChange (list) {
        this.json = list
      },
      use() {
        this.$store.commit('logger_setOwnLoggerList', [...this.json])
          this.$router.push('/logger')
      },
      update() {
        if (this.json.length === 0) {
          this.$message({
            message: '上传失败，请先选择文档',
            type: 'error'
          })
          return
        }
        let list = []
        this.json.forEach((val) => {
          list.push({
            eventId: val.raw.event_id,
            eventPoint: JSON.stringify(val),
            version: val.raw['任务版本'],
            isAvaliable: 1
          })
        }) 
        this.$fetch({
          url: '/eventTracking/api/eventPoint/uploadList',
          type: 'post',
          data: {
            groupId: this.$store.state.common.groupId,
            pointList: list
          }
        }).then((res) => {
          if (res.code === 0) {
            this.$message({
              message: '上传成功，在埋点列表查看数据。请验证数据是否正常',
              type: 'success'
            })
          } else {
            this.$message({
              message: '上传失败',
              type: 'error'
            })
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../styles/var.scss';
  .excel {
    background: #f8f8f9
  }
  .upload-demo {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .el-upload-dragger {
    margin: 20px !important;
  }
  .option {
    width: 350px;
    display: block;
    margin: 20px auto;
  }
  .blue {
    color: rgba(48, 100, 239, 1);
  }
  .excel-btn {
    text-align: center;
    display: block;
    margin: 40px auto;
  }
  .tip-cont {
    font-size: 14px;
    margin-top: 20px;
    color: $color3;
  }
  .red {
    color: #f00;
  }
</style>
