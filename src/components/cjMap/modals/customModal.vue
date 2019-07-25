<template>
  <Modal v-model="modalShow"
         :title="title"
         draggable
         footer-hide
         class="custom-modal"
         :width=500
         @on-visible-change="visibleChange">

  </Modal>
</template>

<script>
export default {
  name: "custommodal",
  props: {
    title: {
      type: String,
      default: () => "信息框"
    },
    visibleChange: {
      type: Function,
      default: () => {
        return () => {};
      },
      required: false
    }
  },
  data() {
    return {};
  },
  components: {},
  mounted() {},
  computed: {},
  methods: {},
  destroyed() {}
};
</script>

<style lang="scss" scope>
.custom-modal {
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
