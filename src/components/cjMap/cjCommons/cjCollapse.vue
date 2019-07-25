<!--  -->
<template>
  <div class="cj-collapse"
       :style="blockStyle">
    <div class="header"
         :class="{'header-active': showContent}"
         ref="header"
         @click.stop="toggle( $event)">
      <div v-show="titlePosition=='left'"
           class="title">{{title}}</div>
      <Icon :type="icon" />
      <div v-show="titlePosition=='right'"
           class="title">{{title}}</div>
    </div>
    <div class="dropCard"
         :class="{baseMapStyle:title=='底图'}"
         :style="
      dropCardPosition=='left'?{left:'0px'}:{right:'0px'}">
      <transition name="dropCard">
        <div v-show="showContent"
             class="content">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import bus from "@/script/bus.js";

export default {
  name: "collapsecommon",
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
      default: "right"
    },
    dropCardPosition: {
      default: "left"
    }
  },
  data() {
    return {
      showContent: false
    };
  },

  components: {},

  computed: {},

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
<style lang='scss' scoped>
.cj-collapse {
  margin-left: 8px;
  display: inline-block;
  .header {
    .title {
      display: inline-block;
    }
  }
  .dropCard {
    overflow: hidden;
    padding: 0 0 2px;
    margin-top: 10px;
    display: inline;
    position: absolute;
  }
  .baseMapStyle {
    transform: scale(0.8);
    margin-top: -37px;
    margin-right: -35px;
  }
  .content {
    background: #ffff;
  }
}
.cj-collapse:hover {
  cursor: pointer;
}
</style>