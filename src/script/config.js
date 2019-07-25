/**
 * 存储全局变量
 * gll 2019-6-11
 */


const types = {
  MAP_VIEW: "MAP_VIEW",
  $STORE: "$STORE", //app.vue组件中vue实例
  $APP: "$APP", //app.vue组件中vue实例
};

const config = {
  [types.MAP_VIEW]: {
    center: [12577889.079342434, 3455460.975987284], // [103.91678460032786, 26.735038084423355], // 金沙江流域
    zoom: 9,
    minZoom: 1,
    maxZoom: 18,
    projection: "EPSG:3857",
  }
}

export default config;
