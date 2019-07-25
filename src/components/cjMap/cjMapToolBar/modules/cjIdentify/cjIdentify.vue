<template>
  <!-- 请用map-tool-item组件，不然将引起清除逻辑错误 -->
  <!-- <div class="identify-point-wrapper" @click="handleToolSelect"> -->
  <map-tool-item class="identify-point-wrapper"
                 name='identify_point'
                 @cur-tool-deactive="deactive"
                 :clickHighlight="false"
                 @on-map-tool-select='handleToolSelect'>
    <Icon type="ios-search"
          :size="18"></Icon>查询
  </map-tool-item>
  <!-- </div> -->
</template>


<script>
// 地图点击查询工具
import MapToolItem from "../../common/MapToolItem";
import eventBus from "@/script/plugin/eventBus";
import arcgisQuery from "./arcgisQuery";
import bus from "@/script/bus";
import cursor from "@/assets/img/icon.png";

export default {
  name: "identify_point",
  data() {
    return {
      clickEventBus: null,
      isTextQuery: false // 是否为属性查询
    };
  },
  computed: {
    map() {
      return this.$store.getters.map;
    },
    cursorType() {
      return this.$store.state.map.cursorType;
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  components: {
    MapToolItem
  },
  mounted() {
    this.clickEventBus = eventBus.addListener(
      "toolbar-map-identify-point-click",
      isTextQuery => {
        this.isTextQuery = !!isTextQuery;
        this.$el.click();
      }
    );
  },
  methods: {
    handleToolSelect() {
      arcgisQuery.active(this);
    },
    deactive(isGroup) {}
  },
  destroyed() {}
};
</script>


