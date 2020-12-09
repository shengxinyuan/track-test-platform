<template>
  <div class="webPage">
    <PageHeader :title="title" />
    <iframe class="iframe" :src="url" frameborder="0"></iframe>
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
        url: this.$route.query.url,
        title: this.$route.query.title
      }
    },
  }
</script>

<style lang="scss" scoped>
  .webPage {
    height: 100vh;
    .iframe {
      border-top: 1px solid #eee;
      height: calc(100vh - 75px);
      width: 100%;
    }
  }
  
</style>
