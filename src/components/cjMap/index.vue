<!-- 二三位地图组建 -->
<template>
  <div class="map-integration-wrap">
    <!-- 地图对象 -->
    <!-- <cj-map v-show="!is3dMap"></cj-map> -->
    <scene-map v-show="is3dMap"></scene-map>
    <!-- 基础控件 -->
    <!-- <map-scale v-show="!is3dMap"></map-scale> -->
    <!-- <div v-show="!is3dMap">
      <map-location></map-location>
      <map-zoom></map-zoom>
      <map-rotate></map-rotate> -->
    <!-- 图层管理 -->
    <!-- <layer2d-control></layer2d-control>
    </div> -->
    <div v-show="is3dMap">
      <map-loc-three-info></map-loc-three-info>
      <map-three-zoom></map-three-zoom>
      <map-three-rotate style="bottom:150px"></map-three-rotate>
      <!-- 图层管理 -->
      <layer3d-control></layer3d-control>
    </div>
    <!-- <map-three></map-three> -->
    <!-- 工具条 -->
    <map-tool-bar></map-tool-bar>
    <!-- 全局搜索条 -->
    <!-- <search-bar></search-bar> -->
  </div>
</template>

<script>
import cjMap from "@/components/cjMap/map/map.vue";
import sceneMap from "@/components/cjMap/scene/sceneMap.vue";
import mapToolBar from "@/components/cjMap/cjMapToolBar/index.vue";
import searchBar from "@/components/cjMap/cjSearchBar/searchBar.vue";
import layer2dControl from "@/components/cjMap/cjLayerControls/cj2d/layerContainer.vue";
import layer3dControl from "@/components/cjMap/cjLayerControls/cj3d/layerContainer.vue";
import mapLocation from "@/components/cjMap/cjMapControls/cj2dCommon/mapLocInfo.vue";
import mapScale from "@/components/cjMap/cjMapControls/cj2dCommon/mapScaleBar.vue";
import mapZoom from "@/components/cjMap/cjMapControls/cj2dCommon/mapZoom.vue";
import mapRotate from "@/components/cjMap/cjMapControls/cj2dCommon/mapRotate.vue";
import mapThree from "@/components/cjMap/cjMapControls/cj2dCommon/mapThreed.vue";
import mapLocThreeInfo from "@/components/cjMap/cjMapControls/cj3dCommon/map3dLocInfo.vue";
import mapThreeZoom from "@/components/cjMap/cjMapControls/cj3dCommon/map3dZoom.vue";
import mapThreeRotate from "@/components/cjMap/cjMapControls/cj3dCommon/map3dRotate.vue";

export default {
  name: "mapintergration",
  data() {
    return {};
  },

  components: {
    sceneMap,
    cjMap,
    mapToolBar,
    searchBar,
    layer2dControl,
    layer3dControl,
    mapLocation,
    mapScale,
    mapZoom,
    mapRotate,
    mapThree,
    mapLocThreeInfo,
    mapThreeZoom,
    mapThreeRotate
  },

  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },

  mounted() {},

  methods: {},
  destroyed: {}
};
</script>
<style lang='scss' scoped>
.map-integration-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0px;
  margin: 0px;
}
</style>