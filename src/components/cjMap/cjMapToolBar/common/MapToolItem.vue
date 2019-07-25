<template>
  <li :class="classes"
      @click="handleClick">
    <slot></slot>
  </li>
</template>
<script>
import Emitter from "@/script/mixins/emitter.js";
import { findComponentUpward } from "@/script/mapUtils/myMaputils/myUtils.js";
import _ from "lodash";

const prefixCls = "ivu-menu";
const SUBMENU = "SubToolbar";
const MENU = "Toolbar";
const MENU_ITEM = "ToolbarItem";
const MAP_CLEAR = "map_clear";

export default {
  name: SUBMENU,
  mixins: [Emitter],
  props: {
    name: {
      type: [String, Number],
      required: true
    },
    singleton: {
      type: [Boolean],
      default: true
    }, //指示当前按钮是否为独占模式，是否需要清除其他按钮操作记录
    repeat: {
      //指示当前按钮是否可以连续重复操作
      type: Boolean,
      default: false
    },
    clickHighlight: {
      //点击之后是否高亮，如全图操作就是点击之后不高亮
      type: Boolean,
      default: true
    },
    infoConfig: {
      //点击之后是否弹出提示对话框，如标绘和卷帘功能，只有在用户点击确认之后，才真正执行点击操作
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      parentName: MENU,
      parent: null,
      prefixCls: prefixCls,
      lastClick: false //记录上一次是否被点击
    };
  },
  computed: {
    classes() {
      let prefixCls = this.prefixCls;
      return [
        `${prefixCls}-item`,
        {
          [`${prefixCls}-item-active`]: this.active,
          [`${prefixCls}-item-selected`]: this.active
        }
      ];
    },
    map() {
      return this.$store.getters.map;
    }
  },
  methods: {
    handleClick() {
      // debugger
      //恢复鼠标样式
      if (this.name != "identify_point") {
        if (this.map.getTarget()) {
          this.map.getTarget().style.cursor = "";
        }
      }
      //判断是否连续点击了同一个按钮，如果是则跳过，否则继续执行
      var lastActiveName = this.$store.state.map.lastActiveName;
      if (!this.repeat && lastActiveName === this.name) return;
      //如果为独占模式，则清除地图事件
      if (this.singleton) {
        if (this.activeToolInstance) {
          this.activeToolInstance.$emit("cur-tool-deactive"); //触发父组件的取消事件
        }
        this.$store.commit("CLEAR_MAP_EVENTS");
        this.$store.commit("CLEAR_MAP_OVERLAY");
      }
      //触发组件点击事件，做相应的事务处理
      this.$emit("on-map-tool-select", this.name);
      // this.$store.state.map.map.getViewport().style.cursor=null

      //触发父组件选择事件
      this.dispatch(this.parentName, "on-menu-item-select", this.name);
    }
  },
  mounted() {
    let parent = this.$parent;
    let name = parent.$options.name;
    //查找submenu
    while (parent && (!name || name !== SUBMENU)) {
      parent = parent.$parent;
      if (parent) name = parent.$options.name;
    }
    if (parent) {
      this.parentName = SUBMENU;
    }
    this.parent = parent;

    var menuParent = findComponentUpward(this, MENU);
    if (menuParent && menuParent.prefixCls)
      this.prefixCls = menuParent.prefixCls;
  }
};
</script> 
<style lang="scss">
.ivu-menu-item {
  padding: 5px 7px;
  font-size: 12px;
}
</style>
