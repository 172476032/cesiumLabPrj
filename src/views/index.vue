<template>
  <div class="app-main-swrap">
    <div class="weather">
      <iframe width="220"
              scrolling="no"
              height="20"
              frameborder="0"
              allowtransparency="true"
              src="//i.tianqi.com/index.php?c=code&id=11&color=%23FFFFFF&bgc=%23&icon=1&site=13"></iframe>
    </div>
    <div class="app-main-swrap-header">
      <div class="logo"><img src="../../static/layout/logo.png"></div>
      <img class="app-main-swrap-header-img"
           src="../../static/layout/头部.png">
    </div>
    <div class="app-main-swrap-content">
      <map-layout></map-layout>
    </div>
  </div>
</template>

<script>
import mapLayout from "@/components/cjMap/index.vue";

export default {
  data() {
    return {};
  },
  components: { mapLayout },
  mounted() {},
  computed: {},
  methods: {},
  destroyed() {}
};
</script>

<style lang="scss" scope>
.app-main-swrap {
  width: 100%;
  height: 100%;
  .logo {
    width: 100%;
    height: 100%;
    top: 16px;
    position: absolute;
    text-align: center;
    img {
      width: 25%;
      display: inline-block;
    }
  }
  .app-main-swrap-header {
    width: 100%;
    height: 60px;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 2;
    .app-main-swrap-header-img {
      width: 100%;
      height: 100%;
    }
  }
  .app-main-swrap-content {
    height: 100%;
  }
  .weather {
    position: absolute;
    top: 30px;
    left: 50px;
    z-index: 20;
  }
}
</style>
