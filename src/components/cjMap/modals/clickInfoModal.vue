<template>
  <Modal v-model="modalShow"
         ref="monitorModal"
         :title="`${featureName}`"
         draggable
         footer-hide
         class="map-click-info-modal"
         :width=500
         @on-visible-change="modalShowChange">
    <div :class="prefixCls">
      <!-- 标题 -->
      <div v-show="tileShow"
           :class="[`${prefixCls}-item-info-tile`]"
           class="titlecon">
        <span class="featurename">{{featureName}}</span>
        <span class="mapserver">{{mapServerName}}</span>

      </div>
      <!-- 信息tabs -->
      <Tabs :value="tabName"
            style="max-height:450px">
        <TabPane label="空间信息"
                 name="normalInfo">
          <div class="tablediv">
            <table class="kjTable">
              <tbody class="tbody">
                <tr v-for="(value,key) in attributes"
                    :key="key">
                  <td>
                    <div class="title1">{{key}}：</div>
                  </td>
                  <td class="cont">{{value}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPane>
        <TabPane label="基础信息"
                 name="basicInfo">
          <div v-show="Object.keys(normalAttributes).length==0"
               class="nodata">暂无数据</div>
          <div class="tablediv"
               v-show="!Object.keys(normalAttributes).length==0">
            <table class="kjTable">
              <tbody class="tbody">
                <tr v-for="(value,key) in normalAttributes"
                    :key="key">
                  <td>
                    <div class="title1">{{key}}：</div>
                  </td>
                  <td class="cont">{{value}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPane>
        <TabPane label="监测数据"
                 class="demo-spin-container"
                 name="monitorInfo">
          <Row class="condition">
            <Col span="10">
            <span class="label">开始</span>
            <DatePicker size="small"
                        class="timeselect"
                        v-model="st"></DatePicker>
            </Col>
            <Col span="10">
            <span class="label">结束</span>
            <DatePicker size="small"
                        class="timeselect"
                        v-model="et"></DatePicker>
            </Col>
            <Col span="2"
                 style="    margin-left: 3px;">
            <Button size="small"
                    class="querybtn"
                    @click="queryMonitorData">查询</Button>
            </Col>
          </Row>
          <div class="charttables">
            <RadioGroup v-model="distype"
                        class="btns"
                        type="button"
                        size="small">
              <Radio label="chart">线图</Radio>
              <Radio label="table">表格</Radio>
            </RadioGroup>
            <div v-show="distype=='chart'&&totalnum!=0"
                 id="clickhdechart"
                 class="clickhdechart"></div>
            <div v-show="distype=='chart'&&totalnum==0"
                 class="nodata">暂无数据</div>
            <div v-show="distype=='table'">
              <Table :data="tableData"
                     :max-height="380"
                     :columns="tableCol"></Table>
              <!-- 自定义分页 -->
              <div class="pagecustom">
                <div class="total">共&nbsp;&nbsp;{{totalnum}}&nbsp;&nbsp;条</div>
                <Page class="page"
                      :total="totalnum"
                      size="small"
                      :page-size="pagesize"
                      @on-change="pageChange"
                      simple
                      show-total />
              </div>
            </div>

          </div>
          <Spin size="large"
                fix
                v-if="spinShow"></Spin>
        </TabPane>

      </Tabs>
    </div>
  </Modal>
</template>

<script>
const prefixCls = "click-marker-detail-info";
import axios from "axios";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import bus from "@/script/bus.js";
import echarts from "echarts";
import _ from "lodash";
import {
  getDay,
  getFormatDate_YMD,
  formatDate_YMDHMS,
  pagination
} from "@/script/mapUtils/myMaputils/myUtils.js";
import chart from "./chart";

export default {
  name: "overallSearchDetail",
  props: {
    infoShow: {
      type: Boolean,
      default: () => false
    },
    attributes: {
      type: Object,
      default: () => {}
    },
    mapServerName: {
      type: String,
      default: () => ""
    },
    featureName: {
      type: String,
      default: () => ""
    },
    tileShow: {
      type: Boolean,
      default: () => {
        return true;
      },
      required: false
    },
    sttp: {
      type: String,
      default: () => "",
      required: true
    },
    stcd: {
      type: String,
      default: () => "",
      required: true
    }
  },
  mixins: [chart],
  data() {
    return {
      prefixCls: prefixCls,
      modalShow: false,
      spinShow: false,
      distype: "chart",
      tabName: "normalInfo",
      st: new Date(getDay(-7)),
      et: new Date(getDay(-1)),
      tableCol: [],
      tableData: [],
      prePagetationtableData: [],
      pagesize: 5,
      charShow: true,
      normalAttributes: {},
      totalnum: 0,
      hdtableCol: [
        {
          title: "时间",
          key: "tm",
          align: "center",
          width: 120
        },
        {
          title: "水位",
          key: "z",
          align: "center"
        },
        {
          title: "流量",
          key: "q",
          align: "center"
        }
      ],
      pptableCol: [
        {
          title: "时间",
          key: "tm",
          align: "center",
          width: 120
        },
        {
          title: "时段降雨量",
          key: "drp",
          align: "center"
        },
        {
          title: "日降雨量",
          key: "dyp",
          align: "center"
        }
      ],
      rrtableCol: [
        {
          title: "时间",
          key: "tm",
          align: "center",
          width: 120
        },
        {
          title: "水位",
          key: "rz",
          align: "center"
        },
        {
          title: "流量",
          key: "inq",
          align: "center"
        }
        // ,
        // {
        //   title: "出库流量",
        //   key: "hdotp",
        //   align: "center"
        // }
      ]
    };
  },
  components: {},
  mounted() {
    console.log("attributes: ", this.attributes);
  },
  computed: {
    stt() {
      return getFormatDate_YMD(this.st);
    },
    ett() {
      return getFormatDate_YMD(this.et);
    },
    clickFullPoint() {
      return this.$store.state.map.clickFullPoint;
    }
  },
  methods: {
    pageChange(pagenum) {
      console.log("pagenum: ", pagenum);
      this.tableData = pagination(
        pagenum,
        this.pagesize,
        this.prePagetationtableData
      );
    },
    queryBasicData() {
      console.log("开始查询");
      this.normalAttributes = {};
      if (this.sttp && this.sttp != "") {
        let url;
        switch (this.sttp) {
          case "ZQ": //河道水文站
            break;
          case "RR": //设计院-水库 水文站：基本信息及监测数据展示
            let infoUrl = `/cjwsjysj/cjwsjy-sj/a/formApi/cjlyskxx?code=${this.stcd}`;
            console.log("查询开始基本信息数据");
            axios
              .get(infoUrl)
              .then(infodata => {
                console.log("RRinfodata: ", infodata);
                if (
                  infodata.status == 200 &&
                  infodata.data.body.cjlyList.length > 0
                ) {
                  this.normalAttributes = [infodata.data.body.cjlyList[0]].map(
                    v => {
                      return {
                        名称: v.name,
                        测站编号: v.code,
                        测站类型: v.type,
                        所属流域: v.watershed,
                        交换管理单位: v.office,
                        地址: v.address,
                        经度: v.longitude,
                        纬度: v.latitude,
                        坝顶高程: v.elevation + "m",
                        汛限水位: v.slevel + "m",
                        校核洪水位: v.xhlevel + "m",
                        设计洪水位: v.sjlevel + "m",
                        正常高水位: v.zclevel + "m",
                        死水位: v.slevel + "m",
                        兴利水位: v.xllevel + "m",
                        总库容: v.zvolume + "(百万m³)",
                        防洪库容: v.fxvolume + "(百万m³)",
                        兴利库容: v.xlvolume + "(百万m³)",
                        死库容: v.svolume + "(百万m³)"
                      };
                    }
                  )[0];
                  console.log(
                    " this.normalAttributes: ",
                    this.normalAttributes
                  );
                } else {
                  this.normalAttributes = {};
                  this.$Message.info("无基础信息数据");
                }
              })
              .catch(err => {
                this.$Message.error("请求基本信息数据出错");
                console.log("err: ", err);
              })
              .finally(() => {});
            break;
          case "PP": //雨量站
            break;
          default:
            this.$Message.info(`未提供 类型为${this.sttp}的基本信息接口`);
            break;
        }
      }
    },
    queryMonitorData() {
      console.log("开始查询");
      this.reset();
      if (this.sttp && this.sttp != "") {
        let url;
        switch (this.sttp) {
          case "ZQ": //河道水文站
            url = `/cjwsjymonitor/Service1.svc/Public_get_river_r?user=PUBLIC&stcd=${this.stcd}&st=${this.stt}&et=${this.ett}`;
            this.tableCol = this.hdtableCol;
            console.log("查询开始");
            this.spinShow = true;
            axios
              .get(url)
              .then(data => {
                debugger;
                console.log("data: ", data);
                this.spinShow = false;
                if (data.status == 200 && data.data.length > 0) {
                  this.totalnum = data.data.length;
                  this.prePagetationtableData = data.data;
                  this.tableData = pagination(
                    1,
                    this.pagesize,
                    this.prePagetationtableData
                  );
                  console.log("this.tableData: ", this.tableData);
                  let hdtm = _.map(data.data, v => {
                    return v.tm;
                  });
                  let hdz = _.map(data.data, v => {
                    return v.z;
                  });
                  let hdp = _.map(data.data, v => {
                    return v.q;
                  });
                  // console.log("hdtm, hdz, hdp: ", hdtm, hdz, hdp);
                  this.createHdChart(hdtm, hdz, hdp);
                } else {
                  this.tableData = [];
                  this.tableCol = [];
                  this.totalnum = 0;
                  this.$Message.info("此时间段内无河道水文站监测数据");
                }
              })
              .catch(error => {
                console.log("error: ", error);
                this.tableData = [];
                this.tableCol = [];
                this.totalnum = 0;
                this.$Message.error("请求数据出错");
                this.spinShow = false;
              })
              .finally(() => {});
            break;
          case "RR": //设计院-水库 水文站：基本信息及监测数据展示
            let monitorUrl = `/cjwsjymonitor/Service1.svc/Public_get_rsvr_r?user=PUBLIC&stcd=${this.stcd}&st=${this.stt}&et=${this.ett}`;
            console.log("查询开始");
            this.spinShow = true;
            //监测数据请求
            axios
              .get(monitorUrl)
              .then(monitorData => {
                console.log("RRmonitorData: ", monitorData);
                this.spinShow = false;
                if (monitorData.status == 200 && monitorData.data.length > 0) {
                  this.tableCol = this.rrtableCol;
                  this.renderChartAndTable(monitorData);
                } else {
                  this.$Message.info("此时间段内无水库水文站监测数据");
                }
              })
              .catch(err => {
                this.$Message.error("请求数据出错");
                console.log("err: ", err);
                this.spinShow = false;
              });
            this.tableCol = this.hdtableCol;
            break;
          case "PP": //雨量站
            url = `/api/cj-data/precipitation?stcd=${this.stcd}&from=${this.stt}&to=${this.ett}`;
            this.spinShow = true;
            axios
              .get(url)
              .then(data => {
                console.log("ppData: ", data);
                this.spinShow = false;
                let ppData = data.data;
                if (
                  data.status == 200 &&
                  ppData.code == 200 &&
                  ppData.data.length > 0
                ) {
                  this.tableCol = this.pptableCol;
                  let rlt = this.prasePpData(ppData);
                  this.createPpChart(rlt.tm, rlt.seriesArr);
                  console.log("tm, seriesArr: ", rlt);
                } else {
                  this.tableData = [];
                  this.tableCol = [];
                  this.totalnum = 0;
                  this.$Message.info("此时间段内无雨量站监测数据");
                }
              })
              .catch(err => {
                this.$Message.error("请求雨量站数据出错");
                console.log("err: ", err);
                this.spinShow = false;
              })
              .finally(() => {});
            break;
          default:
            this.reset();
            this.$Message.info(`未提供类型为${this.sttp}的监测数据接口`);
            break;
        }
      }
    },
    reset() {
      this.tableData = [];
      this.tableCol = [];
      this.totalnum = 0;
    },
    renderChartAndTable(data) {
      this.totalnum = data.data.length;
      this.prePagetationtableData = data.data;
      this.tableData = pagination(
        1,
        this.pagesize,
        this.prePagetationtableData
      );
      console.log("this.tableData: ", this.tableData);
      let hdtm = _.map(data.data, v => {
        return v.tm;
      });
      let hdrz = _.map(data.data, v => {
        return v.rz;
      });
      let hdinp = _.map(data.data, v => {
        return v.inq;
      });
      let hdotp = _.map(data.data, v => {
        return v.otq;
      });
      // console.log("hdtm, hdz, hdp: ", hdtm, hdz, hdp);
      this.createRrChart(hdtm, hdrz, hdinp, hdotp);
    },
    prasePpData(ppData) {
      let len = ppData.data.length,
        tm = [],
        drp = [],
        dyp = [],
        pdr = [],
        intv = [];
      this.totalnum = len;
      for (let i = 0; i < len; i++) {
        let v = ppData.data[i];
        let prasetm = formatDate_YMDHMS(new Date(v.tm));
        ppData.data[i].tm = prasetm;
        tm.push(prasetm);
        drp.push(v.drp);
        dyp.push(v.dyp);
        // pdr.push(v.pdr);
        // intv.push(v.intv);
      }
      this.prePagetationtableData = ppData.data;
      this.tableData = pagination(
        1,
        this.pagesize,
        this.prePagetationtableData
      );
      let seriesArr = [
        {
          name: "时段降雨量",
          type: "bar",
          barGap: 0,
          data: drp
        },
        {
          name: "日降雨量",
          type: "bar",
          barGap: 0,
          data: dyp
        }
      ];
      return {
        tm: tm,
        seriesArr: seriesArr
      };
    },
    createPpChart(dateArr, seriesArr) {
      let dom = document.getElementById("clickhdechart");
      let el = echarts.init(dom);
      if (dateArr && seriesArr) {
        this.ppChartOption.series = seriesArr;
        this.ppChartOption.xAxis[0].data = dateArr;
        console.log("this.ppChartOption: ", this.ppChartOption);
        el.setOption(this.ppChartOption, true);
      }
    },
    createHdChart(hdtm, hdz, hdp) {
      let dom = document.getElementById("clickhdechart");
      let el = echarts.init(dom);
      if (hdtm && hdz && hdp) {
        el.setOption(this.chartOption(hdtm, hdz, hdp), true);
      }
    },
    chartOption(hdtm, hdz, hdp) {
      return {
        grid: {
          bottom: 80,
          left: "15%",
          right: "15%",
          top: "20%"
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            animation: false,
            label: {
              backgroundColor: "#505765"
            }
          }
        },
        legend: {
          data: ["流量", "水位"],
          x: "left"
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100
          },
          {
            type: "inside",
            realtime: true,
            start: 0,
            end: 100
          }
        ],
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            axisLine: { onZero: false },
            data: hdtm.map(function(str) {
              return str.replace(" ", "\n");
            })
          }
        ],
        yAxis: [
          {
            name: "流量(m^3/s)",
            type: "value"
          },
          {
            name: "水位(mm)",
            nameLocation: "start",
            type: "value",
            inverse: true
          }
        ],
        series: [
          {
            name: "流量",
            type: "line",
            animation: false,
            areaStyle: {
              opacity: 0
            },
            lineStyle: {
              width: 1
            },
            data: hdp
          },
          {
            name: "水位",
            type: "line",
            yAxisIndex: 1,
            animation: false,
            areaStyle: {
              opacity: 0
            },
            lineStyle: {
              width: 1
            },
            data: hdz
          }
        ]
      };
    },
    createRrChart(hdtm, hdrz, hdinp, hdotp) {
      let dom = document.getElementById("clickhdechart");
      let el = echarts.init(dom);
      if (hdtm && hdrz && hdinp && hdotp) {
        el.setOption(this.rrChartOption(hdtm, hdrz, hdinp, hdotp), true);
      }
    },
    rrChartOption(hdtm, hdrz, hdinp, hdotp) {
      return {
        grid: {
          bottom: 80,
          left: "15%",
          right: "15%",
          top: "20%"
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            animation: false,
            label: {
              backgroundColor: "#505765"
            }
          }
        },
        legend: {
          data: ["流量", "水位"], //["入库流量", "出库流量", "水位"],
          x: "left"
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100
          },
          {
            type: "inside",
            realtime: true,
            start: 0,
            end: 100
          }
        ],
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            axisLine: { onZero: false },
            data: hdtm.map(function(str) {
              return str.replace(" ", "\n");
            })
          }
        ],
        yAxis: [
          // {
          //   name: "出库流量(m^3/s)",
          //   type: "value"
          // },
          {
            name: "流量(m^3/s)",
            type: "value"
          },
          {
            name: "水位(mm)",
            nameLocation: "start",
            type: "value",
            inverse: true
          }
        ],
        series: [
          {
            name: "流量",
            type: "line",
            animation: false,
            areaStyle: {
              opacity: 0
            },
            lineStyle: {
              width: 1
            },
            data: hdinp
          },
          // {
          //   name: "出库流量",
          //   type: "line",
          //   animation: false,
          //   areaStyle: {
          //     opacity: 0
          //   },
          //   lineStyle: {
          //     width: 1
          //   },
          //   data: hdotp
          // },
          {
            name: "水位",
            type: "line",
            yAxisIndex: 1,
            animation: false,
            areaStyle: {
              opacity: 0
            },
            lineStyle: {
              width: 1
            },
            data: hdrz
          }
        ]
      };
    },
    modalShowChange(value) {
      this.$emit("resetInfoShow");
      if (!value) {
        //清楚全局click图层的要素和散射点
        if (this.clickFullPoint instanceof Feature) {
          this.clickFullPoint.setStyle(new Style({}));
          this.$store.commit("hideScatterAnimation");
        }
      }
    }
  },
  watch: {
    attributes: {
      deep: true,
      handler(newV, oldV) {
        console.log("newV, oldV: ", newV, oldV);
        if (Object.keys(newV).length != 0) {
          this.queryBasicData();
          //重置监测数据搜索
          this.reset();
        }
      }
    },
    infoShow(newV, oldV) {
      console.log("弹出框状态变化", newV, oldV);
      if (newV) {
        this.modalShow = true;
      }
    },
    modalShow(newV, oldV) {
      if (newV) {
        this.$nextTick(() => {
          console.log("碰撞检测开始");
          // 碰撞检测
          let vm = this.$refs.monitorModal,
            oldFn = vm.handleMoveMove,
            dom = vm.$el.querySelectorAll(".ivu-modal-content")[0];
          vm.handleMoveMove = e => {
            oldFn(e);
            if (vm.dragData.y < 0) {
              vm.dragData.y = 0;
            }
            if (vm.dragData.y > document.body.clientHeight - dom.offsetHeight) {
              vm.dragData.y = document.body.clientHeight - dom.offsetHeight;
            }
            if (vm.dragData.x < 0) {
              vm.dragData.x = 0;
            }
            if (vm.dragData.x > document.body.clientWidth - dom.offsetWidth) {
              vm.dragData.x = document.body.clientWidth - dom.offsetWidth;
            }
          };
        });
      } else {
        this.hasModal = false;
      }
    }
  },
  destroyed() {}
};
</script>

