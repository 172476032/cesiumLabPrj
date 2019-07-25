<template>
  <div class="cj-data-suggest-wrap">
    <div class="btnsingle"
         @click="sendto">
      <div class="icondiv">
        <svg class="icon"
             aria-hidden="true">
          <use xlink:href="#icon-shujuluru"></use>
        </svg>
      </div>
      <div class="title">共享台账</div>
    </div>

  </div>
</template>

<script>
import "@/assets/fonts/ali_fonts/iconfont.js";

export default {
  data() {
    return {
      dataEntryUrl: "http://10.6.189.40:8080/cjwsjy-sj/a/oa/cjly/tcjlysk"
    };
  },
  components: {},
  mounted() {},
  computed: {},
  methods: {
    sendto() {
      window.open(this.dataEntryUrl, "_self");
    }
  },
  destroyed() {}
};
</script>

<style lang="scss"  >
.cj-data-suggest-wrap {
  margin-top: 5px;
  height: 75px;
  width: 86%;
  padding: 10px;
  background: #ffffff;
  .btnsingle {
    width: 60px;
    display: inline-block;
    .icondiv {
      text-align: center;
      .icon {
        width: 50%;
        height: 35px;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
        color: #299fd1;
      }
    }
    .title {
      text-align: center;
    }
  }
}
.cj-data-suggest-wrap:hover {
  cursor: pointer;
}
</style>
