<template>
  <div class="ace-container">
    <!-- 官方文档中使用 id，这里禁止使用，在后期打包后容易出现问题，使用 ref 或者 DOM 就行 -->
    <div class="ace-editor" ref="ace" style="width:100%;height:100%" @keyup="format" @="input"></div>
  </div>
</template>
<script>
// import { event } from 'quasar'
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-monokai' // 默认设置的主题
import 'ace-builds/src-noconflict/mode-javascript' // 默认设置的语言模式
import languageTools from 'ace-builds/src-noconflict/ext-language_tools'
// const { stopAndPrevent } = event
export default {
  name: 'CodeFormat',
  props: {
    value: {
      required: true
    },
    mode: {
      type: String
    },
    readOnly: {
      type: Boolean
    }
  },
  mounted () {
    let activeTheme
    if (this.$q.dark.isActive) {
      activeTheme = this.themePathDark
    } else {
      activeTheme = this.themePathLight
    }
    var height = window.innerHeight
    var fontSize = (height / 60).toFixed()
    this.fontSize = fontSize
    this.lines = ((height - 150) * 0.44 / fontSize).toString().split('.')[0]
    this.aceEditor = ace.edit(this.$refs.ace, {
      maxPixelHeight: 1000,
      maxLines: this.lines, // 最大行数，超过会自动出现滚动条
      minLines: this.lines, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
      fontSize: this.fontSize, // 编辑器内字体大小
      fontFamily: 'Lucida Console',
      theme: activeTheme, // 默认设置的主题
      mode: this.modePath, // 默认设置的语言模式
      tabSize: 2, // 制表符设置为 4 个空格大小
      navigateWithinSoftTabs: true,
      readOnly: this.readOnly,
      highlightActiveLine: true,
      displayIndentGuides: true,
      showGutter: true,
      enableAutoIndent: true,
      value: this.value.code,
      enableBasicAutocompletion: true,
      enableSnippets: true
    })
    var ae = this.aceEditor
    if (this.mode === 'javascript') {
      languageTools.addCompleter({
        getCompletions: function (editor, session, pos, prefix, callback) {
          if (prefix.length === 0) {
            callback(null, [])
            return
          }
          callback(null, [{
            name: '添加header',
            caption: 'setHeader(',
            snippet: 'setHeader("${1:key}", "${2:val}")',
            score: 1000,
            meta: 'custom'
          },
          {
            name: '获取请求体',
            caption: 'getBody()',
            snippet: 'getBody()',
            score: 1000,
            meta: 'custom'
          },
          {
            name: '设置请求体',
            caption: 'setBody(',
            snippet: 'setBody(${1:body})',
            score: 1000,
            meta: 'custom'
          },
          {
            name: '获取header',
            caption: 'getHeader(',
            snippet: 'getHeader(${1:key})',
            score: 1000,
            meta: 'custom'
          },
          {
            name: '获取环境变量',
            caption: 'getEnvProp()',
            snippet: 'getEnvProp(${1:key})',
            score: 1000,
            meta: 'custom'
          },
          {
            name: '格式化当前时间, 默认: YYYYmmddHHMMSS',
            caption: 'formatDate()',
            snippet: 'formatDate()',
            score: 200,
            meta: 'custom'
          },
          {
            name: '当前timestamp',
            caption: 'timestamp()',
            snippet: 'timestamp()',
            score: 200,
            meta: 'custom'
          },
          {
            name: '模拟数据, 传入正则表达式, 返回随机生成的字符串',
            caption: 'mockData(',
            snippet: 'mockData("${1:reg}")',
            score: 1000,
            meta: 'custom'
          },
          {
            name: 'rsa加密, 传入私钥',
            caption: 'rsawp(',
            snippet: 'rsawp("${1:toSign}", "${2:privateKey}")',
            score: 1000,
            meta: 'custom'
          }
          ])
        },
        getDocTooltip: function (item) {
          item.docHTML = [
            '<b>', item.caption, '</b>',
            '<hr></hr>', item.name, '<hr></hr>', item.snippet
          ].join('')
        }
      })
    }
    ae.on('change', function (e) {
      ae.execCommand('startAutocomplete')
    })
    if (window.aceEditor === undefined) {
      window.aceEditor = new Set()
    }
    window.aceEditor.add(this.aceEditor)
    window.onresize = () => {
      window.aceEditor.forEach(aceE => {
        var height = window.innerHeight
        var fs = (height / 60).toFixed()
        var fontSize = Number.parseInt(fs)
        var lines = ((height - 150) * 0.44 / fs).toString().split('.')[0]
        aceE.setOption('maxLines', lines)
        aceE.setOption('minLines', lines)
        aceE.setOption('fontSize', fontSize)
      })
    }
  },
  data () {
    return {
      // codeValue: this.value.code,
      aceEditor: null,
      clientHeight: `${window.innerHeight}`,
      fontSize: 0,
      lines: 0,
      themePathDark: 'ace/theme/chaos', // 不导入 webpack-resolver，该模块路径会报错
      themePathLight: 'ace/theme/tomorrow', // 不导入 webpack-resolver，该模块路径会报错
      modePath: 'ace/mode/' + this.mode // 同上 'ace/mode/html',
    }
  },
  methods: {
    format (e) {
      if (this.mode === 'json') {
        if (e === 0) {
          return
        }
        if (e.keyCode === 70 && e.altKey === true && e.ctrlKey === true) {
          if (this.value.code.length > 0) {
            try {
              var jsonBodyObj = JSON.parse(this.aceEditor.getValue())
              this.value.code = JSON.stringify(jsonBodyObj, null, 2)
            } catch (error) {
              return
            }
            this.aceEditor.setValue(this.value.code)
            // this.$emit('formatJson', this.value.code)
          }
        }
      }
      if (e === 0) {
        return
      }
      if (e.keyCode === 191 && e.altKey === true) {
        if (this.value.code.length > 0) {
          this.aceEditor.execCommand('startAutocomplete')
        }
      }
      this.value.code = this.aceEditor.getValue()
      this.$root.$emit('checkChange')
      // this.value.code = this.aceEditor.getValue()
    },
    input (e) {
      console.log(e)
      this.$root.$emit('checkChange', this.value.code)
    }
  },
  watch: {
    value (newVal) {
      this.aceEditor.setValue(newVal.code)
    }
  }
}
</script>
