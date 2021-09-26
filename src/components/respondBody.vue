<template>
  <div>
    <q-card>
      <q-card-actions class="q-pa-none" style="width:100%;height: 290px">
        <code-ace :value="jsonBody" :readOnly="true" :mode="'json'" style="width:100%"></code-ace>
        <q-tooltip
              content-class="transparency"
              content-style="font-size: 12px"
              anchor="top middle"
              self="top middle"
              :offset="[10, 35]"
              transition-show="rotate"
              transition-hide="rotate"
            >
            Responed Body
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
    jsonBody: {
      type: Object
    }
  },
  data () {
    return {
      // aceEditor: ace.edit(this.$refs.ace)
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style></style>
