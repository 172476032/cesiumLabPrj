// 从信息中心数据库发出的接口移至此处 接口前缀    waterministry
export default {
    // 根据行政编码获取河段
    GET_REA_BY_ADCODE: {
        url: '/waterministry/listAttReaBase/{adCode}',
        method: 'get'
    },
    // 根据行政编码获取胡片
    GET_LKS_BY_ADCODE: {
        url: '/waterministry/listAttLksBase/{adCode}',
        method: 'get'
    },
    // 根据行政编码获取库片
    GET_RER_BY_ADCODE: {
        url: '/waterministry/listAttRerBase/{adCode}',
        method: 'get'
    },
    // 根据行政编码获取河长信息
    // GET_GM_BY_ADCODE: {
    //     url: '/waterministry/listAttGmBase/{adCode}',
    //     method: 'get'
    // },
    // GET_GMOF_BY_ADCODE: {
    //     url: '/waterministry/listAttOfficeBuld/{adCode}',
    //     method: 'get'
    // },
    // 根据河长名称获取河长信息及管辖的河段
    // GET_GM_BY_NAME: {
    //     url: '/waterministry/listAttGmBaseByName/{gmName}',
    //     method: 'get'
    // },
    // 根据河流名称获取河流列表
    // GET_RL_BY_RVNAME: {
    //     url: '/waterministry/listAttRvBaseByRvName/{rvName}',
    //     method: 'get'
    // },
    // 根据adCode获取本级的河段
    GET_LVLRV_BY_ADCODE: {
        url: '/waterministry/listAttReaBase/level/{adCode}',
        method: 'get'
    },
    // 根据adCode获取上级的河段
    GET_SUBRV_BY_ADCODE: {
        url: '/waterministry/listAttReaBase/uplevel/{adCode}',
        method: 'get'
    },
    // 根据河流编码（数组）获取河流集
    // GET_RVS_BY_ID: {
    //     url: '/waterministry/ATT_RV_BASE/rvCodes',
    //     method: 'post'
    // },
    // 根据adCode获取行政编码信息
    GET_ATT_AD_BASE: {
        url: '/waterministry/ATT_AD_BASE/{adCode}',
        method: 'get'
    },
    // 获取下级河段
    GET_CHILDREN_REA: {
        url: '/waterministry/ATT_REA_BASE/lower/{reaCode}',
        method: 'get'
    },
    // 获取下级行政区
    // GET_CHILDREN_AD: {
    //     url: '/waterministry/lowerAdcode/{adCode}',
    //     method: 'get'
    // },
    // 用reaCode获取一河一策一河一档信息
    // GET_INFO_BY_REACODE: {
    //     url: '/SSM/StrategyDocument/{reaCode}',
    //     method: 'get'
    // },
    // 用reaCode获取河段信息
    // GET_REAINFO_BY_CODE: {
    //     url: '/waterministry/ATT_REA_BASE/{reaCode}',
    //     method: 'get'
    // },
    // 模糊搜索
    // GET_INFO_BY_CODE: {
    //     url: '/waterministry/LakeRiverRes/{name}',
    //     method: 'get'
    // }
}
