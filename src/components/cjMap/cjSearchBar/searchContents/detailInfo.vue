<template>
  <div class="over-all-search-detail-info">

    <div v-show="tileShow"
         :class="[`${prefixCls}-item-info-tile`]"
         class="titlecon">
      <span class="featurename">{{featureName}}</span>
      <span class="mapserver">{{mapServerName}}</span>

    </div>

    <Tabs :value="tabName"
          style="max-height:450px">
      <TabPane label="空间信息"
               name="normalInfo">
        <div style="background:#eee;padding:5px">
          <card :bordered="false"
                style="overflow: auto;"
                :style="{'width':'','maxHeight':'650px'}">
            <div v-for="(value,key) in attributes"
                 :class="`${prefixCls}-item-info-list`"
                 :key="key">
              <span :class="[`${prefixCls}-item-info-list-key`]"> {{key}} : </span>
              <span :class="[`${prefixCls}-item-info-list-value`]">{{value}}</span>
            </div>
          </card>
        </div>
      </TabPane>
      <TabPane label="基础信息"
               name="basicInfo">
        <div style="background:#eee;padding:5px">

        </div>
      </TabPane>
      <TabPane label="监测数据"
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
                  @click="query">查询</Button>
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
               id="hdechart"
               class="hdechart"></div>
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

      </TabPane>

    </Tabs>

  </div>
</template>

<script>
const prefixCls = "over-all-search-detail-info";
import axios from "axios"
import bus from "@/script/bus.js";
import _ from "lodash";
import echarts from "echarts"
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
      distype: "chart",
      tabName: "normalInfo",
      st: new Date(getDay(-7)),
      et: new Date(getDay(-1)),
      tableCol: [],
      tableData: [],
      prePagetationtableData: [],
      pagesize: 5,
      charShow: true,
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
      ]
    };
  },
  components: {},
  mounted() {
    console.log("attributes: ", this.attributes);
  },
  computed: {
    // type() {

    //   return this.attributes["编码"] || this.attributes.STTP;
    // },
    // stcd() {
    //   return this.attributes["编号"] || this.attributes.STCD;
    // },
    stt() {
      return getFormatDate_YMD(this.st);
    },
    ett() {
      return getFormatDate_YMD(this.et);
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
    query() {
      debugger
      console.log("开始查询");
      if (this.sttp && this.sttp != "") {
        let url;
        switch (this.sttp) {
          case "ZQ": //河道水文站
            url = `/cjwsjymonitor/Service1.svc/Public_get_river_r?user=PUBLIC&stcd=${
              this.stcd
            }&st=${this.stt}&et=${this.ett}`;
            this.tableCol = this.hdtableCol;
            console.log("查询开始");
            axios
              .get(url)
              .then(data => {
                console.log("data: ", data);
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
                  this.$Message.info("最近无数据");
                }
              })
              .catch(error => {
                console.log("error: ", error);
                this.tableData = [];
                this.tableCol = [];
                this.totalnum = 0;
                this.$Message.error("查询出错，请重试！");
              });
            break;
          case "RR": //设计院-水库 水文站：基本信息及监测数据展示
            let infoUrl = `/cjwsjysj/cjwsjy-sj/a/formApi/cjlyskxx?code=${
                this.stcd
              }`,
              monitorUrl = `/cjwsjymonitor/Public_get_rsvr_r?user=PUBLIC&stcd=${
                this.stcd
              }&st=${this.stt}&et=${this.ett}`;
            axios
              .get(infoUrl)
              .then(infodata => {
                console.log("RRinfodata: ", infodata);
                axios
                  .get(monitorUrl)
                  .get(monitorData => {
                    console.log("RRmonitorData: ", monitorData);
                  })
                  .catch(err => {
                    console.log("err: ", err);
                  });
              })
              .catch(err => {
                console.log("err: ", err);
              });
            this.tableCol = this.hdtableCol;
            break;
          case "PP": //雨量站
            url = `/api/cj-data/precipitation?stcd=${this.stcd}&from=${
              this.stt
            }&to=${this.ett}`;
            axios.get(url).then(data => {
              console.log("ppData: ", data);
              let ppData = data.data;
              if (
                data.status == 200 &&
                ppData.code == 200 &&
                ppData.data.length > 0
              ) {
                this.tableCol = this.pptableCol;
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
                  // ,
                  // {
                  //   name: "历时",
                  //   type: "bar",
                  //   barGap: 0,
                  //   data: pdr
                  // },
                  // {
                  //   name: "时段长",
                  //   type: "bar",
                  //   barGap: 0,
                  //   data: intv
                  // }
                ];
                this.createPpChart(tm, seriesArr);
                console.log("tm, seriesArr: ", tm, seriesArr);
              } else {
                this.tableData = [];
                this.tableCol = [];
                this.totalnum = 0;
                this.$Message.info("最近无数据");
              }
            });
            break;
          default:
            this.tableData = [];
            this.tableCol = [];
            this.totalnum = 0;
            // this.$Message.info(`未提供水文站类型为${this.sttp}的接口`);//测试用的，发布注释
            this.$Message.info(`未提供数据接口`)
            break;
        }
      }
    },
    createPpChart(dateArr, seriesArr) {
      let dom = document.getElementById("hdechart");
      let el = echarts.init(dom);
      if (dateArr && seriesArr) {
        this.ppChartOption.series = seriesArr;
        this.ppChartOption.xAxis[0].data = dateArr;
        console.log("this.ppChartOption: ", this.ppChartOption);
        el.setOption(this.ppChartOption, true);
      }
    },
    createHdChart(hdtm, hdz, hdp) {
      let dom = document.getElementById("hdechart");
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
    }
  },
  watch: {
    attributes: {
      deep: true,
      handler(newV, oldV) {
        console.log("newV, oldV: ", newV, oldV);
        if (Object.keys(newV).length != 0) {
          this.st = new Date(getDay(-7));
          this.et = new Date(getDay(-1));
          this.query();
        }
      }
    }
  },
  destroyed() {}
};
</script>

<style lang="scss" scope>
.over-all-search-detail-info {
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
    margin: 0 auto;
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
  .hdechart {
    height: 350px;
    width: 330px;
  }
  .charttables {
    margin-top: 10px;
    .btns {
      margin-bottom: 10px;
    }
    .ivu-table-cell {
      padding: 1px !important;
    }
    .nodata {
      border: 1px solid #e8eaec;
      padding: 13px 125px;
    }
  }
}
</style>
