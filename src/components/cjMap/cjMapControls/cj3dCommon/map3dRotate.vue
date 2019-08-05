<template>
  <div class="three-rotate-container">
    <div class="rotate-txt"
         :style="`transform: rotate(${rotateDegree}deg)`">
      <span class="span1">北</span>
    </div>
    <div class="rotate-div">
      <button :title="`逆时针旋转${onceRotateDegree}°`"
              class="rotate-clockwise"
              @click.prevent="rotateClockwise"></button>
      <button title="恢复正北方向"
              class="rotate-north"
              :style="`transform: rotate(${rotateDegree}deg)`"
              @click.prevent="rotateNorth"></button>
      <button :title="`顺时针旋转${onceRotateDegree}°`"
              class="rotate-inverse-clockwise"
              @click.prevent="rotateInverseClockwise"></button>
    </div>
  </div>
</template>

<script>
import Cesium from "cesium/Cesium";
import bus from "@/script/bus.js";
import _ from "lodash";

let Viewer;

export default {
  name: "map_rotate",
  data() {
    return {
      rotateDegree: 0,
      onceRotateDegree: 5
    };
  },
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  mounted() {
    bus.$on("initMap3dRotate", this.initMap3dRotate);
  },
  destroyed() {},
  methods: {
    initMap3dRotate() {
      let interval = setInterval(() => {
        console.log("我是三维旋转控件，我需要window.Viewer对象");
        if (window.Viewer instanceof Cesium.Viewer) {
          window.clearInterval(interval);
          Viewer = window.Viewer;
        }
      }, 1000);
    },
    rotateClockwise() {
      if (Viewer instanceof Cesium.Viewer) {
        Viewer.camera.rotateLeft(Cesium.Math.toRadians(this.onceRotateDegree));
      }
    },
    rotateNorth() {
      Viewer.camera.setView({
        orientation: {
          heading: Cesium.Math.toRadians(0)
        }
      });
    },
    rotateInverseClockwise() {
      Viewer.camera.rotateRight(Cesium.Math.toRadians(this.onceRotateDegree));
    }
  },
  watch: {}
};
</script>

<style lang="scss">
$rotatePic: "../../../../assets/img/map/rotate.png";
@mixin rotate-direction {
  position: absolute;
  outline: none;
  border: none;
  background: url($rotatePic) -75px -5px / 266px no-repeat;
  cursor: pointer;
  top: 5px;
  z-index: 1;
  width: 15px;
  height: 42px;
  opacity: 1;
}

.three-rotate-container {
  position: absolute;
  bottom: 185px;
  right: 75px;
  z-index: 1;
  font-size: 16px;

  .rotate-div {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 52px;
    height: 54px;
    transform: scale(0.8);
    background: url($rotatePic) 0% 0% / 266px no-repeat;
  }

  .rotate-txt {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 52px;
    height: 54px;
    font-size: 10px;

    span {
      position: absolute;
      top: -15px;
      left: 20px;
    }
  }

  .rotate-clockwise {
    @include rotate-direction;
    left: 2px;

    &:hover {
      background: url($rotatePic) -89px -5px / 266px no-repeat;
    }
  }

  .rotate-inverse-clockwise {
    @include rotate-direction;
    right: 2px;
    transform: scaleX(-1);

    &:hover {
      background: url($rotatePic) -89px -5px / 266px no-repeat;
    }
  }

  .rotate-north {
    position: absolute;
    outline: none;
    border: none;
    background: url($rotatePic) -56px -4px / 266px no-repeat;
    cursor: pointer;
    left: 19px;
    top: 4px;
    width: 14px;
    height: 44px;
    opacity: 1;
    transition: transform 0.6s;
  }
}

@media screen and (max-width: 1366px) {
  .three-rotate-container {
    bottom: 125px;
  }
}
</style>
