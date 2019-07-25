// web-rvlk-controller : 河段湖片查询(web端)
// http://10.6.172.161:8091/swagger-ui.html#/
export default {
    // 根据行政区划编码查询本级河段、湖片列表
    GET_RVLK_LIST_BY_ADCODE: {
        url: "/ynwater2/webRvlk/getRvlks/curLevel?adCode={adCode}&type={type}",
        method: 'get'
    },
    GET_UPLEVEL_RVLK_LIST_BY_ADCODE: {
        url: "/ynwater2/webRvlk/getRvlks/upLevel?adCode={adCode}&type={type}",
        method: 'get'
    }
    
}