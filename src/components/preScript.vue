<template>
  <div>
    <q-card>
      <q-card-actions class="q-pa-none" style="width:100%;height: 300px">
        <code-ace :value="code" :readOnly="false" :mode="'javascript'" style="width:100%"></code-ace>
        <q-tooltip
              content-class="transparency"
              content-style="font-size: 12px"
              anchor="top middle"
              self="top middle"
              :offset="[10, 35]"
              transition-show="rotate"
              transition-hide="rotate"
            >
            Pre-Request Script
          </q-tooltip>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import CodeAce from './codeAce.vue'
export default {
  components: { CodeAce },
  props: {
    code: {
      type: Object
    }
  },
  data () {
    return {
      // javaScriptCode: ''
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style></style>
