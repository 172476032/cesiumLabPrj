<template>
  <div class="test"
       v-on:dragleave="cancelMove"
       v-on:mouseover="promiseMove">
    <transition-group class="layerTreeUl"
                      tag="ul">
      <tree-node v-for="(item,index) in baseDataList"
                 :originData="baseDataList"
                 :contextOpen="contextOpen"
                 :itemClick="itemClick"
                 :itemClickColor="itemClickColor"
                 :dragEnd="dragEnd"
                 :showCheckbox="showCheckbox"
                 :checkClick="checkClick"
                 :model="item"
                 :title="item.name"
                 :uid="item.id"
                 :canMove="canMove && curCanMove"
                 :key="item.id"
                 :icon="item.icon"
                 :root="root"
                 :parentLv="index"
                 :openType="openType"
                 :staticVals="staticVals"></tree-node>
    </transition-group>
  </div>
</template>
<script>
import treeNode from "./layerTreeNode.vue";

export default {
  name: "layerTree",
  components: {
    treeNode
  },
  props: {
    // 列表数据
    baseDataList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    // 是否对根节点采用不同的样式
    root: {
      type: Boolean,
      default: false
    },
    contextOpen: {
      type: Function,
      default() {
        return false;
      }
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    checkClick: {
      type: Function,
      default() {}
    },
    canMove: {
      type: Boolean,
      default: true
    },
    dragEnd: {
      type: Function,
      default() {}
    },
    openType: {
      type: String,
      default: "firstOpen"
    },
    itemClick: {
      type: Function,
      default() {}
    },
    // 点击节点是否变颜色
    itemClickColor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      curCanMove: true,
      // 树结构的公共数据
      staticVals: {
        clickId: ""
      }
    };
  },
  methods: {
    cancelMove(e) {
      if (!!e.fromElement && e.fromElement.className.includes("cj-swipe")) {
        this.curCanMove = false;
        console.log("超出界限");
      }
    },
    promiseMove() {
      this.curCanMove = true;
    }
  },
  computed: {
    // baseDataList() {
    //     return this.$store.state.map.baseTreeNode;
    // },
    // isSettingOpacity() {
    //     return this.$store.state.layer.isSettingOpacity && this.$store.state.layer.clickedLayerItem.id == this.layerId
    // }
  },
  mounted() {
    setTimeout(() => {
      console.log("this.baseDataList", this.baseDataList);
    }, 5000);
  }
};
</script>

<style lang="scss">
.layerTreeUl {
  .tree-node-item {
    // padding: 8px 20px;
    padding: 5px 12px 5px 22px;
    font-size: 14px;
    background-color: #fff; // border-bottom: 1px solid #D7DDE4;
    .ivu-icon {
      margin: 2px 2px 2px 12px;
    }
    .ivu-checkbox-wrapper {
      font-size: 14px;
    }
  }
  .root-list-node {
    // border-top: 1px solid #ddd;
    // border-bottom: 1px solid #ddd;
    // background-color: rgb(223, 244, 249);
    color: #fff;
    background: #39f; // margin-bottom: -1px;
    font-size: 16px;
    font-weight: bold;
    padding: 6px 0 6px 20px;
    border-bottom: 1px solid;
    // margin-left: -1px;
    .ivu-icon {
      font-size: 20px;
      margin: 1px 2px 2px 12px;
    }
    .root-list-label {
      display: inline-block;
      line-height: 18px;
      white-space: nowrap;
      margin-left: 10px;
      i {
        color: #fff;
        font-size: 18px;
      }
    }
  }
  .child-tree-node {
    margin-top: 1px;
    .root-list-label {
      i {
        font-size: 18px;
      }
    }
  }
}
</style>
