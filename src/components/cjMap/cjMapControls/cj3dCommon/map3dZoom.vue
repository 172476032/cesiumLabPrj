<template>
  <div class="three-zoom-container">
    <div
      class="zoom-div"
      title="放大一级"
      @mouseover="zoomInHover = !zoomInHover"
      @mouseout="zoomInHover = !zoomInHover"
      @click.prevent="zoomInHandler"
    >
      <div class="in" :style="`background-position: ${zoomInHover?-60:0}px 0;`"></div>
    </div>
    <div
      class="zoom-div"
      title="缩小一级"
      @mouseover="zoomOutHover = !zoomOutHover"
      @mouseout="zoomOutHover = !zoomOutHover"
      @click.prevent="zoomOutHandler"
    >
      <div class="out" :style="`background-position: ${zoomOutHover?-30:-10}px 0;`"></div>
    </div>
  </div>
</template>

<script>
import bus from "@/script/bus.js";
let Viewer;

export default {
  name: "map_zoom",
  data() {
    return {
      zoomInHover: false,
      zoomOutHover: false,
      amount: 800000
    };
  },
  computed: {
    map() {
      return this.$store.getters.map; //openlayers地图对象
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  mounted() {
    bus.$on("inintMap3dZoom", this.inintMap3dZoom);
  },
  methods: {
    inintMap3dZoom() {
      let interval = setInterval(() => {
        console.log("我是三维放大缩小控件，我需要window.Viewer对象");
        if (window.Viewer instanceof Cesium.Viewer) {
          window.clearInterval(interval);
          Viewer = window.Viewer;
        }
      }, 1000);
    },
    zoomInHandler() {
      if (Viewer instanceof Cesium.Viewer) {
        Viewer.camera.zoomIn(this.amount);
      }
    },

    zoomOutHandler() {
      if (Viewer instanceof Cesium.Viewer) {
        Viewer.camera.zoomOut(this.amount);
      }
    }
  }
};
</script>

<style lang="scss">
$zoomPic: "../../../../assets/img/map/zoom.png";
@mixin zoom-pic {
  width: 10px;
  height: 10px;
  top: 8px;
  left: 8px;
  background-image: url($zoomPic);
  position: absolute;
}

.three-zoom-container {
  position: absolute;
  bottom: 26px;
  right: 35px;
  z-index: 1;
  transform: scale(0.8);
  .zoom-div:first-child {
    border-bottom: 1px solid #ccc;
  }

  .zoom-div {
    box-shadow: 1px 2px 1px #d7dde4;
    cursor: pointer;
    width: 26px;
    height: 26px;
    overflow: hidden;
    background-color: #fff;
    z-index: 10;
    position: relative;

    & .in {
      @include zoom-pic;
      // background-position: 0 0;
    }

    & .out {
      @include zoom-pic;
      // background-position: -10px 0;
    }
  }
}

@media screen and (max-width: 1366px) {
  .zoom-container {
    bottom: 20px;
  }
}
</style>
