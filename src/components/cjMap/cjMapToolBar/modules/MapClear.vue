<template>
  <map-tool-item name="map_clear"
                 :clickHighlight="false"
                 @on-map-tool-select="handleToolSelect">
    <Icon type="ios-trash"
          size="18"></Icon>清除
  </map-tool-item>
</template>
<script>
import Style from "ol/style/Style";
import VectorLayer from "ol/layer/Vector";
import MapToolItem from "../common/MapToolItem.vue";
import eventBus from "@/script/plugin/eventBus";
import bus from "@/script/bus.js";
var eventClick;

export default {
  name: "map_clear",
  components: {
    MapToolItem
  },
  mounted() {
    eventClick = eventBus.addListener("toolbar-map-clear-click", () => {
      this.$el.click();
    });
  },
  computed: {
    map() {
      return this.$store.getters.map; //openlayers地图对象
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    },
    clickFullPoint() {
      return this.$store.state.map.clickFullPoint;
    }
  },
  methods: {
    handleToolSelect(toolName) {
      if (this.is3dMap) {
        window.Viewer.entities.removeAll();
      } else {
        if (toolName === "map_clear") {
          this.$store.commit("CLEAR_MAP_OVERLAY");
          this.map.getTarget().style.cursor = "";
          // 清除测量图层
          this.$store.commit("CLEAR_MEASURE_MAP_OVERLAY");
          //清除模糊查询绘制的图层
          this.$store.commit("CLEAR_SEACH_LAYERS");
          //清楚全局click图层的要素和散射点
          this.clickFullPoint.setStyle(new Style({}));
          //清除所有注册事件，包括identify点查询注销
          this.$store.commit("CLEAR_MAP_EVENTS");
          this.$store.state.map.cursorType = "default";
          //清除交互添加的图层要素
          this.$store.commit("clearAddedLayersSource");
        }
      }
    }
  },
  destroyed() {
    eventClick.remove();
    eventClick = null;
  }
};
</script>
