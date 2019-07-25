// import echarts from 'echarts'

export default {
  data() {
    return {
      pptableCol: [{
          title: "时间",
          key: "tm",
          align: "center",
          width: 95
        }, {
          title: "时段降雨量",
          key: "drp",
          align: "center",
          width: 100
        }, {
          title: "日降雨量",
          key: "dyp",
          align: "center",
        }
        // , {
        //   title: "历时",
        //   key: "pdr",
        //   align: "center",
        //   width: 40
        // }, {
        //   title: "时段长",
        //   key: "intv",
        //   align: "center",
        // }
      ],

      ppChartOption: {
        color: ['#003366', '#006699', '#4cabce', '#e5323e'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['时段降雨量', '日降雨量'] // ['时段降雨量', '日降雨量']
        },
        dataZoom: [{
            type: 'slider',
            show: true,
            start: 0,
            end: 50,
            handleSize: 8
          },
          {
            type: 'inside',
            start: 0,
            end: 50
          },
          {
            type: 'slider',
            show: true,
            yAxisIndex: 0,
            filterMode: 'empty',
            width: 12,
            height: '70%',
            handleSize: 8,
            showDataShadow: false,
            left: '93%'
          }
        ],
        toolbox: {
          show: true,
          top: 18,
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          axisTick: {
            show: false
          },
          data: []
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [
          // {
          //   name: 'Forest',
          //   type: 'bar',
          //   barGap: 0,
          //   label: labelOption,
          //   data: [320, 332, 301, 334, 390]
          // },
          // {
          //   name: 'Steppe',
          //   type: 'bar',
          //   label: labelOption,
          //   data: [220, 182, 191, 234, 290]
          // },
          // {
          //   name: 'Desert',
          //   type: 'bar',
          //   label: labelOption,
          //   data: [150, 232, 201, 154, 190]
          // },
          // {
          //   name: 'Wetland',
          //   type: 'bar',
          //   label: labelOption,
          //   data: [98, 77, 101, 99, 40]
          // }
        ]
      },

    }
  }
}
