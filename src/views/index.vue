<template>
  <div class="app-main-swrap">
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
    z-index: 1000;
    .app-main-swrap-header-img {
      width: 100%;
      height: 100%;
    }
  }
  .app-main-swrap-content {
    height: 100%;
  }
}
</style>
