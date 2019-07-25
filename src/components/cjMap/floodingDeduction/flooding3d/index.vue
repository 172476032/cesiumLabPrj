<template>
  <div class="flooding-deduction">
    <ButtonGroup class="btngroups">
      <Button icon="md-refresh"
              @click="replayFlooding">重播</Button>
      <Button icon="md-fastforward"
              v-if="show"
              @click="beginFlooding">开始</Button>
      <Button icon="ios-pause"
              v-else
              @click="pauseFlooding">暂停</Button>
    </ButtonGroup>
    <Progress class="progress"
              :percent="percent"
              :stroke-width="5" />
    <flood-legend></flood-legend>
  </div>
</template> 

<script>
import floodLegend from "./floodLegend";

export default {
  data() {
    return {
      show: true
    };
  },
  components: { floodLegend },
  mounted() {},
  computed: {
    arrivalIndex() {
      console.log("arrivalIndex: ", this.$store.state.map.arrivalIndex);
      return this.$store.state.map.arrivalIndex;
    },
    sortGroupGridsLength() {
      return this.$store.state.map.sortGroupGridsLength;
    },
    percent() {
      return Number(
        ((100 / this.sortGroupGridsLength) * this.arrivalIndex).toFixed(0)
      );
    }
  },
  methods: {
    replayFlooding() {
      this.$emit("replayFlooding");
    },
    beginFlooding() {
      this.show = !this.show;
      this.$emit("beginFlooding");
    },
    pauseFlooding() {
      this.show = !this.show;
      this.$emit("pauseFlooding");
    }
  },
  destroyed() {}
};
</script>

<style lang="scss"  >
.flooding-deduction {
  .btngroups {
    position: absolute;
    left: 45%;
    bottom: 80px;
  }
  .progress {
    position: absolute;
    left: 43%;
    bottom: 55px;
    width: 260px;
    .ivu-progress-text-inner {
      color: #ffffff;
    }
  }
}
</style>
