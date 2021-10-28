<template>
  <q-page class="flex justify-center items-start">
    <div class="q-mt-lg" style="width: 94%">
      <q-card>
        <q-card-actions class="q-pa-none" style="height: 55px">
          <q-select
            class="q-mb-none"
            style="width: 13%;height: 100%;font-size: large"
            standout
            v-model="sendMethod"
            :options="options"
            label="Method"
          />
          <q-input
            v-model="url"
            standout="bg-teal text-white"
            class="q-mb-none"
            label="http://ip:port/api"
            style="width: 60%;height: 100%;font-size: large"
            v-on:keyup.enter="sendRequest()"
          />
          <q-btn
            :color="sendButColor"
            glossy
            :label="sendButLabel"
            class="q-mb-none"
            style="width: 11%;height: 100%;font-size: large"
            @click="sendRequest()"
          >
            <q-tooltip
              content-class="bg-purple"
              content-style="font-size: 16px"
              :offset="[10, 10]"
              transition-show="rotate"
              transition-hide="rotate"
            >
              Send Request
            </q-tooltip>
          </q-btn>
          <q-btn
            :color="changed ? 'pink-3' : 'teal'"
            glossy
            label="SAVE"
            class="q-mb-none"
            style="width: 15%;height: 100%;font-size: large"
            @click="saveRequest()"
          >
            <q-tooltip
              content-class="bg-purple"
              content-style="font-size: 16px"
              :offset="[10, 10]"
              transition-show="rotate"
              transition-hide="rotate"
            >
              Save Request
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <q-card class="q-gutter-md row items-start" style="width:94%;margin:5px">
      <q-card-actions class="q-pa-md" :style="headStyle">
        <request-header style="width:100%" v-for="(item, index) of headers" :cont="item" :key="index" :index="index" @isnull="isnull" @notnull="notnull"/>
        <q-tooltip
            content-class="transparency"
            content-style="font-size: 12px"
            anchor="top middle"
            self="top middle"
            :offset="[10, 35]"
            transition-show="rotate"
            transition-hide="rotate"
          >
          Request Headers
        </q-tooltip>
      </q-card-actions>
      <q-card class="q-pa-md" style="width: 50%;margin:1px">
        <request-body :jsonBody="reqBody"/>
      </q-card>
    </q-card>
    <q-card class="q-gutter-md row items-start" style="width:94%;margin:5px">
      <q-card class="q-pa-md" style="width: 48%;margin:1px">
        <pre-script :code="javaScriptCode"/>
      </q-card>
      <q-card class="q-pa-md" style="width: 50%;margin:1px">
        <respond-body :jsonBody="respBody"/>
      </q-card>
    </q-card>
    <q-dialog v-model="confirmSaveDL" transition-show="scale" transition-hide="scale" @keyup.enter="saveNload">
      <q-card class="bg-teal text-white" style="width: 500px">
        <q-card-section>
          <div class="text-h6">Do you wanna save changes ?</div>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat color="negative" label="Discard" @click="reset" v-close-popup/>
          <q-btn flat label="Save" @click="saveNload" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { debounce } from 'quasar'
