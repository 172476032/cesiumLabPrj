import Vue from 'vue'
import Router from 'vue-router'
import cjmap from "@/components/cjMap/index.vue"
import appMain from "@/views/index.vue"

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'cjmap',
    component: appMain
  }, {
    path: '/appMain',
    name: 'appMain',
    component: appMain
  }, {
    path: '?code=62401300&objectId=54a4ad2f2b164cef8e48119de514d4c8&tableName=t_cjlysk&opt=edit&type=RR',
    name: 'cjmap',
    component: cjmap
  }, {
    path: '?code=61909900&longitude=113&latitude=32&tableName=t_cjlysk&type=RR&opt=view&objectName=三里坪水库&objectId=0cefe5137557431f9fa47228bd78bed6',
    name: 'cjmap',
    component: cjmap
  }]
})
