<template>
  <!-- <div> -->
  <!-- <Checkbox v-model="onlyVisible" style="margin: 9px 0 9px 20px;">
                                                                <span style="margin:10px;">只显示可见图层</span>
  </Checkbox>-->
  <!-- <span class="switchSpan" title="显示可见图层" @click.stop="switchLayers">
            <Icon type="eye" size="25" color="gray"></Icon>
        </span>
        <transition name="bounce" style="height:30px;margin-top:-5px;">
            <input class="searchInput" ref="searchInput" v-show="showInput" v-on:blur="changeFocus" type="text" placeholder="快速查找图层" v-model="searchtext" />
        </transition>
        <span class="searchSpan" title="快速查找图层" @click.stop="searchBtnClick">
            <Icon type="search" size="22" color="gray"></Icon>
  </span>-->
  <layer-tree :baseDataList="baseDataList"
              :root="true"
              :checkClick="checkClick"></layer-tree>
  <!-- </div> -->
</template>

<script>
import layerTree from "./layerTree.vue";
import _ from "lodash";
import Cesium from "cesium/Cesium";
let nodeSate = null;

export default {
  name: "layerPanel",
  components: {
    layerTree
  },
  data() {
    return {
      baseDataList1: [
        {
          id: 1,
          name: "长江",
          parentLv: 0,
          isRoot: true,
          icon: "well",
          children: [
            {
              id: 101,
              name: "长江1",
              parentLv: 0.1,
              isRoot: true,
              icon: "well",
              children: [
                {
                  id: "10101",
                  name: "长江101",
                  isRoot: false,
                  icon: "well",
                  type: "WMTS",
                  layerName: "shuiwenzhan",
                  layerUrl:
                    "http://10.6.172.178:6080/arcgis/rest/services/cjcenter/%E9%95%BF%E6%B1%9F%E6%B5%81%E5%9F%9F%E6%B0%B4%E6%96%87%E7%AB%993857/MapServer"
                }
              ]
            }
          ]
        }
      ]
    };
  },
  methods: {
    // 树节点选中事件
    checkClick(model, that) {
      // debugger;
      console.log("--节点--", model);
      if (!this.is3dMap && model.type == "MODEL") {
        this.$Message.info("请打开三维场景");
      }
      //二维图层切换
      this.map.get(model.layerName)
        ? this.map.get(model.layerName).setVisible(model.visible)
        : null;
      //确定哪些图层被打开了
      if (model.queryConfig) {
        console.log("用于identify的图层为", model.queryConfig);
        if (model.visible) {
          this.selectTreeLayers.push(model.queryConfig);
        } else {
          _.remove(this.selectTreeLayers, v => {
            return v.name == model.queryConfig.name;
          });
        }
      }
      console.log("图层管理器选择的图层对象列表：", this.selectTreeLayers);
    }
  },
  computed: {
    baseDataList() {
      // console.log("图层树配置treeConfigs", this.$store.state.map.treeConfigs);
      return this.$store.state.map.treeConfigs;
    },
    map() {
      return this.$store.getters.map;
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    },
    selectTreeLayers() {
      return this.$store.state.map.selectTreeLayers;
    }
  },
  mounted: function() {}
};
</script>

<style lang="scss">
.switchSpan {
  margin: 12px 0 12px 20px;
}

.switchSpan i {
  margin: 6px;
}

.searchInput {
  width: 200px; // height: 30px;
  line-height: 16px;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid #eee;
  background-color: #fcfcfc;
  outline: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    width: 0px;
  }
  100% {
    width: 200px;
  }
}
</style>
