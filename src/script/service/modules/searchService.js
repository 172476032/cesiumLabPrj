export default {
    // 全文检索
    RVLK_FULL_SEARCH: {
        // url: "/ynwater/rvlkFullSearch/search?keyword={keyword}&pageNum={pageNum}&pageSize={pageSize}",
        url: '/ynwater2/rvlkFullSearch/search?keyword={keyword}&pageNum={pageNum}&pageSize={pageSize}&types={type}',
        method: 'get'
    },
    // 详情
    RVLK_DETAIL_SEARCH: {
        url: "/ynwater/rvlkFullSearch/code?code={code}&type={type}",
        method: 'get'
    },
    // 空间坐标查询
    RVLK_GEO_CRD: {
        url: '/ynwater2/rvlkFullSearch/geo/code?code={code}&type={type}',
        method: 'get'
    },
    //根据河长代码查询所辖河湖库列表
    RVLK_FULL_GM: {
        url: '/ynwater2/rvlkFullSearch/gm/rvlks?gmCode={gmCode}',
        method: 'get'
    },
    //根据行政区划编码查询所辖河湖库列表
    RVLK_FULL_AD: {
        url: '/ynwater2/rvlkFullSearch/ad/nextGmCount?adCode={adCode}',
        method: 'get'
    },
    //根据行政区划代码查询下级河湖库总数值
    RVLK_FULL_COUNT: {
        url: '/ynwater2/rvlkFullSearch/ad/nextRvlkCount?adCode={adCode}',
        method: 'get'
    },
    // 根据河湖库片编码获取河长信息
    GET_GMINFO_BY_RVLKCODE: {
        url: '/ynwater2/rvlkFullSearch/gm/rvlkCode?code={code}&type={type}',
        method: 'get'
    },
    // 根据编码获取缩略图
    GET_THUM_BY_CODE: {
        url: '/ynwater2/rvlkFullSearch/media/thum?code={code}&type={type}',
        method: 'get'
    },
    // 上传图片
    POST_IMG_BY_CODE: {
        url: '/ynwater2/rvlkFullSearch/media/upload',
        method: 'post'
    },
    //根据河流、湖泊、水库、河段、湖片、水库片代码查询下级河湖信息
    NEXT_RVLK_COUNT: {
        url: '/ynwater2/rvlkFullSearch/nextRvlk?code={code}&type={type}',
        method: 'get'
    }
}