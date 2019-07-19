<template>
  <div class="cj-collapse-wrapper"
       :style="blockStyle">
    <div class="cj-collapse-header"
         :class="{'cj-collapse-header-active': showContent}"
         ref="header"
         :style="{float: titlePosition}"
         @click.stop="toggle($event)">
      <Icon :size=18
            type="logo-buffer" />
      <div class="cj-collapse-title">{{title}}</div>
    </div>
    <div style="clear: both"></div>
    <div style='overflow: hidden; padding: 0 0 2px; margin-top: 6px'>
      <transition name='dropCard'>
        <div v-show="showContent"
             class="cj-collapse-content">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import bus from "@/script/bus.js";

export default {
  data: function() {
    return {
      showContent: false
    };
  },
  props: {
    blockStyle: {
      default: null
    },
    icon: {
      default: "wrench"
    },
    title: {
      default: "工具"
    },
    titlePosition: {
      default: "left"
    }
  },
  mounted() {
    bus.$on("on-hide-collapse-content", dom => {
      console.log("折叠组件", this.$refs.header);
      if (dom != this.$refs.header) {
        this.hide();
      }
    });
    //点击文档时隐藏
    document.addEventListener("click", this.hide);
  },

  methods: {
    toggle(e) {
      console.log("e: ", e, e.currentTarget);
      bus.$emit("on-hide-collapse-content", e.currentTarget);
      this.showContent = !this.showContent;
      this.$el.style.zIndex = this.showContent ? 1000 : 999;
    },
    hide() {
      this.$el.style.zIndex = 999;
      this.showContent = false;
    }
  },
  destroyed() {
    bus.$off("on-hide-collapse-content");
  }
};
</script>

<style lang="scss">
.cj-collapse {
  &-wrapper {
    position: absolute;
    z-index: 999;
    box-sizing: border-box;
  }
  &-header {
    position: relative;
    z-index: 1;
    line-height: 34px;
    background: #fff; // float: left;
    cursor: pointer;
    font-size: 14px;
    padding: 0 15px;
    display: inline-block;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.15);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: -34px;
    & > div {
      display: inline-block;
    }
    &-active {
      color: #3d6dcc;
    }
    &:before {
      content: "";
      position: absolute;
      height: 70%;
      top: 15%;
      width: 2px;
      background: #ddd;
      left: 0;
    }
  }
  &-content {
    // margin-top: 4px;
    position: relative;
    z-index: 2;
    background: #fff;
    box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
  }
}
</style>