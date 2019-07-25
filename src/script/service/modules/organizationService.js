// 组织体系
export default {
    GET_CHIEF_PAGE: {
        url: '/ynwater2/organization/getAdData?adCode={AD_CODE}',//根据行政区划编码查询下级行政区划列表
        method: 'get'
    },
    GET_INFO_BOX_PAGE: {
        url: '/ynwater2/organization/gmList?adCode={AD_CODE}&pageNum={pageNum}', //根据行政区划编码获取河长分页信息
        method: 'get'
    },
    GET_CHIEF_TREE_PAGE: {
        url: '/ynwater2/static/jsons/area/yunnan.json',
        method: 'get'
    },
    GET_INFO_BOX_BUILD: {
        url: '/ynwater2/organization/officeBuld?adCode={AD_CODE}', //根据行政区划获取河长办信息
        method: 'get'
    }
}
