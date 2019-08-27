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
    <div class="leftPanel">
      <div class="waterlevel">
        <div class="title"><span>最大水位与时间关系曲线</span></div>
      </div>
      <div class="floodflow">
        <div class="title"><span>最大流量与时间关系曲线</span></div>

      </div>
      <div class="area">
        <div class="title"><span>淹没面积与时间关系曲线</span></div>

      </div>

    </div>
    <div class="rightPanel">
      <div class="building">
        <div class="title"><span>居民房屋损失</span></div>
        <div class="build">
          <div class="name"><span>房屋损失</span></div>
          <div class="content"><span class="num">6453</span><span class="unit">间</span></div>
        </div>
        <div class="money">
          <div class="name"><span>财产损失</span></div>
          <div class="content"><span class="num">86542</span><span class="unit">K</span></div>
        </div>
      </div>
      <div class="agricultural">
        <div class="title"><span>农业损失</span></div>
        <div class="mian">
          <div class="name"><span>面积</span></div>
          <div class="content"><span class="num">84353</span><span class="unit">km²</span></div>
        </div>
      </div>
      <div class="industrial">
        <div class="title"><span>工业损失</span></div>
        <div class="mian">
          <div class="name"><span>厂房</span></div>
          <div class="content"><span class="num">54686</span><span class="unit">间</span></div>
        </div>
      </div>
      <div class="business">
        <div class="title"><span>商业损失</span></div>
        <div class="mian">
          <div class="name"><span>经济</span></div>
          <div class="content"><span class="num">9526</span><span class="unit">K</span></div>
        </div>
      </div>
    </div>
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
    arrivalOlIndex() {
      console.log("arrivalIndex: ", this.$store.state.map.arrivalOlIndex);
      return this.$store.state.map.arrivalOlIndex;
    },
    sortGroupGrids3857Length() {
      return this.$store.state.map.sortGroupGrids3857Length;
    },
    percent() {
      return Number(
        ((100 / this.sortGroupGrids3857Length) * this.arrivalOlIndex).toFixed(0)
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
  .leftPanel {
    width: 17%;
    height: 29%;
    position: absolute;
    top: 65px;
    left: 10px;
    z-index: 100;
    .waterlevel,
    .floodflow,
    .area {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-image: url(/static/layout/框1.png);
      background-size: 100% 100%;
      margin-bottom: 6px;
      position: relative;
      .title {
        position: absolute;
        top: 2px;
        left: 35px;
        color: #0cf1f3;
        font-weight: bold;
      }
    }
  }
  .rightPanel {
    width: 15%;
    height: 23%;
    position: absolute;
    top: 65px;
    right: 10px;
    z-index: 100;
    .building {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-image: url(/static/layout/框2.png);
      background-size: 100% 100%;
      margin-bottom: 6px;
      position: relative;
      padding: 20px;
      .title {
        position: absolute;
        top: 2px;
        left: 48px;
        color: #0cf1f3;
        font-weight: bold;
      }
      .build {
        width: 84%;
        height: 40%;
        background-repeat: no-repeat;
        background-image: url(/static/layout/building1.png);
        background-size: 100% 100%;
        position: absolute;
        top: 25px;
        .num {
          color: #f36c0b;
          -webkit-line-clamp: 2;
          background-image: -webkit-linear-gradient(left, #f36c0b, #e6ebec);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
      .money {
        width: 84%;
        height: 40%;
        background-repeat: no-repeat;
        background-image: url(/static/layout/building2.png);
        background-size: 100% 100%;
        position: absolute;
        top: 92px;
        .num {
          color: #6df50c;
          -webkit-line-clamp: 2;
          background-image: -webkit-linear-gradient(left, #6df50c, #e6ebec);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
    .agricultural,
    .industrial,
    .business {
      width: 100%;
      height: 60%;
      background-repeat: no-repeat;
      background-image: url(/static/layout/框3.png);
      background-size: 100% 100%;
      margin-bottom: 6px;
      position: relative;
      padding: 20px;
      .title {
        position: absolute;
        top: 2px;
        left: 48px;
        color: #0cf1f3;
        font-weight: bold;
      }
      .mian {
        width: 84%;
        height: 64%;
        background-repeat: no-repeat;
        background-image: url(/static/layout/other.png);
        background-size: 100% 100%;
        position: absolute;
        top: 25px;
      }
    }
    .agricultural .num {
      color: #08cbf6;
      -webkit-line-clamp: 2;
      background-image: -webkit-linear-gradient(left, #08cbf6, #e6ebec);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .industrial .num {
      color: #ee1947;
      -webkit-line-clamp: 2;
      background-image: -webkit-linear-gradient(left, #ee1947, #ece3e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .business .num {
      color: #0ecdf8;
      -webkit-line-clamp: 2;
      background-image: -webkit-linear-gradient(left, #08cbf6, #e6ebec);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .name {
      position: absolute;
      top: 10px;
      left: 18px;
      color: #ffff;
    }
    .content {
      position: absolute;
      top: 23px;
      left: 80px;
      .num {
        font-size: 20px;
        font-weight: bold;
      }
      .unit {
        font-size: 12px;
        margin-left: 5px;
        color: #ffff;
      }
    }
  }
}
</style>
