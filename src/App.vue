<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import config from "@/script/config.js";

export default {
  name: "App",
  components: {},
  created() {
    // console.log("app created", this.$store);
    config["$STORE"] = this.$store;
    config["$App"] = this;
  }
};
</script> 

<style>
#app {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
}
</style>
