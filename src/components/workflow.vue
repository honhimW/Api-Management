<template>
  <q-card class="bg-teal text-white">
    <q-bar>
      <q-card-section>
        <div class="text-h6">Workflow</div>
      </q-card-section>
      <q-space />
      <q-btn dense flat icon="close" v-close-popup>
        <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
      </q-btn>
    </q-bar>

    <q-card-section class="q-pt-none" style="height: 100%">
      <q-splitter
        v-model="splitterModel0"
        style="height: 100%"
      >
        <template v-slot:before>
          <q-input ref="filter" filled v-model="filter" label="Filter" style="width: 100%">
            <template v-slot:append>
              <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
            </template>
          </q-input>
          <div class="q-pa-md">
            <q-tree
              :nodes="customize"
              node-key="uuid"
              :filter="filter"
              default-expand-all
            >
              <template  v-slot:default-header="prop">
                <div class="row items-center">
                  <div style="margin-right: 5px; font-size:10px">{{ prop.node.label }}</div>
                </div>
                <q-btn push v-if="prop.node.header === 'request'" flat icon-right="add" color="pink-5" @click="add2WF(prop.node)" />
              </template>
            </q-tree>
          </div>
        </template>
        <template v-slot:after>
          <q-splitter
            v-model="splitterModel1"
            style="height: 100%"
          >

            <template v-slot:before>
              <div class="q-pa-md">
                <q-tree
                  :nodes="workflows"
                  node-key="uuid"
                  selected-color="dark"
                  :selected.sync="selectedWF"
                  default-expand-all
                >
                  <template  v-slot:default-header="prop">
                    <q-btn push flat icon-right="remove" style="margin-right: 5px" color="orange-5" @click="removeWorkflow(prop.node)" />
                    <div class="row items-center">
                      <div style="font-size:10px">{{ prop.node.label }}</div>
                    </div>
                  </template>
                </q-tree>
              </div>
              <q-btn color="white" icon="add" @click="openwfdl" push flat style="width: 100%"/>
              <q-dialog v-model="wfdl" transition-show="scale" transition-hide="scale" @keyup.enter="confirmCWF">
                <q-card class="bg-teal text-white" style="width: 500px">
                  <q-card-section class="q-pt-none">
                    <q-input label="Name" v-model="newWFName"></q-input>
                  </q-card-section>
                  <q-card-actions align="right" class="bg-white text-teal">
                    <q-btn flat label="Confirm" @click="confirmCWF" v-close-popup/>
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </template>
            <template v-slot:after>
              <q-splitter
                v-model="splitterModel2"
                style="height: 100%"
              >
                <template v-slot:before>
                  <div class="q-pa-md">
                    <q-tree
                      :nodes="requests"
                      node-key="uuid"
                      selected-color="dark"
                      :selected.sync="selectedREQ"
                      default-expand-all
                    >
                      <template  v-slot:default-header="prop">
                        <q-btn push flat icon-right="remove" style="margin-right: 5px" color="orange-5" @click="removeREQ(prop.node)" />
                        <div class="row items-center">
                          <div style="font-size:10px">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                  <q-btn color="pink-10" icon="play_arrow" @click="runWorkflow" push flat style="width: 100%"/>
                  <q-dialog v-model="resultdl" full-width>
                    <q-card class="bg-teal text-white" style="width: 100%">
                      <q-card-section class="q-pt-none" style="width: 100%;max-height: 80vh" >
                        <q-input readonly type="textarea" label="Result" v-model="result" style="width: 100%" input-style="min-height:300px;max-height:600px"></q-input>
                      </q-card-section>
                      <q-card-actions align="right" class="bg-white text-teal">
                        <q-btn flat label="Download" @click="download" v-close-popup/>
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </template>
                <template v-slot:after style="height: 100%">
                  <q-tab-panels
                    v-model="selectedREQ"
                    animated
                    transition-prev="jump-down"
                    transition-next="jump-up"
                    class="text-white bg-teal"
                    style="height: 100%"
                  >
                    <q-tab-panel v-for="(item, index) of requests" :key="index" :name="item.uuid">
                      <div class="text-h4 q-mb-md">{{item.label}}</div>
                      <p class="text-h5 q-mb-md">URL:</p>
                      <q-input readonly :value="replace(item.url)" class="text-h6 q-mb-md" style="width:100%"></q-input>
                      <p class="text-h5 q-mb-md">Method:</p>
                      <q-input readonly :value="item.method" class="text-h6 q-mb-md" style="width:100%"></q-input>
                      <p class="text-h5 q-mb-md">Headers:</p>
                      <template v-if="item.headers !== null">
                        <template v-for="(head, idx) of runScript(item)">
                          <q-input v-if="head.key !== ''" :key="idx" readonly :value="head.key + ' = ' + head.val" class="text-h6 q-mb-md" style="width:100%"></q-input>
                        </template>
                      </template>
                      <p class="text-h5 q-mb-md">Requestbody:</p>
                      <q-input readonly :value="item.body" type="textarea" class="text-h6 q-mb-md" style="width:100%"></q-input>
                    </q-tab-panel>
                  </q-tab-panels>
                </template>
              </q-splitter>
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </q-card-section>
  </q-card>
