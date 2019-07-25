// 河湖一览 地图专题图接口
export default {
    // 分年份分区域获取取水量
    GET_WATER_INTAKE_BY_YEAR_AREA: {
        url: '/static/jsons/mapTheme/waterIntake.json',
        method: 'get'
    },
    // 分年份分区域获取用水量
    GET_WATER_USED_BY_YEAR_AREA: {
        url: '/static/jsons/mapTheme/waterUsed.json',
        method: 'get'
    },
    GET_PDO_BY_ADCODE_RVCODE: {
        url: '/arcgis/rest/services/HB_PDO/MapServer/3/query?f=json&where={where}&outFields=*',
        method: 'get'
    },
    // 获取一段时间内实时数据
    GET_REALTIME_DATA: {
        url: '/HGSSM/{monitorType}',
        method: 'POST'
    },
    // 获取单个水质测站的基本信息
    GET_WATER_QS_BASE_BY_STCD: {
        url: '/hgwater/station/selectSTATBySTCD/{STCD}',
        method: 'get'
    },
    // 获取一段时间内单个水质测站的实时数据
    GET_WATER_QS_DATA_BY_STCD: {
        url: '/hgwater/station/selectSWMSARByCDAndTimeAndType?STCD={STCD}&start={start}&end={end}&type={type}',
        method: 'get'
    }
}
