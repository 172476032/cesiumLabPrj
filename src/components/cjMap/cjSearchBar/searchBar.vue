<template>
  <div class="cj-search-box-new-wrap">
    <!-- 搜索输入框 -->
    <Input @on-search="search"
           @on-focus="openSuggest"
           @on-blur="onblur"
           v-model="searchText"
           search
           enter-button
           placeholder="搜索水电站、水文站、河流名称" />
    <Spin fix
          v-show="searchLoadStatus">
      <Icon type="ios-loading"
            size=18
            class="demo-spin-icon-load"></Icon>
    </Spin>
    <div class="close"
         v-show="searchCloseShow"
         @click="close">
      <Icon type="md-close"
            :size="20" />
    </div>
    <transition name='slide-fade'>
      <keep-alive>
        <component :is="curDropDown"></component>
      </keep-alive>
    </transition>
    <!-- <identify-contents v-show="identifyListShow"
                       :identifyList="identifyList"></identify-contents> -->
  </div>
</template>

<script>
import bus from "@/script/bus.js";
import searchContents from "@/components/cjMap/cjSearchBar/searchContents/index.vue";
import suggestContent from "@/components/cjMap/cjSearchBar/suggestContents";
import identifyContents from "@/components/cjMap/cjMapToolBar/modules/cjIdentify/cjIdentifyList.vue";
export default {
  data() {
    return {
      searchText: "",
      identifyList: null
    };
  },
  components: { searchContents, identifyContents, suggestContent },
  mounted() {
    bus.$on("rest-search-text", this.resetSearchText);
  },
  computed: {
    map() {
      return this.$store.getters.map;
    },
    searchCloseShow() {
      return this.$store.state.map.searchCloseShow;
    },
    searchLoadStatus() {
      return this.$store.state.map.searchLoadStatus;
    },
    curDropDown: {
      get() {
        let dropDown = this.$store.state.map.curDropDown;
        if (dropDown == "searchContents") {
          return searchContents;
        } else if (dropDown == "identifyContents") {
          return identifyContents;
        } else if (dropDown == "suggestContent") {
          // return suggestContent;
        }
      },
      set(value) {
        this.$store.state.map.curDropDown = value;
      }
    },
    identifyListShow() {
      return this.$store.getters.getIdentifyListShow;
    }
  },
  methods: {
    search() {
      console.log("开始全局搜索");
      //清除所有绘制结果
      this.$store.dispatch("ALL_CLOSE_CLEAR");
      this.curDropDown = "searchContents";
      //清除
      this.$nextTick(() => {
        bus.$emit("on-over-all-seach", this.searchText);
      });
    },
    close() {
      this.resetSearchText();
      this.$store.state.map.searchCloseShow = false;
      this.curDropDown = "";
      this.$store.dispatch("ALL_CLOSE_CLEAR");
      //清除已选择的要素
      bus.$emit("on-clear-interactionselect-overallsearch");
      this.$store.commit("animateToOriginView");
      //清除三维渲染
      if (window.Viewer) {
        window.Viewer.entities.removeAll();
      }
    },
    resetSearchText() {
      this.searchText = "";
    },
    openSuggest() {
      if (this.searchText == "") {
        this.$store.state.map.searchCloseShow = true;
        this.$store.state.map.curDropDown = "suggestContent";
      }
    },
    onblur() {}
  },
  watch: {
    searchText(newV, oldV) {
      if (newV != "") {
        this.$store.state.map.searchCloseShow = true;
      } else if (newV == "" && this.searchCloseShow) {
        this.$store.state.map.curDropDown = "suggestContent";
      }
    }
  },
  destroyed() {
    bus.$off("on-over-all-seach");
  }
};
</script>

<style lang="scss" scope>
.cj-search-box-new-wrap {
  width: 360px;
  position: absolute;
  top: 30px;
  left: 30px;
  .close {
    position: absolute;
    right: 60px;
    top: 6px;
    z-index: 10;
    color: #57a3f3;
    cursor: pointer;
  }
  .close:hover {
    color: #000000;
  }
  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .demo-spin-col {
    height: 100px;
    position: relative;
    border: 1px solid #eee;
  }
  .ivu-spin-fix {
    position: absolute;
    top: 6px;
    height: 20px;
    width: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    left: 280px;
    z-index: 10;
  }
  .demo-spin-icon-load {
    color: #57a3f3;
  }
}
</style>
