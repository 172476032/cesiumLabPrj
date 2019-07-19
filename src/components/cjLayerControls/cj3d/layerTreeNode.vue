<template>
  <div :class="{'child-tree-node': !isRoot}">
    <!-- <li v-on:checked="checkedhandler" @contextmenu.prevent="cancelCxtmenu"></li> -->
    <div :class="{bold: isFolder,'root-list-node': isRoot}"
         class="tree-node-item"
         :id="id"
         @click.stop="toggle"
         v-on:dragstart="ondragStart"
         v-on:dragenter="ondragenter"
         v-on:dragleave="ondragleave"
         v-on:dragend="ondragend"
         @contextmenu.prevent='contextOpen($event, model)'>
      <Icon v-if="open && isFolder"
            type="md-arrow-dropdown"></Icon>
      <Icon v-if="!open && isFolder"
            type="md-arrow-dropright"></Icon>
      <Checkbox v-if="showCheckbox & !this.model.isRoot"
                v-model="checked"
                :indeterminate="indeterminate"
                :disabled="disable"
                @click.native.prevent.stop="checkClicked(checked)">
      </Checkbox>
      <span v-else
            style="margin-left: 10px;"></span>
      <div class="root-list-label"
           :id="id"
           ref="item"
           @click.prevent="itemClickHandler">
        <!-- <i class="root-list-icon"
           :class="`cj-icon-tree-${!!this.model.icon ? this.model.icon : 'sl-blue'}`"></i> -->
        <img class="root-list-icon"
             :src="model.icon">
        <span :id="id"
              :class="{'root-tree-node':isRoot}"
              :style="`${isChangeItemColor ? 'background-color: #f7e7be;color: #A2987C;' : ''}`">{{model.name}}</span>
      </div>
    </div>
    <transition-group name="flip-list"
                      tag="ul"
                      v-show="open"
                      v-if="isFolder">
      <tree-node v-for="(model,index) in model.children"
                 :originData="originData"
                 :contextOpen="contextOpen"
                 :itemClick="itemClick"
                 :itemClickColor="itemClickColor"
                 :dragEnd="dragEnd"
                 :showCheckbox="showCheckbox"
                 :checkClick="checkClick"
                 :model="model"
                 :canMove="canMove"
                 :parentLv="`${parentLv}.${index}`"
                 :uid="model.id"
                 :title="model.name"
                 :key="model.id"
                 :icon="model.icon"
                 :openType="openType"
                 :staticVals="staticVals">
      </tree-node>
    </transition-group>
  </div>
</template>

<script>
import { findComponentsDownward } from "@/script/plugin/assist.js";

//查看当前节点子节点是否全选
function checkall(node, flag = true, type = "every") {
  if (node && node.children && !!node.children.length) {
    return node.children[type](n => {
      if (n.children && !!n.children.length) {
        return checkall(n, flag, type);
      } else {
        return n.visible == flag;
      }
    });
  } else {
    return node.visible == flag;
  }
}

function firstOpen(id) {
  let parentLv = id.split(".");

  return parentLv.every(v => {
    return v == 0;
  });
}

