<template>
  <cj-collapse id="cjmapLayerControls"
               class="cj-layer-side-bar"
               icon="logo-buffer"
               titlePosition="right"
               title=''>
    <layerPanel style="box-shadow: box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);width: 210px;max-height: 500px;overflow-y: auto;"></layerPanel>
  </cj-collapse>
</template>

<script>
import cjCollapse from "./cjCollapse.vue";
import layerPanel from "./layerPanel.vue";

export default {
  name: "layerContainer",
  data() {
    return {};
  },
  components: {
    layerPanel,
    cjCollapse
  }
};
</script>

<style lang="scss">
#cjmapLayerControls {
  right: 65px;
  top: 53px;
}
.cj-layer-side-bar {
  right: 40px;
  top: 73px;
  position: absolute;
  & > div {
    float: right;
  }
  .cj-collapse-header {
    padding: 0;
    background: rgba(0, 0, 255, 0.1);
    border: 1px solid #2d8cf0;
    color: #fff;
    text-align: center;
    width: 35px;
    height: 35px;
    line-height: 30px;
    border-radius: 50%;
    font-size: 22px;
    padding-left: 6px;
    &::before {
      content: none;
    }
  }
  .cj-collapse-drawer {
    .cj-collapse-content {
      margin-top: 15px;
      position: relative;
      &:before {
        content: "";
        height: 16px;
        position: absolute;
        right: 12px;
        top: -16px;
        width: 0; //   background: #fff;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 16px solid #39f;
        border-top: none;
      }
    }
  }
}
</style>
