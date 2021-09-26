<template>
  <!-- <q-card>
    <q-card-actions class="q-gutter-md row items-start"> -->
      <div class="q-gutter-md row items-start">
        <q-input standout="bg-brown-10 text-white" v-model="cont.key" @input="input" @blur="dele_this" label="key" :dense="true" style="width:35%" input-style="color:orange"/>
        <q-input standout="bg-brown-10 text-white" v-model="cont.val" @input="input" @blur="dele_this" label="val" :dense="true" style="width:45%" input-style="color:orange"/>
        <q-btn flat style="color: #FF0080;width:8%" label="Del" @click="del"/>
      </div>
    <!-- </q-card-actions>
  </q-card> -->
</template>

<script>
export default {
  props: {
    cont: {
      type: Object
      // key: '',
      // val: ''
    },
    index: {
      type: Number
    }
  },
  data () {
    return {
    }
  },
  methods: {
    dele_this () {
      if (
        (this.cont.key === '' || this.cont.key === null || this.cont.key === undefined) &&
        (this.cont.val === '' || this.cont.val === null || this.cont.val === undefined)) {
        this.$emit('isnull', this.index)
      }
    },
    input () {
      this.$emit('notnull', this.index)
      // if(String(this.cont.mg_num).match(RegExp('^MG[0-9]{7}$')) !== null){
      //   this.$emit('ajaxsearchsroject', this.index);
      // }
    },
    del () {
      this.$emit('isnull', this.index)
    }
  }
}
</script>

<style>

</style>
