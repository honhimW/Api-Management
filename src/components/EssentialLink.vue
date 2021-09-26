<template>
  <!-- target="_blank" -->
  <q-item
    clickable
    tag="a"
    @click="spread"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ name }}</q-item-label>
      <q-item-label caption>
        {{ type }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { getRequest } from 'src/utils/opt'
export default {
  name: 'EssentialLink',
  props: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    parent: {
      type: Object
    }
  },
  data () {
    return {
      icon: 'school'
    }
  },
  methods: {
    spread () {
      if (this.type === 'request') {
        var request = this.name
        var group, project
        if (this.parent.type === 'group') {
          group = this.parent.name
          project = this.parent.parent.name
        } else {
          project = this.parent.name
        }
        getRequest(request, group, project)
      } else {
      }
    }
  }
}
</script>
