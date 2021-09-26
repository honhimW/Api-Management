<template>
  <div id="layout" style="height: 92%">
    <div id="sidebar">
      <h4 id="cata">Contents</h4>
      <div class="markdown-body editormd-preview-container" id="custom-toc-container"></div>
    </div>

    <div id="doc-editormd-view"></div>
  </div>
</template>
<script>
// import '../../public/lib/editormd.js'
import { factory } from 'src/utils/editormd'
import marked from 'src/utils/marked.min.js'
import { prettyPrint } from 'src/utils/prettify.min.js'
import { flowChart } from 'src/utils/flowchart.min.js'
import { fact } from 'src/utils/jquery.flowchart.min.js'
import jQuery from 'jquery'
export default {
  props: {
    cont: {
      type: String
    }
  },
  data () {
    return {
      mdt: '# Hello'
    }
  },
  watch: {
    cont (txt) {
      this.refresh()
    }
  },
  methods: {
    refresh () {
      var hd = document.getElementById('doc-editormd-view')
      if (hd !== null && hd !== undefined) {
        hd.remove()
      }
      jQuery('#layout').append('<div id="doc-editormd-view"></div>')
      window.editormd.markdownToHTML(
        'doc-editormd-view', {
          markdown: this.cont,
          htmlDecode: 'style,script,iframe',
          toc: true,
          tocm: false,
          tocContainer: '#custom-toc-container',
          emoji: true,
          taskList: true,
          tex: true,
          flowChart: true,
          sequenceDiagram: false,
          theme: 'light'
        })
    }
  },
  mounted () {
    window.jQuery = jQuery
    window.marked = marked
    window.prettyPrint = prettyPrint
    window.flowChart = flowChart
    fact(jQuery, flowChart)
    window.editormd = factory()
    this.refresh()
  }
}
</script>
<style>
@import '../css/style.css';
  #layout {
    padding: 10px;
  }

  #layout > header, .btns {
    width: auto;
  }

  #sidebar {
    width: 30%;
    height: 92%;
    position: fixed;
    top: 5%;
    left: 0;
    overflow: hidden;
    background: #fff;
    z-index: 100;
    padding: 18px;
    border: 1px solid #ddd;
    border-top: none;
    border-bottom: none;
    background: top;
  }

  #sidebar:hover {
    overflow: auto;
  }

  #sidebar h4 {
    font-size: 24px;
    text-align: center;
    font-weight: bold;
    color: black;
  }

  #custom-toc-container {
    padding-left: 0;
  }

  #doc-editormd-view {
    padding-left: 33%;
    padding-right: 0;
    margin: 0;
    height: 100%;
  }
</style>
