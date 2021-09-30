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
    var theme = window.localStorage.getItem('defaultTheme')
    if (theme === undefined || theme === null || theme !== 'dark') {
      this.$q.dark.set(false)
    } else {
      this.$q.dark.set(true)
      window.aceEditor.forEach(element => {
        element.setTheme('ace/theme/chaos')
      })
    }
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
