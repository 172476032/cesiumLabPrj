export default{
    GET_MEDIA_BY_GUID: {
        url: '/ynwater2/media/download?guid={obj}',
        method: 'get'
    },
    DEL_MEDIA_BY_GUID: {
        url: '/ynwater2/media/delete/{guid}',
        method: 'delete'
    }
}