import requestBody from 'src/components/requestBody.vue'
import requestHeader from 'src/components/requestHeader.vue'
import { send } from 'src/utils/ajaxSend'
import { interRun, editHeader } from 'src/utils/interpreter'
import PreScript from 'src/components/preScript.vue'
import RespondBody from 'src/components/respondBody.vue'
import { map2Json, obj2Array } from 'src/utils/convert'
import { Opt } from 'src/utils/opt'
import { deepClone } from 'src/utils/deepClone'
import Randexp from 'randexp'
export default {
  components: { requestBody, requestHeader, PreScript, RespondBody },
  name: 'PageIndex',
  data () {
    return {
      projectName: '',
      groupName: '',
      requestName: '',
      uuid: '',
      url: '',
      sendMethod: 'POST',
      options: ['POST', 'GET', 'PUT', 'DELETE'],
      envObj: {},
      textareaShadowText: 'Json Body',
      reqBody: {
        code: '{\r\n  "key": "val"\r\n}'
      },
      respBody: {
        code: ''
      },
      javaScriptCode: {
        code: ''
      },
      headers: [
        {
          key: '',
          val: ''
        }
      ],
      protocol: 'http://',
      envProp: new Map(),
      params: '',
      changed: false,
      savedReq: {},
      newReq: {},
      confirmSaveDL: false,
      sending: false,
      sendButLabel: 'SEND',
      sendButColor: 'amber',
      cancelerHolder: {},
      headStyle: 'width: 48%;margin:2px;align-content: baseline;overflow-y: scroll'
    }
  },
  mounted () {
    this.headStyle = 'width: 48%;margin:2px;align-content: baseline;overflow-y: scroll;height: ' + ((window.innerHeight - 150) * 0.44).toFixed() + 'px'
  },
  methods: {
    sendRequest () {
      if (this.sending === true) {
        this.cancelerHolder.cancel()
        this.sendButLabel = 'SEND'
        this.sendButColor = 'amber'
        return
      }
      this.sending = true
      this.sendButLabel = 'ABORT'
      this.sendButColor = 'deep-orange-12'
      var reqHeader = new Map()
      this.headers.forEach(item => {
        if (item.key !== '') {
          reqHeader.set(item.key, this.replace(item.val))
        }
      })
      try {
        var globalProp = {}
        globalProp.envProp = this.envProp
        globalProp.headers = reqHeader
        var finalJsonBody = ''
        if (this.reqBody.code !== '' && this.reqBody.code !== undefined) {
          finalJsonBody = JSON.stringify(JSON.parse(this.reqBody.code))
        }
        globalProp.body = finalJsonBody
        globalProp = this.userCodeEditHeader(this.javaScriptCode.code, globalProp)
        reqHeader = globalProp.headers
        finalJsonBody = globalProp.body
        var header = map2Json(reqHeader)
      } catch (error) {
        var message = error.message === undefined ? error : error.message
        this.$q.notify({
          type: 'negative',
          message: 'Run Pre-script Error: ' + message,
          position: 'top',
          timeout: 2000
        })
        this.sending = false
        this.sendButLabel = 'SEND'
        this.sendButColor = 'amber'
        return
      }
      if (this.url === '') {
        this.$q.notify({
          type: 'negative',
          message: 'URI is empty',
          position: 'top',
          timeout: 1500
        })
        this.sending = false
        this.sendButLabel = 'SEND'
        this.sendButColor = 'amber'
        return
      }
      this.respBody = {
        code: ''
      }
      var replaceUrl = this.replace(this.url)
      if (!replaceUrl.startsWith('http://') && !replaceUrl.startsWith('https://')) {
        replaceUrl = this.protocol + replaceUrl
      }
      var start = Date.now()
      var sender = send(replaceUrl, this.sendMethod, header, finalJsonBody)
      this.cancelerHolder = sender.cancelerHolder
      sender.request.then(resp => {
        var finish = Date.now()
        var httpDetail = {
          url: resp.config.url,
          method: resp.config.method.toUpperCase(),
          headers: resp.config.headers,
          data: resp.config.data
        }
        console.log(httpDetail)
        if (resp.status === 200) {
          this.respBody = {
            code: JSON.stringify(resp.data, null, 2)
          }
        } else {
          this.respBody = {
            code: resp.statusText
          }
        }
        this.$q.notify({
          type: 'positive',
          message: resp.status + ', ' + (finish - start) + 'ms',
          position: 'bottom-right',
          timeout: 3000
        })
      }).catch(error => {
        var finish = Date.now()
        if (window.axios.isCancel(error)) {
          this.$q.notify({
            type: 'warning',
            message: 'Aborted, ' + (finish - start) + 'ms',
            position: 'bottom-right',
            timeout: 3000
          })
        } else {
          var resp = error.response
          var httpDetail = {
            url: error.config.url,
            method: error.config.method.toUpperCase(),
            headers: error.config.headers,
            data: error.config.data,
            response: resp
          }
          console.log(httpDetail)
          if (resp !== undefined) {
            this.respBody = {
              code: JSON.stringify({
                status: error.response.status,
                message: error.message,
                data: error.response.data
              }, null, 2)
            }
            this.$q.notify({
              type: error.response.status.toString().startsWith('4') ? 'warning' : 'negative',
              message: error.response.status + ', ' + (finish - start) + 'ms',
              position: 'bottom-right',
              timeout: 3000
            })
          } else {
            this.respBody = {
              code: JSON.stringify({
                message: error.message,
                reason: 'Failed to load response data',
                tips: '浏览框输入链接检查是否可达, 该错误可能的原因: 地址错误、浏览器安全...',
                url: error.config.url
              }, null, 2)
            }
            this.$q.notify({
              type: 'negative',
              message: error.message + ', ' + (finish - start) + 'ms',
              position: 'bottom-right',
              timeout: 3000
            })
          }
        }
      }).finally(() => {
        this.sending = false
        this.sendButLabel = 'SEND'
        this.sendButColor = 'amber'
      })
    },
    saveRequest () {
      Opt.saveRequest(this.requestName, this.groupName, this.projectName, this.uuid, {
        method: this.sendMethod,
        url: this.url,
        requestBody: this.reqBody.code,
        header: this.prop2Obj(this.headers),
        preScript: this.javaScriptCode.code
      })
      this.refreshSaved()
    },
    prop2Obj (prop) {
      var obj = {}
      prop.forEach(p => {
        if (p.key !== undefined && p.key !== '') {
          obj[p.key] = p.val
        }
      })
      return obj
    },
    userCodeRun (input, globalProp) {
      return interRun(input, globalProp)
    },
    userCodeEditHeader (input, globalProp) {
      return editHeader(input, globalProp)
    },
    reset () {
      this.confirmSaveDL = false
      this.changed = false
      this.openRequestCallback(this.newReq.req, this.newReq.projectName, this.newReq.groupName, this.newReq.requestName, this.newReq.uuid)
    },
    saveNload () {
      this.confirmSaveDL = false
      this.saveRequest()
      this.openRequestCallback(this.newReq.req, this.newReq.projectName, this.newReq.groupName, this.newReq.requestName, this.newReq.uuid)
    },
    openRequestCallback (req, projectName, groupName, requestName, uuid) {
      if (uuid === this.uuid) {
        this.projectName = projectName
        this.groupName = groupName
        this.requestName = requestName
        return
      }
      if (this.changed) {
        this.confirmSaveDL = true
        this.newReq = {
          req,
          projectName,
          groupName,
          requestName,
          uuid
        }
        return
      } else {
        this.newReq = {}
      }
      if (req !== undefined) {
        this.url = req.url
        this.sendMethod = this.options.includes(req.method) ? req.method : 'POST'
        this.headers = obj2Array(req.header)
        this.reqBody = (req.requestBody === undefined || req.requestBody === null) ? {
          code: '{\r\n  "key": "val"\r\n}'
        } : {
          code: req.requestBody
        }
        this.javaScriptCode = (req.preScript === undefined || req.preScript === null) ? {
          code: ''
        } : {
          code: req.preScript
        }
        this.projectName = projectName
        this.groupName = groupName
        this.requestName = requestName
        this.uuid = uuid
        this.refreshSaved()
      }
    },
    refreshSaved () {
      this.savedReq = {
        url: deepClone(this.url),
        sendMethod: deepClone(this.sendMethod),
        headers: JSON.stringify(this.headers),
        reqBody: deepClone(this.reqBody),
        javaScriptCode: deepClone(this.javaScriptCode)
      }
      this.changed = false
    },
    syncEnvCallback (envMap) {
      this.envProp = envMap
    },
    notnull (index) {
      if (index === this.headers.length - 1) {
        this.headers.push({ key: '', val: '' })
      }
      this.checkChange()
    },
    isnull (index) {
      if (this.headers.length > 1) {
        if (index !== this.headers.length - 1) {
          this.headers.splice(index, 1)
        }
      }
      this.checkChange()
    },
    replace (str) {
      var reg = /\${"[\w]+"}/g
      return str.replace(reg, match => {
        var s = match.substring(3, match.length - 2)
        var p = this.envProp.get(s)
        return p === undefined ? '' : p
      })
    },
    checkChange () {
      this.changed = !(this.savedReq.url === this.url &&
      this.savedReq.sendMethod === this.sendMethod &&
      this.savedReq.reqBody.code === this.reqBody.code &&
      this.savedReq.javaScriptCode.code === this.javaScriptCode.code &&
      this.savedReq.headers === JSON.stringify(this.headers)
      )
    }
  },
  watch: {
    url (val) {
      this.checkChange()
    },
    sendMethod (val) {
      this.checkChange()
    }
  },
  created () {
    this.sendRequest = debounce(this.sendRequest, 200)
    this.$root.$on('openRequest', this.openRequestCallback)
    this.$root.$on('synCEnv', this.syncEnvCallback)
    this.$root.$on('checkChange', this.checkChange)
    window.Randexp = Randexp
  }
}
</script>
<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 700px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 100%

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: #fff !important

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #fff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0
</style>
