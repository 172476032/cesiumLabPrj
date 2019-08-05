<template>
  <div
    :style="`color:${adaptColor}`"
    class="three-loc-info-container three-loc-info-container-left1"
  >
    <div :style="`color:${adaptColor}`">经度：{{langitude}}</div>
    <div :style="`color:${adaptColor}`">纬度：{{latitude}}</div>
    <div :style="`color:${adaptColor}`">视角高度：{{height}}</div>
  </div>
</template>

<script>
import bus from "@/script/bus.js";
import _ from "lodash";
import { setTimeout } from "timers";

export default {
  name: "map_loc_info",
  data() {
    return {
      langitude: "",
      latitude: "",
      height: "",
      handler: null
    };
  },
  computed: {
    map() {
      // console.log("计算属性map：", this.$store.getters.map);
      return this.$store.getters.map; //openlayers地图对象
    },

    currentBasemap() {
      return this.$store.state.map.currentBasemap;
    },
    adaptColor() {
      // if (!this.currentBasemap._realname) return "#000";
      // return this.currentBasemap._realname.indexOf("Image") > 0
      //   ? "#fff"
      //   : "#000";
      return "#ffffff";
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  mounted() {
    bus.$on("initMap3dLocInfo", this.initMap3dLocInfo);
  },
  destroyed() {},

  methods: {
    initMap3dLocInfo() {
      let interval = setInterval(() => {
        console.log("我是三维鼠标位置控件，我需要window.Viewer对象");
        if (window.Viewer instanceof Cesium.Viewer) {
          window.clearInterval(interval);
          this.addMouseMoveEvt(window.Viewer);
        }
      }, 1000);
    },
    addMouseMoveEvt(viewer) {
      let scene = viewer.scene;
      this.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      this.handler.setInputAction(movement => {
        let cartesian = scene.camera.pickEllipsoid(
          movement.endPosition,
          scene.globe.ellipsoid
        );
        if (cartesian) {
          //能获取，显示坐标
          let cartographic = scene.globe.ellipsoid.cartesianToCartographic(
            cartesian
          );
          this.latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(
            2
          );
          this.langitude = Cesium.Math.toDegrees(
            cartographic.longitude
          ).toFixed(2);
          this.height = Math.ceil(viewer.camera.positionCartographic.height);
        } else {
          //不能获取不显示
          console.log("显示实时鼠标位置出错");
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }
};
</script>

<style lang="scss">
.three-loc-info-container {
  width: 500px;
  position: absolute;
  bottom: 15px;
  z-index: 1;
  font-size: 16px;
  transition: left 0.5s;
  /* Firefox 4 */
  -moz-transition: left 0.5s;
  /* Safari and Chrome */
  -webkit-transition: left 0.5s;
  /* Opera */
  -o-transition: left 0.5s;

  & > div {
    display: inline-block;
    width: 140px;
    &:nth-child(3) {
      width: auto;
      min-width: 140px;
    }
  }
}

.three-loc-info-container-left1 {
  left: 15px;
}

.three-loc-info-container-left2 {
  left: 330px;
}
</style>
