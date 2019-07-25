<template>
  <div class="flood-legend">
    <div class="header">
      <div class="legend">图例</div>
      <div class="themename"
           @click="maxmin=!maxmin">
        <Icon v-show="!maxmin"
              type="md-expand" />
        <Icon v-show="maxmin"
              type="md-contract" />
      </div>
    </div>
    <hr class="line"
        v-show="maxmin">
    <div v-show="maxmin"
         class="content">
      <div class="codename">淹没水深</div>
      <div v-for="(v,i) in colors"
           :key="i"
           class="list">
        <div class="colordiv"
             :style="{backgroundColor:`${v.color}`}"></div>
        <div class="name">{{v.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      maxmin: true
    };
  },
  components: {},
  mounted() {},
  computed: {
    colors() {
      return this.$store.state.map.floodingColors;
    }
  },
  methods: {},
  destroyed() {}
};
</script>

<style lang="scss" >
.flood-legend {
  width: 180px;
  background: #ffffff;
  position: absolute;
  left: 1%;
  bottom: 50px;
  border-radius: 5px;
  .header {
    height: 20px;
    margin: 10px 10px 3px 10px;
    .legend {
      float: left;
    }
    .themename {
      float: right;
    }
  }
  .line {
    background-color: #d8d3d3;
    height: 1px;
    border: none;
  }
  .content {
    margin: 5px 20px;
    .codename {
      margin-bottom: 10px;
      font-weight: bold;
    }
    .list {
      height: 25px;
      .colordiv {
        width: 80px;
        height: 20px;
        padding: 5px 0px;
        float: left;
      }
      .name {
        float: right;
      }
    }
  }
}
</style>
