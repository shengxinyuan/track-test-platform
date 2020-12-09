<template>
  <div class="qrcode-cont" @click="showDialog">
    <img class="icon-item" src="../assets/icon-qrcode.png">
    <div v-if="status" class="dialog" @click.stop>
      <img class="icon-close" @click.stop="closeDialog" src="../assets/icon-close.png">
      <div id="qrCodeImg" class="qrimg"></div>
      <el-input class="input" v-model="groupUrl" clearable></el-input>
      <div class="tip" v-html="tip"></div>
      <div class="cont">
        <el-button type="primary" size="small" class="btn" @click="proCode">生成二维码</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import QRCode from '../../utils/qrcode.min.js'
  export default {
    name: 'qrcode',
    props: ['ip', 'port'],
    data () {
      return {
        status: false,
        groupUrl: '',
        tip: ''
      }
    },
    mounted() {
      // 红袖
      if (this.$store.state.common.groupId == 1000) {
        this.groupUrl = 'https://app.hongxiu.com/debug/'
        this.tip = '<p>iOS: https://app.hongxiu.com/debug/</p><p>Android: https://app.hongxiu.com/debug/</p>'
      }
      // 海外
      if (this.$store.state.common.groupId == 1100) {
        this.groupUrl = 'https://app.hongxiu.com/debug/'
      }
      // 起点
      if (this.$store.state.common.groupId == 1200) {
        this.groupUrl = `QDReader://app/openHXTTP?query={"url":"ws://${this.ip}:3003/logger"}`
        this.tip = '<p>默认url: QDReader://app/openHXTTP?query={"url":"ws://${this.ip}:3003/logger"}</p>'
      }

    },
    methods: {
      showDialog() {
        if(this.status) {
          return
        }
        this.status = true
        setTimeout(() => {
          this.qrcode = new QRCode(document.getElementById('qrCodeImg'), {
            text: this.groupUrl,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
          })
        }, 0)
      },
      closeDialog() {
        this.status = false
      },
      proCode() {
        if (this.qrcode) {
          this.qrcode.makeCode(this.groupUrl)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.qrcode-cont {
  position: relative;
  .dialog {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 300px;
    padding: 20px;
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 4px;
    .input {
      margin: 10px 0;
    }
    .icon-close {
      position: absolute;
      top: 10px;
      right: 10px;
      display: block;
      width: 14px;
      height: 14px;
      cursor: pointer;
    }
    .qrimg {
      width: 200px;
      height: 200px;
      line-height: 200px;
      text-align: center;
      margin: 0 auto;
    }
    .tip {
      font-size: 12px;
    }
    .cont {
      display: flex;
      justify-content: flex-end;
      .btn {
        display: block;
      }
    }
  }
}
.icon-item {
  margin: 0 auto;
  display: block;
  width: 20px;
  cursor: pointer;
}
</style>
