<template>
  <div class="zoom-container">
    <div class="zoom-div"
         title="放大一级"
         @mouseover="zoomInHover = !zoomInHover"
         @mouseout="zoomInHover = !zoomInHover"
         @click.prevent="zoomInHandler">
      <div class="in"
           :style="`background-position: ${zoomInHover?-60:0}px 0;`"></div>
    </div>
    <div class="zoom-div"
         title="缩小一级"
         @mouseover="zoomOutHover = !zoomOutHover"
         @mouseout="zoomOutHover = !zoomOutHover"
         @click.prevent="zoomOutHandler">
      <div class="out"
           :style="`background-position: ${zoomOutHover?-30:-10}px 0;`"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "map_zoom",
  data() {
    return {
      zoomInHover: false,
      zoomOutHover: false
    };
  },
  computed: {
    map() {
      return this.$store.getters.map; //openlayers地图对象
    }
  },
  methods: {
    zoomInHandler() {
      let view = !!this.map && this.map.getView();
      if (view) {
        if (view.getZoom() == view.maxZoom_) {
          this.$Notice.warning({
            title: "提示",
            desc: "地图已是最大级别，不能再放大"
          });
        } else {
          var zoom = view.getZoom() + 1;
          this.setViewAnimate(view, zoom);
          // view.setZoom(zoom);
        }
      }
    },
    setViewAnimate(view, zoom) {
      view.animate({
        duration: 600,
        zoom: zoom
      });
    },
    zoomOutHandler() {
      let view = !!this.map && this.map.getView();
      if (view) {
        if (view.getZoom() == view.minZoom_) {
          this.$Notice.warning({
            title: "提示",
            desc: "地图已是最小级别，不能再缩小"
          });
        } else {
          var zoom = view.getZoom() - 1;
          this.setViewAnimate(view, zoom);
          // view.setZoom(zoom);
        }
      }
    }
  }
};
</script>

<style lang="scss">
@mixin zoom-pic {
  width: 10px;
  height: 10px;
  top: 8px;
  left: 8px;
  background-image: url("../../../../assets/img/map/zoom.png");
  position: absolute;
}

.zoom-container {
  position: absolute;
  bottom: 2%;
  right: 35px;
  z-index: 1;
  transform: scale(0.8);
  .zoom-div:first-child {
    border-bottom: 1px solid #ccc;
  }

  .zoom-div {
    box-shadow: 1px 2px 1px #d7dde4;
    cursor: pointer;
    width: 26px;
    height: 26px;
    overflow: hidden;
    background-color: #fff;
    z-index: 10;
    position: relative;

    & .in {
      @include zoom-pic;
      // background-position: 0 0;
    }

    & .out {
      @include zoom-pic;
      // background-position: -10px 0;
    }
  }
}

@media screen and (max-width: 1366px) {
  .zoom-container {
    bottom: 20px;
  }
}
</style>