var final = "";
var start = "";
export default {
  name: "treeNode",
  props: {
    model: {
      type: Object,
      default: () => {
        return {};
      }
    },
    uid: {
      type: [String, Number],
      default: 0
    },
    parentLv: {
      type: [String, Number],
      default: 0
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    icon: {
      type: String,
      default: ""
    },
    disable: {
      type: Boolean,
      default: false
    },
    root: {
      type: Boolean,
      default: false
    },
    // 判断鼠标是否在整个树状结构中，若超出限界，不能移动item
    canMove: {
      type: Boolean,
      default: true
    },
    contextOpen: {
      type: Function,
      default() {
        return false;
      }
    },
    checkClick: {
      type: Function,
      default() {}
    },
    originData: {
      type: Array,
      default: () => []
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
    },
    staticVals: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      open: this.getOpen(),
      final: "",
      start: "",
      checked: checkall(this.model),
      isRoot:
        this.root && `${this.parentLv}.${this.model.id}`.split(".").length == 2,
      layerOpacity: this.$store.getters.layerOpacity
    };
  },
  computed: {
    map() {
      return this.$store.getters.map;
    },
    locationArea() {
      return this.$store.state.map.locationArea;
    },
    isFolder: function() {
      return !!(this.model.children && this.model.children.length);
    },
    indeterminate: function() {
      if (this.model.children && !!this.model.children.length) {
        let checkallFlag = checkall(this.model, true, "some");
        if (checkallFlag) {
          if (checkall(this.model)) {
            this.checked = true;
            return false;
          } else {
            return true;
          }
        } else {
          this.checked = false;
          return false;
        }
        // return checkallFlag ? true : false;
      } else {
        this.checked = this.model.visible;
        return false;
      }
    },
    isChangeItemColor() {
      if (this.itemClickColor && this.staticVals.clickId == this.id) {
        return true;
      }
      return false;
    },
    id() {
      return `${this.parentLv}.${this.model.id}`;
    }
  },
  methods: {
    toggle: function() {
      if (this.isFolder) {
        this.open = !this.open;
      }
    },
    itemClickHandler(e) {
      console.log("e: ", e);

      //定位至缩放区域
      let locateToArea = this.locationArea[e.target.innerText]
        ? this.locationArea[e.target.innerText]["three"]
        : null;
      if (locateToArea && locateToArea.x && locateToArea.y && locateToArea.z) {
        window.Viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(
            locateToArea.x,
            locateToArea.y,
            locateToArea.z
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0), // 方向
            pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
            roll: 0
          }
        });
      }
      this.staticVals.clickId = e.target.id;
      this.itemClick(e, this.model);
    },
    getOpen() {
      if (this.openType == "allOpen") {
        return true;
      } else if (this.openType == "allHide") {
        return false;
      } else {
        return firstOpen(`${this.parentLv}`);
      }
    },
    checkedhandler: function() {
      // console.log('============');
    },
    checkClicked: function() {
      // alert("加载图层");
      // debugger
      if (this.disable) return;
      const checked = !this.checked;
      if (!checked && this.isFolder) {
        findComponentsDownward(this, "treeNode").forEach(node => {
          node.checked = false;
        });
      } else {
        findComponentsDownward(this, "treeNode").forEach(node => {
          node.checked = true;
        });
      }
      this.checked = checked;
      this.$parent.$parent.$emit("checked");
    },
    //拖拽开始
    ondragStart: function(e) {
      if (!this.canMove) return;
      // 确定当前拖动元素，记录当前鼠标位置，方便确认鼠标拖动方向，上 or 下
      start = e.target.id.split(".");
      start.screenY = e.screenY;
    },
    // 拖拽进入该节点范围时，设置当前节点为终点
    ondragenter: function(e) {
      if (!this.canMove) return;
      final = e.target.id.split(".");
      // 判断当前鼠标拖动方向，上 or 下
      var dist = e.screenY - start.screenY;
      if (
        e.target.classList.contains("tree-node-item") &&
        final.length == start.length
      ) {
        if (dist > 0) {
          // 当鼠标朝下拖动时
          e.target.classList.add("hover-position-bottom");
        } else {
          // 朝上
          e.target.classList.add("hover-position-top");
        }
      }
    },
    ondragleave: function(e) {
      if (!this.canMove) return;
      // 鼠标在拖动过程中，离开当前元素时，清除显示的占位示意线
      if (e.target.classList.contains("tree-node-item")) {
        e.target.classList.remove("hover-position-top");
        e.target.classList.remove("hover-position-bottom");
      }
    },
    // 拖拽放开鼠标时，获取起点、终点，发送commit
    ondragend: function(e) {
      // 超出当前树状结构范围时，不给动
      if (!this.canMove) return;
      let start = e.target.id.split(".");

      let startLen = start.length,
        finalLen = final.length,
        startId = start[startLen - 2],
        finalId = final[finalLen - 2];
      if (startLen != finalLen) {
        console.log("不同层级，不需要交换");
        return false;
      }
      var exchangeArr = this.originData;
      for (let i = 0; i < startLen - 2; i++) {
        if (start[i] != final[i]) {
          console.log("不同属同一层级，不需要交换");
          return false;
        }
        exchangeArr = exchangeArr[start[i]].children;
      }
      let startEl = exchangeArr[startId];
      let finalEl = exchangeArr[finalId];

      if (+startId > +finalId) {
        // 将后面的项往前移
        let line = +startId;
        while (line > +finalId) {
          // exchangeArr[line] = exchangeArr[line - 1];
          exchangeArr.splice(line, 1, exchangeArr[line - 1]);
          line--;
        }
        // exchangeArr[finalId] = startEl;
      } else {
        let line = +startId;
        while (line < +finalId) {
          exchangeArr.splice(line, 1, exchangeArr[line + 1]);
          line++;
        }
      }
      exchangeArr.splice(finalId, 1, startEl);

      // 回调
      this.dragEnd();
    },
    cancelCxtmenu(e) {
      return false;
    }
  },
  mounted() {
    //  console.log(this.$children, this.$parent.$parent.$el);
    this.model.parentLv = this.parentLv;
  },
  watch: {
    // 根据checkbox 参数值checked 变化，改变图层visible可见性
    checked: function(value) {
      //由于水电站图层改成了overlay，初始化设置的不显示，所以在此进行过滤掉 20190415
      if (this.model.name != "水电站") {
        this.model.visible = value;
      } else {
        this.model.selected = value;
      }
      let isBack = this.checkClick(this.model, this);
      if (isBack) {
        this.checked = false;
      }
    }
  }
};
</script>

<style lang="scss">
.hover-position-top {
  border-top: 2px solid #fd9934;
}

.hover-position-bottom {
  border-bottom: 2px solid #fd9934;
}

.root-list-label {
  font-size: 12px;
  .root-list-icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }
}

.tree-node-item {
  padding-left: 12px;
  padding-top: 3px;
  position: relative;
  .ivu-icon {
    position: absolute;
    left: 2px;
    top: 7px;
  }
  .ivu-checkbox-indeterminate .ivu-checkbox-inner {
    &:after {
      content: "";
      display: table;
      width: 4px;
      height: 8px;
      position: absolute;
      top: 1px;
      left: 4px;
      border: 2px solid #fff;
      border-top: 0;
      border-left: 0;
      -ms-transform: rotate(45deg) scale(1);
      transform: rotate(45deg) scale(1);
      transition: all 0.2s ease-in-out;
    }
    background-color: #ccc;
    border-color: #ccc;
  }
  .ivu-checkbox-wrapper {
    margin-left: 8px;
  }
  & > div {
    display: inline-block;
    cursor: pointer; // padding-right: 5px;
  }
}

.flip-list-move {
  transition: transform 1s;
}

.child-tree-node {
  position: relative; // padding-left: 12px;
}

.root-tree-node {
  color: white;
  font-size: 14px;
}
</style>