</template>

<script>
import { getAllInfo, getRequest } from 'src/utils/opt'
import { map2Json, obj2Array, map2Array } from 'src/utils/convert'
import { Wf } from 'src/utils/workflow'
import { editHeader } from 'src/utils/interpreter'
// import { post, httpDetail } from 'src/utils/ajaxSend'
import { post } from 'src/utils/ajaxSend'
import { exportFile } from 'quasar'
export default {
  props: {
    env: {
      type: Map
    }
  },
  data () {
    return {
      result: '',
      resultdl: false,
      newWFName: '',
      wfdl: false,
      filter: '',
      customize: [],
      splitterModel0: 20,
      splitterModel1: 25,
      splitterModel2: 35,
      selected: '',
      selectedWF: '',
      selectedREQ: '',
      workflows: [],
      requests: [],
      request: {},
      nodeMap: new Map(),
      workflowMap: new Map()
    }
  },
  methods: {
    dateFormat (fmt, date) {
      let ret
      const opt = {
        'Y+': date.getFullYear().toString(),
        'm+': (date.getMonth() + 1).toString(),
        'd+': date.getDate().toString(),
        'H+': date.getHours().toString(),
        'M+': date.getMinutes().toString(),
        'S+': date.getSeconds().toString()
      }
      for (var k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
        }
      }
      return fmt
    },
    download () {
      var finded = this.workflows.find(wf => {
        return wf.uuid === this.selectedWF
      })
      exportFile(finded.label + '_' + this.dateFormat('YYYYmmddHHMMSS', new Date()), this.result)
    },
    runWorkflow () {
      var results = []
      var isContinue = true
      this.requests.forEach(req => {
        if (!isContinue) {
          return
        }
        var reqHeader = new Map()
        var result = {}
        req.headers.forEach(item => {
          if (item.key !== '') {
            reqHeader.set(item.key, this.replace(item.val))
          }
        })
        try {
          var globalProp = {}
          globalProp.envProp = this.env
          globalProp.headers = reqHeader
          globalProp.body = JSON.stringify(JSON.parse(req.body))
          globalProp = this.userCodeEditHeader(req.preScript, globalProp)
          reqHeader = globalProp.headers
          var header = map2Json(reqHeader)
        } catch (error) {
          result.warning = error.message
          isContinue = false
          return
        }
        if (req.url === '') {
          result.warning = 'URI is empty'
          isContinue = false
          return
        }
        var replaceUrl = this.replace(req.url)
        if (!replaceUrl.startsWith('http://') && !replaceUrl.startsWith('https://')) {
          replaceUrl = 'http://' + replaceUrl
        }
        // httpDetail(replaceUrl, req.method, header, JSON.stringify(JSON.parse(req.body))).then(resp => {
        //   if (resp.status === 200) {
        //     result.http = resp.data.body
        //     var body = result.http.body
        //     if (body !== undefined || body !== null) {
        //       try {
        //         body = JSON.parse(body)
        //         result.http.body = body
        //       } catch (error) {
        //       }
        //     }
        //     post(replaceUrl, req.method, header, JSON.stringify(JSON.parse(req.body))).then(resp => {
        //       if (resp.status === 200) {
        //         result.result = resp.data
        //       }
        //       results.push(result)
        //       this.result = JSON.stringify(results, null, 4)
        //     })
        //   }
        // })
        post(replaceUrl, req.method, header, JSON.stringify(JSON.parse(req.body))).then(resp => {
          if (resp.status === 200) {
            result.result = resp.data
          }
          results.push(result)
          this.result = JSON.stringify(results, null, 4)
        })
      })
      this.resultdl = true
    },
    removeWorkflow (node) {
      Wf.removeWorkflow(node.uuid).then(resp => {
        if (resp.status === 200) {
          this.refreshWorkFlow()
        }
      })
    },
    openwfdl () {
      this.wfdl = true
    },
    confirmCWF () {
      Wf.addWorkflow(this.newWFName).then(resp => {
        if (resp.status === 200) {
          this.refreshWorkFlow()
        }
        this.newWFName = ''
      })
      this.wfdl = false
    },
    runScript (req) {
      var reqHeader = new Map()
      req.headers.forEach(item => {
        if (item.key !== '') {
          reqHeader.set(item.key, this.replace(item.val))
        }
      })
      try {
        var globalProp = {}
        globalProp.envProp = this.env
        globalProp.headers = reqHeader
        globalProp.body = req.body
        if (req.preScript === null || req.preScript === undefined) {
          return req.headers
        }
        globalProp = this.userCodeEditHeader(req.preScript, globalProp)
        reqHeader = globalProp.headers
        return map2Array(reqHeader)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Error: ' + error.message,
          position: 'top',
          timeout: 2000
        })
      }
    },
    userCodeEditHeader (input, globalProp) {
      return editHeader(input, globalProp)
    },
    add2WF (node) {
      var req = this.nodeMap.get(node.uuid)
      Wf.addRequest(req.label, req.group, req.project, req.uuid, this.selectedWF).then(resp => {
        this.workflowMap.set(resp.data.body.uuid, resp.data.body.requestList)
        this.refreshReqList(resp.data.body.uuid)
      })
    },
    removeREQ (node) {
      var requestList = this.workflowMap.get(this.selectedWF)
      var oidx = requestList.findIndex(req => {
        return req.uuid === node.uuid
      })
      Wf.removeRequest(node.label, this.selectedWF, oidx).then(resp => {
        this.workflowMap.set(resp.data.body.uuid, resp.data.body.requestList)
        this.refreshReqList(resp.data.body.uuid)
      })
    },
    resetFilter () {
      this.filter = ''
      this.$refs.filter.focus()
    },
    toCus (projectL) {
      var map = new Map()
      this.customize = []
      projectL.forEach(project => {
        var proj = {
          label: project.name,
          header: 'project',
          story: project.desc,
          uuid: project.uuid,
          children: []
        }
        project.groupList.forEach(group => {
          var gro = {
            label: group.name,
            header: 'group',
            story: group.desc,
            uuid: group.uuid,
            project: project.name,
            children: []
          }
          group.requestList.forEach(request => {
            var req = {
              label: request.name,
              project: project.name,
              group: group.name,
              header: 'request',
              story: request.desc,
              uuid: request.uuid
            }
            gro.children.push(req)
            map.set(request.uuid, req)
          })
          proj.children.push(gro)
        })
        project.requestList.forEach(request => {
          var req = {
            label: request.name,
            project: project.name,
            header: 'request',
            story: request.desc,
            uuid: request.uuid
          }
          proj.children.push(req)
          map.set(request.uuid, req)
        })
        this.customize.push(proj)
      })
      this.nodeMap = map
    },
    refreshTree () {
      getAllInfo().then(resp => {
        this.toCus(resp.data.projectList)
      })
    },
    refreshWorkFlow () {
      Wf.getWorkflow().then(resp => {
        this.workflows = []
        this.workflowMap = new Map()
        resp.data.workflowList.forEach(wf => {
          this.workflows.push({
            uuid: wf.uuid,
            label: wf.name,
            desc: wf.desc,
            requestList: wf.requestList
          })
          this.workflowMap.set(wf.uuid, wf.requestList)
        })
      })
    },
    refreshReqList (uuid) {
      var requestList = this.workflowMap.get(uuid)
      if (requestList !== undefined) {
        this.requests = []
        requestList.forEach(request => {
          this.requests.push({
            label: request.name,
            uuid: request.uuid,
            url: request.url,
            method: request.method,
            headers: obj2Array(request.header),
            body: request.requestBody,
            preScript: request.preScript
          })
        })
      }
    },
    replace (str) {
      if (str === null || str === undefined) {
        return
      }
      var reg = /\${"[\w]+"}/g
      return str.replace(reg, match => {
        var s = match.substring(3, match.length - 2)
        var p = this.env.get(s)
        return p === undefined ? '' : p
      })
    },
    getReq () {
      getRequest()
    }
  },
  watch: {
    selectedWF (uuid) {
      this.refreshReqList(uuid)
    }
  },
  created () {
    this.refreshTree()
    this.refreshWorkFlow()
  }
}
</script>

<style>

</style>
