<!--  -->
<template>
  <cj-collapse title="工具"
               class="maptool"
               icon="ios-construct">
    <!-- <point-pick v-show="!is3dMap"></point-pick>
    <cj-identify v-show="!is3dMap"></cj-identify> -->
    <full-screen></full-screen>
    <measure-area />
    <measure-dis />
    <map-clear></map-clear>
  </cj-collapse>
</template>

<script>
import cjCollapse from "@/components/cjMap/cjCommons/cjCollapse.vue";
import fullScreen from "./modules/FullScreen";
import MeasureArea from "./modules/cjMeasure/MeasureArea";
import MeasureDis from "./modules/cjMeasure/MeasureDis";
import MapClear from "./modules/MapClear";
import cjIdentify from "./modules/cjIdentify/cjIdentify";
import pointPick from "./modules/pointPick";

export default {
  data() {
    return {};
  },

  components: {
    cjCollapse,
    MapClear,
    cjIdentify,
    MeasureDis,
    MeasureArea,
    fullScreen,
    pointPick
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
<style lang="scss">
.maptool {
  background: #ffff;
}
.cj-toolbar-measure-tip {
  background: #fff;
  padding: 2px;
  border-radius: 2px;
  box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.2);
  &,
  & p,
  & span {
    font-size: 12px;
  }
  & i {
    margin-left: 4px;
  }
  & i:hover {
    cursor: pointer;
  }
}
</style>