<template>
  <div id="q-app" class="dark">
    <router-view />
  </div>
</template>
<script>
import Vue from 'vue'
import Vuex from 'vuex'
// import { throttle } from 'quasar'
Vue.use(Vuex)
export default {
  name: 'App',
  mounted () {
    this.$q.dark.set(false)
    window.document.onkeydown = this.route
  },
  methods: {
    route (e) {
      if (e === 0) {
        return
      }
      if (e.keyCode === 65 && e.altKey === true) {
        window.routes.leftDrawerOpen = !window.routes.leftDrawerOpen
      }
    }
  }
}
</script>
