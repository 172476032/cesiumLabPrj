<template>
  <map-tool-item name='full_screen'
                 :repeat="true"
                 :clickHighlight="false"
                 :singleton="false"
                 @on-map-tool-select='handleToolSelect'>
    <Icon type="ios-globe"
          size='18'></Icon>全幅
  </map-tool-item>
</template>
<script>
import MapToolItem from "../common/MapToolItem.vue";
import config from "@/script/config";
import { locationToExtentByFeatureType } from "@/script/mapUtils/myMaputils/myUtils.js";

export default {
  name: "full_screen",
  components: {
    MapToolItem
  },
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  methods: {
    handleToolSelect() {
      if (this.is3dMap) {
        window.Viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            -2777291.4034890607,
            8826432.307255477,
            5319772.554602509
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0), // 方向
            pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
            roll: 0
          }
        });
      } else {
        this.$store.commit("animateToOriginView");
      }
    }
  }
};
</script>
