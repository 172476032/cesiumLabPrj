<template>
  <div class="threed-container">
    <div v-if="show"
         class="threed-div"
         title="切换为二维"
         @click.prevent="toggle2d3d">3D</div>
    <div v-else
         class="threed-div"
         title="切换为三维"
         @click.prevent="toggle2d3d">2D</div>
  </div>
</template>

<script>
import Cesium from "cesium/Cesium";
import bus from "@/script/bus.js";

export default {
  name: "map_2d_3d",
  data() {
    return {
      show: false,
      firstInTo3dMap: true
    };
  },
  mounted() {},
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  destroyed() {},
  methods: {
    toggle2d3d() {
      this.show = !this.show;
      this.$store.state.map.is3dMap = !this.$store.state.map.is3dMap;
      if (this.firstInTo3dMap) {
        bus.$emit("initSceneMap");
        bus.$emit("inintMap3dZoom");
        bus.$emit("initMap3dRotate");
        bus.$emit("initMap3dLocInfo");
      }
      this.firstInTo3dMap = false;
    }
  }
};
</script>

<style lang="scss">
.threed-container {
  position: absolute;
  bottom: 90px;
  right: 35px;
  z-index: 1;
  .threed-div {
    box-shadow: 1px 2px 1px #d7dde4;
    cursor: pointer;
    width: 26px;
    height: 26px;
    overflow: hidden;
    background-color: #fff;
    z-index: 10;
    position: relative;
    text-align: center;
    line-height: 26px;
    font-size: 14px;
  }
}
</style>
