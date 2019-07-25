<template>
  <div class="scale-bar-container"
       :style="`width: ${80}px;color: ${adaptColor}`">
    <div class="text-scale-bar"
         :style="`color:${adaptColor}`">{{scaleLength}}&nbsp;{{showUnit}}</div>

    <div class="left-scale-bar"
         :style="`background: ${adaptColor}`"></div>
    <div class="middle-scale-bar"
         :style="`background: ${adaptColor}`"></div>
    <div class="right-scale-bar"
         :style="`background: ${adaptColor}`"></div>
  </div>
</template>

<script>
export default {
  name: "map_scale_bar",
  data() {
    return {
      lastZoom: undefined,
      equatorialRadius: 6378137,
      latitude: 30.7159811694633,
      scalebarWidth: 100,
      scaleLength: 0,
      showUnit: "公里"
    };
  },
  computed: {
    map() {
      return this.$store.getters.map; //openlayers地图对象
    },
    currentBasemap() {
      return this.$store.state.map.currentBasemap;
    },
    adaptColor() {
      if (!this.currentBasemap._realname) return "#000";
      return this.currentBasemap._realname.indexOf("Image") > 0
        ? "#fff"
        : "#000";
    }
  },
  mounted() {
    this.map.on("moveend", this.moveendHandler);
  },
  destroyed() {
    this.map.un("moveend", this.moveendHandler);
  },
  methods: {
    moveendHandler(evt) {
      var curZoom = this.map.getView().getZoom();
      if (curZoom == this.lastZoom) {
        return;
      } else {
        this.calculateScale();
        this.lastZoom = curZoom;
      }
    },
    calculateScale() {
      var resolution = this.map.getView().getResolution();
      // 单位为米
      // var lengthPerPixel = Math.cos(this.latitude * Math.PI / 180) * (this.equatorialRadius) * Math.PI / 180 * resolution;
      var lengthPerPixel =
        ((this.equatorialRadius * Math.PI) / 180) * resolution;
      var scalebarWidth, scaleLength, showUnit, thresholdValue;
      scalebarWidth = 80;
      thresholdValue = 20;
      var scaleLengthValues = [2000, 1000, 500, 250, 100, 50, 25, 10, 5, 2, 1];
      if (lengthPerPixel > thresholdValue) {
        scaleLength = Math.floor(
          (lengthPerPixel * scalebarWidth) / 100000000 + 0.5
        );
        showUnit = "公里";
      } else {
        scaleLength = Math.floor(lengthPerPixel * scalebarWidth + 0.5);
        showUnit = "米";
      }

      // 取最近值
      for (let i = 0; i < scaleLengthValues.length; i++) {
        if (i == 0) {
          if (scaleLength >= scaleLengthValues[i]) {
            scaleLength = scaleLengthValues[i];
            break;
          }
        } else if (i == scaleLengthValues.length - 1) {
          scaleLength = scaleLengthValues[i] * 1000;
        } else {
          if (
            (scaleLengthValues[i - 1] + scaleLengthValues[i]) / 2 >=
              scaleLength &&
            (scaleLengthValues[i] + scaleLengthValues[i + 1]) / 2 <= scaleLength
          ) {
            scaleLength = scaleLengthValues[i];
            break;
          }
        }
      }

      if (lengthPerPixel > thresholdValue) {
        scalebarWidth = Math.floor((scaleLength * 1000) / lengthPerPixel + 0.5);
      } else {
        scalebarWidth = Math.floor(scaleLength / lengthPerPixel + 0.5);
        if (scaleLength == 1000) {
          scaleLength = 1;
          showUnit = "公里";
        }
      }

      this.scaleLength = scaleLength;
      this.showUnit = showUnit;
      this.scalebarWidth = scalebarWidth;
    }
  }
};
</script>

<style lang="scss">
.scale-bar-container {
  position: absolute;
  right: 75px;
  bottom: 32px;
  z-index: 1;
  transform: scale(0.8);

  .text-scale-bar {
    margin: auto 0;
    text-align: center;
    font-size: 12px;
    margin-bottom: 5px;
  }

  .left-scale-bar {
    width: 1px;
    height: 6px;
    bottom: 0;
    position: absolute;
    // color: #ffffff;
    // background-color: black;
  }

  .right-scale-bar {
    width: 1px;
    height: 6px;
    bottom: 0;
    position: absolute;
    // color: #ffffff;
    // background-color: black;
    right: 0px;
  }

  .middle-scale-bar {
    width: 100%;
    height: 3px;
    bottom: 0;
    position: absolute;
    // color: #ffffff;
    // background-color: black;
  }
}

@media screen and (max-width: 1366px) {
  .scale-bar-container {
    bottom: 25px;
  }
}
</style>
