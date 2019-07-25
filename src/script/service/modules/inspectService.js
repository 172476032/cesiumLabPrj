// 巡河管理
export default {
    // 获取一河一档总条数
    GET_INSPECT_PLAN_PAGE: {
        url: '/static/jsons/inspect/inspectPlan.json',
        method: 'get'
    },
    GET_INSPECT_LOG_PAGE: {
        url: '/static/jsons/inspect/inspectlog.json',
        method: 'get'
    },
    // 事件管理中事件列表信息
    GET_EVENT_EVENTLIST_PAGE: {
        url: '/static/jsons/event/eventlist.json',
        method: 'get'
    },
    // 一河一档 许可取水量 年取水量 年用水量 统计信息
    GET_YHYD_WATER_INFO: {
        url: '/static/jsons/yhyd/water.json',
        method: 'get'
    }


}
