<template>
  <map-tool-item name="measure_dis"
                 @on-map-tool-select='handleToolSelect'>
    <Icon type="ios-pulse" /> 测距
  </map-tool-item>
</template>
<script>
import MapToolItem from "../../common/MapToolItem.vue";
import measure from "./measure";
import eventBus from "@/script/plugin/eventBus";
//三维量测
import MeasureTool from "@/components/cjMap/cjMapControls/cj3dCommon/measure.js";

var bus;

export default {
  name: "measure_dis",
  mixins: [measure],
  components: {
    MapToolItem
  },
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  mounted() {
    bus = eventBus.addListener("toolbar-map-measure-dis-click", () => {
      this.$el.click();
    });
  },
  methods: {
    handleToolSelect(toolName) {
      if (this.is3dMap) {
        MeasureTool.measureLineSpace(window.Viewer, null);
      } else {
        this.drawType = "LineString";
        this.init();
      }
    }
  },
  destroyed() {
    bus.remove();
  }
};
</script>
