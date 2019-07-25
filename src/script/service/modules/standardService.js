// 组织体系
export default {
    GET_WORK_PLAN: {
        url: '/api/wpf/getWorkPlan?AD_CODE={AD_CODE}',
        method: 'get'
    },
    GET_RULE_MSG: {
        url: '/ynwater2/organization/rule?adCode={AD_CODE}&types={RULE_TYPE}',
        method: 'get'
    },
    GET_PLAN_COUNTRY: {
        url: '/ynwater2/organization/workPlan?adCode={AD_CODE}&type={type}',
        method: 'get'
    }
}