<style lang="scss" scope>
.click-marker-detail-info {
  .tablediv {
    padding: 5px;
    overflow: auto;
    height: 400px;
    text-align: center;
    .kjTable {
      margin: 0 auto;
      .title1 {
        text-align: right;
      }
      .cont {
        font-weight: bold;
      }
      td {
        padding: 5px 40px 5px 0px;
        width: 30%;
        border-bottom: 1px solid #f5eded;
      }
      table {
        width: 720px;
      }
    }
  }
  //自定义分页
  .pagecustom {
    position: relative;
    margin-top: 10px;
    top: 2px;
    .total {
      position: absolute;
      right: 180px;
    }
    .page {
      position: absolute;
      right: 2px;
    }
  }

  &-item-info-tile {
    font-size: 16px;
    padding: 0px 0px 3px 0px;
    color: blue;
  }
  &-item-info-list {
    border-bottom: 1px solid #cccccc;
    padding: 5px;
    font-size: 15px;
    &:hover {
      background-color: #cccccc;
    }
    &-value {
      margin-left: 20px;
    }
    &-key {
      font-weight: bold;
    }
  }
  .condition {
    width: 100%;
    margin: 2px 10px;
    .timeselect {
      width: 107px;
    }
    .label {
      font-size: 12px;
    }
    .querybtn span {
      font-size: 12px;
    }
  }
  .ivu-tabs-bar {
    margin-bottom: 8px;
  }
  .titlecon {
    height: 50px;
    padding: 10px 20px 10px 20px;
    background: #3385ff;
    font-size: 16px;
    color: #ffff;
    .mapserver {
      color: #ffff;
      font-size: 14px;
      margin-left: 8px;
      float: right;
      margin-top: 5px;
    }
    .featurename {
      font-size: 15px;
      float: left;
      color: #ffff;
      margin-top: 5px;
    }
  }
  .clickhdechart {
    height: 330px;
    width: 480px;
    margin: 0 auto;
  }
  .charttables {
    margin: 10px;
    .btns {
      margin-bottom: 10px;
    }
    .ivu-table-cell {
      padding: 1px !important;
    }
  }
  .nodata {
    border: 1px solid #e8eaec;
    padding: 13px 195px;
    margin: 0px 20px;
  }
}
.map-click-info-modal {
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
    left: 480px;
    top: -15px;
  }
  .demo-spin-container {
    display: inline-block;
    position: relative;
    border: 1px solid #eee;
    .ivu-spin-fix {
      top: -8px !important;
    }
  }
}
</style>
