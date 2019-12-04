import echarts from "echarts";


export default {
  name: "flood-echart",
  data() {
    return {
      chartData: [],
      waterLevelChart: null,
      floodflowChart: null,
      areaChart: null,
      originChartData: [
        [0.1, 0],
        [0.2, 0],
        [0.3, 0],
        [0.4, 0],
        [0.5, 0],
        [0.6, 0],
        [0.7, 0],
        [0.8, 0],
        [0.9, 0]
      ]
    }
  },
  computed: {
    waterLevelOption() {
      return {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: "25%",
          bottom: "15%",
          left: "12%",
          right: "12%"
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            color: "#ffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffff"
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: "#ffff"
          },
          splitLine: { //网格线
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#ffff"
            }
          }
        },
        series: [{
          name: '最大水位',
          type: 'line',
          smooth: true,
          data: [].concat(this.originChartData), //复制原始的数据，因为echarts获取data并改变data的时候会改变引用this.originChartData的值，因此复制一个对象
          lineStyle: {
            color: "#1EE2E8",
            width: 1,
            opacity: 0.6
          },
          markPoint: {
            symbol: "pin",
            symbolSize: 27,
            data: [{
                type: 'max',
                name: '最大值'
              },
              {
                type: 'min',
                name: '最小值'
              }
            ]
          },
          markLine: {
            data: [{
              type: 'average',
              name: '平均值'
            }]
          },
          areaStyle: {
            color: "#1EE2E8",
            opacity: 0.1
          }
        }]
      }
    },
    floodflowOption() {
      return {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: "25%",
          bottom: "15%",
          left: "12%",
          right: "12%"
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            color: "#ffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffff"
            }
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: false,
          axisLabel: {
            color: "#ffff"
          },
          splitLine: { //网格线
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#ffff"
            }
          }
        },
        series: [{
          name: '最大流量',
          type: 'line',
          smooth: true,
          data: [].concat(this.originChartData),
          lineStyle: {
            color: "#1E90FF",
            width: 1,
            opacity: 0.6
          },
          markPoint: {
            symbol: "pin",
            symbolSize: 27,
            data: [{
                type: 'max',
                name: '最大值'
              },
              {
                type: 'min',
                name: '最小值'
              }
            ]
          },
          markLine: {
            data: [{
              type: 'average',
              name: '平均值'
            }]
          },
          areaStyle: {
            color: "#1E90FF",
            opacity: 0.1
          }
        }]
      }
    },
    areaOption() {
      return {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: "25%",
          bottom: "15%",
          left: "12%",
          right: "12%"
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            color: "#ffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffff"
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: "#ffff"
          },
          splitLine: { //网格线
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#ffff"
            }
          }
        },
        series: [{
          name: '淹没面积',
          type: 'line',
          smooth: true,
          data: [].concat(this.originChartData),
          lineStyle: {
            color: "#CD4F39",
            width: 1,
            opacity: 0.6
          },
          markPoint: {
            symbol: "pin",
            symbolSize: 27,
            data: [{
                type: 'max',
                name: '最大值'
              },
              {
                type: 'min',
                name: '最小值'
              }
            ]
          },
          markLine: {
            data: [{
              type: 'average',
              name: '平均值'
            }]
          },
          areaStyle: {
            color: "#CD4F39",
            opacity: 0.1
          }
        }]
      }
    }

  },
  mounted() {
    //水位初始化
    this.waterLevelChart = echarts.init(this.$refs.waterLevelChart);
    this.waterLevelChart.setOption(this.waterLevelOption, true)
    //流量初始化
    this.floodflowChart = echarts.init(this.$refs.floodflowChart);
    this.floodflowChart.setOption(this.floodflowOption, true)
    //淹没面积
    this.areaChart = echarts.init(this.$refs.areaChart);
    this.areaChart.setOption(this.areaOption, true)
  },
  methods: {
    dynamicEchart(waterLevelVal, floodflowVal, areaVal) {
      this.pData(this.waterLevelOption.series[0].data, waterLevelVal)
      this.waterLevelChart.setOption(this.waterLevelOption, true);
      this.pData(this.floodflowOption.series[0].data, floodflowVal)
      this.floodflowChart.setOption(this.floodflowOption, true);
      this.pData(this.areaOption.series[0].data, areaVal)
      this.areaChart.setOption(this.areaOption, true);
    },
    pData(data, val) {
      data.shift();
      data.push(val)
    },
    resetCharts() {
      this.waterLevelOption.series[0].data = this.originChartData
      this.waterLevelChart.setOption(this.waterLevelOption, true);
      this.floodflowOption.series[0].data = this.originChartData
      this.floodflowChart.setOption(this.floodflowOption, true);
      this.areaOption.series[0].data = this.originChartData
      this.areaChart.setOption(this.areaOption, true);
    }
  },
}
