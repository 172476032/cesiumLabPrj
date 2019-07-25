<template>
  <div :style="`color:${adaptColor}`" class="loc-info-container loc-info-container-left1">
    <div :style="`color:${adaptColor}`">经度：{{langitude}}</div>
    <div :style="`color:${adaptColor}`">纬度：{{latitude}}</div>
  </div>
</template>

<script>
import { transform } from "ol/proj";
import _ from "lodash";

export default {
  name: "map_loc_info",
  data() {
    return {
      langitude: "",
      latitude: ""
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
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  mounted() {
    console.log("---底图对象--", this.map);
    this.map.on("pointermove", this.mouseMoveHandler);
  },
  destroyed() {
    // console.log("---底图对象--", this.map);
    this.map.un("pointermove", this.mouseMoveHandler);
  },

  methods: {
    mouseMoveHandler(evt) {
      let coord = transform(
        evt.coordinate,
        this.map.getView().getProjection(),
        "EPSG:4326"
      );
      let langitude = coord[0];
      while (langitude > 180 || langitude < -180) {
        if (langitude > 180) {
          langitude = langitude - 360;
        } else if (langitude < -180) {
          langitude = langitude + 360;
        }
      }
      this.langitude = this.convertToDegree(langitude);
      this.latitude = this.convertToDegree(coord[1]);
    },
    convertToDegree(num) {
      let copyNum = Math.abs(num);
      let degree = Math.floor(copyNum);
      let minute = Math.floor((copyNum - degree) * 60);
      let second = Math.round(((copyNum - degree) * 60 - minute) * 60);
      if (num < 0) {
        degree = -degree;
      }
      return degree + "°" + minute + "′" + second + "″";
    }
  }
};
</script>

<style lang="scss">
.loc-info-container {
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

.loc-info-container-left1 {
  left: 15px;
}

.loc-info-container-left2 {
  left: 330px;
}
</style>
