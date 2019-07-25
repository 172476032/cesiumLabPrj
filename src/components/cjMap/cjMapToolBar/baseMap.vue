<!-- 底图 -->
<template>
  <cj-collapse title="底图"
               icon="ios-map"
               dropCardPosition="right">
    <div class="base-map-layers">
      <div class="basemap"
           v-for="(item, key, index) in basemapList"
           :key="key"
           @click="toggleBasemap(item)">
        <div class="basemap-img"
             :style="backPos(index)"></div>
        <div class="basemap-foot">{{item.name}}</div>
      </div>
    </div>
  </cj-collapse>
</template>

<script>
import cjCollapse from "@/components/cjMap/cjCommons/cjCollapse.vue";

export default {
  name: "baselayers",
  data() {
    return {};
  },

  components: { cjCollapse },

  computed: {
    basemapList() {
      // console.log("basemaplist", this.$store.state.map.basemapList);
      return this.$store.state.map.basemapList;
    },
    style() {
      var style = {};
      var length = this.basemapList.length;
      var width = length < 3 ? length * 115 + 15 : 3 * 115 + 15;
      style.width = width + "px";
      style.padding = "5px 0px 5px 5px";
      style.right = "0px";
      return style;
    },
    map() {
      return this.$store.getters.map;
    }
  },
  methods: {
    toggleBasemap(item) {
      var basemapId = item.id;
      console.log("basemapId: ", basemapId);
      console.log(
        "切换的底图对象",
        this.$store.state.map.basemapList[basemapId]
      );
      this.$store.commit(
        "SET_CURRENT_MAP_BASEMAP",
        this.$store.state.map.basemapList[basemapId]
      );
      // //对底图为3857的切片进行重新定义切换逻辑
      // if (basemapId == 10002) {
      //   this.map.get("cjbaseLayer").setVisible(true);
      // } else {
      //   this.map.get("cjbaseLayer").setVisible(false);
      // }
    },
    backPos(i) {
      let h = 70,
        w = 100;
      return {
        backgroundPosition: `-${w * (i % 3)}px -${h * parseInt(i / 3)}px`
      };
    }
  },

  mounted() {},

  destroyed: {}
};
</script>
<style lang='scss'  >
.base-map-layers {
  width: 350px;
  padding: 5px 0px 5px 5px;
  .basemapactive {
    display: none !important;
  }
  .basemap {
    display: inline-block;
    height: 110px;
    width: 110px;
    margin-right: 5px;
    border: 1px solid #ccc;
    cursor: pointer;
    position: relative;

    &:hover {
      color: #cb9642;
      border: 1px solid #cb9642;
    }

    .basemap-img {
      height: 70px;
      width: 100px;
      margin: 5px;
      background: url("../../../assets/img/basemap/css_sprites.png");
    }
    .basemap-foot {
      margin: 0 auto;
      text-align: center;
      position: absolute;
      top: 70px;
      height: 40px;
      width: 100%;
      line-height: 40px;
    }
  }
}
</style>