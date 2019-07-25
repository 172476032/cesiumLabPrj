<template>
  <div :class="`${prefixCls}-wrapper`"
       ref='container'>
    <!-- 基本弹出框  name和normal  
    应用:
     this.$store.commit("SET_HOVERED_FEATURE", {
           type: "normal",
           feature: name
         });
    -->
    <div :class="`${prefixCls}-content-normal`"
         v-if="isMonitorShow=='normal'">
      <span>{{normalName}}</span>
      <div class="cube"></div>
    </div>
    <!-- 全局搜索弹出框 -->
    <div :class="`${prefixCls}-content-overAllSearch`"
         v-if="isMonitorShow=='overAllSearch'">
      <span>{{searchName}}</span>
      <div class="cube"></div>
    </div>
  </div>
</template>
<script>
import Overlay from "ol/Overlay";
import Point from "ol/geom/Point";
import bus from "@/script/bus";
const prefix = "cj-marker-tip";

export default {
  name: prefix,
  props: {
    content: {
      type: [String, Number]
    }
  },
  data() {
    return {
      prefixCls: prefix,
      markerTip: null,
      normalName: null,
      searchName: null,
      isMonitorShow: null
    };
  },
  component: {},
  computed: {},
  methods: {
    init(map) {
      if (map && map.addOverlay) {
        let el = this.$refs.container;
        this.markerTip = new Overlay({
          id: "marker_tip",
          element: el,
          stopEvent: false,
          positioning: "bottom-center",
          offset: [18, -30]
        });
        this.hideTip();
        map.addOverlay(this.markerTip);
      }
    },
    hideTip() {
      if (this.markerTip && this.markerTip.setPosition)
        this.markerTip.setPosition(undefined);
    },
    addTip(feature, type) {
      //调样式，先注释
      if (!this.markerTip || !feature) {
        this.hideTip();
        return;
      }
      let geom = feature.getGeometry();
      if (type == "normal") {
        this.normalName = feature.get("name");
      } else if (type == "overAllSearch") {
        this.searchName = feature.get("property").name;
      }
      if (geom instanceof Point) {
        this.$nextTick(() => {
          this.markerTip.setPosition(geom.getCoordinates());
        });
      }
    },
    reset() {
      this.title = "";
      this.hideTip();
    }
  },
  mounted() {
    this.$on("on-init", this.init);
  },
  watch: {
    "$store.getters.mapHoveredFeature"(feature) {
      console.log("mapHoveredFeature", feature);
      let type = feature.type;
      if (type == "normal") {
        this.isMonitorShow = "normal";
      } else if (type == "overAllSearch") {
        this.isMonitorShow = "overAllSearch";
      }
      this.addTip(feature.feature, feature.type);
    }
  },
  destroyed() {}
};
</script>
<style lang="scss"  >
.cj-marker-tip-wrapper {
  .cj-marker-tip-content-normal {
    background: #ffff;
    padding: 5px 8px 8px 8px;
    letter-spacing: 1px;
    border-radius: 9px;
    color: #000;
    position: relative;
    z-index: 1;
    /* border-radius: 9%; */
    left: -17px;
    height: 30px;
    .cube {
      width: 10px;
      height: 10px;
      background: #ffff;
      /* border: 1px solid red; */
      -webkit-transform: rotate(30);
      transform: rotate;
      -webkit-transform: rotate;
      transform: rotate;
      transform: rotate(7deg);
      -ms-transform: rotate(7deg);
      -moz-transform: rotate(7deg);
      -webkit-transform: rotate(45deg);
      -o-transform: rotate(7deg);
      position: relative;
      /* left: 50%; */
      /* text-align: center; */
      margin: 0 auto;
      top: -2px;
    }
  }
  .cj-marker-tip-content-overAllSearch {
    background: #ffff;
    padding: 5px 8px 8px 8px;
    letter-spacing: 1px;
    border-radius: 9px;
    color: #000;
    position: relative;
    z-index: 1;
    /* border-radius: 9%; */
    top: -27px;
    left: -17px;
    height: 30px;
    .cube {
      width: 10px;
      height: 10px;
      background: #ffff;
      /* border: 1px solid red; */
      -webkit-transform: rotate(30);
      transform: rotate;
      -webkit-transform: rotate;
      transform: rotate;
      transform: rotate(7deg);
      -ms-transform: rotate(7deg);
      -moz-transform: rotate(7deg);
      -webkit-transform: rotate(45deg);
      -o-transform: rotate(7deg);
      position: relative;
      /* left: 50%; */
      /* text-align: center; */
      margin: 0 auto;
      top: -2px;
    }
  }
}
</style>

