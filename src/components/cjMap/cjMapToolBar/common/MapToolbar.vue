<template>
  <ul :class='classes'
      :style='styles'
      @click="handleClick">
    <slot></slot>
  </ul>
</template>
<script>
import { oneOf } from "@/script/mapUtils/myMaputils/myUtils.js";
import Emitter from "@/script/mixins/emitter";

// const prefixCls = 'ivu-menu';
const SUBMENU = "SubToolbar";
const MENU = "Toolbar";
const MENU_ITEM = "ToolbarItem";

export default {
  name: MENU,
  mixins: [Emitter],
  props: {
    activeName: {
      type: [String, Number]
    },
    theme: {
      validator(value) {
        return oneOf(value, ["light", "dark", "primary"]);
      },
      default: "light"
    },
    prefixCls: {
      type: String,
      default: "ivu-menu"
    },
    direction: {
      default: "vertical"
    }
  },
  data() {
    return {
      currentActiveName: this.activeName,
      openNames: []
    };
  },
  computed: {
    classes() {
      let theme = this.theme;
      let prefixCls = this.prefixCls,
        direction = this.direction;
      return [
        `${prefixCls}`,
        `${prefixCls}-${theme}`,
        `${prefixCls}-${direction}`
      ];
    },
    styles() {
      let style = {};
      return style;
    }
  },
  methods: {
    handleClick(evt) {
      // console.log(evt.target);
      // this.$store.commit("SET_SUBMENU_ACTIVE_NAME", '');
    }
  },
  mounted() {
    this.$on("on-menu-item-select", name => {
      this.lastActiveName = this.currentActiveName;
      this.$emit("on-select", name);
    });
  }
};
</script>
