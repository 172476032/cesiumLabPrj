<template>
  <Modal v-model="modalShow"
         :title="title"
         draggable
         footer-hide
         class="point-pick-modal"
         :width=360
         @on-visible-change="visibleChange">
    <Row class="row">
      经度：
      <Col class="col">
      <Input v-model="lonNew"
             class="ipt"></Input>
      </Col>
      纬度：
      <Col class="col">
      <Input v-model="latNew"
             class="ipt">
      </Input>
      </Col>
      <Col class="col"><Button size="small"
              :disabled="submitDis"
              @click="submitLonLat"
              type="info">确定</Button></Col>
    </Row>
  </Modal>
</template>

<script>
import inoutInteractions from "../mixins/inoutInteractions";

export default {
  name: "pointpickmodal",
  props: {
    title: {
      type: String,
      default: () => "点拾取"
    },
    lon: {
      type: String,
      default: () => ""
    },
    lat: {
      type: String,
      default: () => ""
    }
  },
  mixins: [inoutInteractions],
  data() {
    return {
      modalShow: false,
      lonNew: "",
      latNew: ""
    };
  },
  components: {},
  mounted() {},
  computed: {
    submitDis() {
      return this.queryParams.opt ? false : true;
    }
  },
  methods: {
    showPickModal() {
      this.modalShow = true;
    },
    hidePickModal() {
      this.modalShow = false;
    },
    visibleChange(newV) {
      console.log("newV: ", newV);
      if (!newV) {
        this.$emit("unPointPickKey");
      }
    },
    resetPickModal() {
      this.lonNew = "";
      this.latNew = "";
      this.modalShow = false;
      this.$emit("unPointPickKey");
    }
  },
  watch: {
    lon(newV) {
      console.log("newV: ", newV);
      this.lonNew = newV;
    },
    lat(newV) {
      this.latNew = newV;
    }
  },
  destroyed() {}
};
</script>

<style lang="scss" scope>
.point-pick-modal {
  .row {
    padding: 10px;
    .col {
      display: inline-block;
      .ipt {
        width: 100px;
      }
    }
  }

  border-radius: 5px;
  .ivu-modal-body {
    padding: 0px;
    border-left: 3px solid #0566a7;
    border-right: 3px solid #0566a7;
    border-bottom: 3px solid #0566a7;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    background: #fdfafa;
  }
  .ivu-modal-header {
    padding: 6px 16px;
    background: #0566a7;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom: 0px;
    .ivu-modal-header-inner {
      color: #ffff;
      font-weight: 400;
    }
  }
  .ivu-modal-close {
    top: 2px;
    .ivu-icon-ios-close {
      color: #ffff;
    }
  }
  .ivu-modal-content-drag {
    left: 500px;
    top: -15px;
  }
}
</style>
