<template>
  <div id="scatter-animation">
    <div id="css_animation"
         :style="{'background':bakcolor}"></div>
  </div>
</template>

<script>
import Overlay from "ol/Overlay";

export default {
  data() {
    return {
      point_overlay: null,
      bakcolor: null
    };
  },
  props: ["map"],
  components: {},
  computed: {
    scatterAnimation() {
      return this.$store.getters.getScatterAnimation;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initOverlay(this.map);
    });
  },
  methods: {
    initOverlay(map) {
      let point_div = document.getElementById("css_animation");
      this.point_overlay = new Overlay({
        element: point_div,
        stopEvent: false,
        positioning: "center-center"
      });
      map.addOverlay(this.point_overlay);
      // point_overlay.setPosition([106.12478184673274, 27.99206680873351]);
    },
    showScatterAnimation(coordinate) {
      console.log("this.point_overlay.setPosition: ", coordinate);
      this.point_overlay.setPosition(coordinate);
    }
  },
  destroyed() {
    this.showScatterAnimation(undefined);
  },
  watch: {
    // scatterAnimation(scatterAnimation) {
    //   // console.log("coordinate2: ", scatterAnimation);
    //   this.showScatterAnimation(scatterAnimation.coordinate);
    //   this.bakcolor = scatterAnimation.color;
    // }
    scatterAnimation: {
      deep: true,
      handler(scatterAnimation) {
        console.log("scatterAnimation: ", scatterAnimation);
        this.showScatterAnimation(scatterAnimation.coordinate);
        this.bakcolor = scatterAnimation.color;
      }
    }
  }
};
</script>

<style lang='scss'>
#css_animation {
  height: 50px;
  width: 50px;
  border-radius: 25px;
  // background: rgba(255, 0, 0, 0.9);
  z-index: 1;
  transform: scale(0);
  animation: myfirst 1s;
  animation-iteration-count: infinite;
}

@keyframes myfirst {
  to {
    transform: scale(2);
    background: rgba(0, 0, 0, 0);
  }
}
#scatter-animation {
  .ol-overlaycontainer {
    z-index: 10px;
  }
}
</style>
