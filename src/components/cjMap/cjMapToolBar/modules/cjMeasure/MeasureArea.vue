<template>
  <map-tool-item name="measure_area"
                 @on-map-tool-select='handleToolSelect'>
    <Icon type="ios-tennisball" /> 测面
  </map-tool-item>
</template>
<script>
import MapToolItem from "../../common/MapToolItem.vue";
import measure from "./measure";
//三维量测
import MeasureTool from "@/components/cjMap/cjMapControls/cj3dCommon/measure.js";

export default {
  name: "measure_area",
  mixins: [measure],
  components: {
    MapToolItem
  },
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  methods: {
    handleToolSelect(toolName) {
      if (this.is3dMap) {
        MeasureTool.measureAreaSpace(window.Viewer, null);
      } else {
        this.drawType = "Polygon";
        this.init();
      }
    }
  }
};
</script>
