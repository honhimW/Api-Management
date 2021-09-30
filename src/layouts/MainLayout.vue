<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-pink-10">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Http Tool
          <!-- <q-btn
            round
            color="teal"
            icon="play_arrow"
            style="margin-left: 15px"
            @click="workflow"
          /> -->
          <q-btn
            round
            color="dark"
            icon="description"
            style="margin-left: 15px"
            @click="markdown"
          />
        </q-toolbar-title>
        <env></env>
        <div>
          <q-btn-toggle
            v-ripple
            v-model="isDark"
            spread
            no-caps
            toggle-color="orange"
            color="brown"
            text-color="black"
            :options="[
              {label: 'Dark', value: 'dark'},
              {label: 'Light', value: 'light'}
            ]"
            style="margin-right: 15px"
        />
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <div class="flex items-center row" style="justify-content: space-between">
          <q-item-label
            header
            class="text-pink-5 text-h5"
            style="font-family: fantasy"
          >
            Requests
          </q-item-label>
          <q-btn-dropdown
            flat
            dense
            :color="'pink-5'"
            dropdown-icon="add"
          >
            <q-list>
              <q-item v-for="(item, index) of createProjectOpt" :key="index" clickable v-close-popup @click="createProject(item)">
                <q-item-section>
                  <q-item-label style="font-size:4px">{{item}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-dialog v-model="pndl" transition-show="scale" transition-hide="scale" @keyup.enter="confirmCP">
            <q-card class="bg-teal text-white" style="width: 500px">
              <q-card-section>
                <div class="text-h6">{{createType}}</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input label="Name" v-model="projectName"></q-input>
                <q-input label="Desc" v-model="projectDesc"></q-input>
                <q-input v-if="createType === 'Import Project(Swagger)'" label="Url" v-model="importUrl"></q-input>
                <q-input
                  v-model="defaultScript"
                  filled
                  type="textarea"
                  label="Default Script"
                />
              </q-card-section>
              <q-card-actions align="right" class="bg-white text-teal">
                <q-btn flat label="Confirm" @click="confirmCP" v-close-popup/>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
        <q-input ref="filter" filled v-model="filter" label="Filter">
          <template v-slot:append>
            <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
          </template>
        </q-input>
        <q-tree
          :nodes="customize"
          node-key="uuid"
          :filter="filter"
          selected-color="pink"
          text-color="primary"
          :selected.sync="selected"
          :default-expand-all="true"
        >
          <template v-slot:default-header="prop">
            <div class="row items-center">
              <q-icon :name="prop.node.icon || 'school'" color="orange" size="16px" class="q-mr-sm" />
              <div class="text-weight-bold" style="margin-right: 10px; font-size:10px">{{ prop.node.label }}</div>
              <q-btn-dropdown
                color="primary"
                flat
                dense
                dropdown-icon="menu"
              >
                <q-list>
                  <q-item v-for="(item, index) of getOpt(prop.node.header)" :key="index" clickable v-close-popup @click="selectNodeOtp(prop.node, item)">
                    <q-item-section>
                      <q-item-label style="font-size:4px; width: 100px">{{item}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </template>

          <template v-slot:default-body="prop">
            <div v-if="prop.node.story" class="text-orange-5" style="font-size:4px">
              {{ prop.node.story }}
            </div>
            <span v-else class="text-brown-5" style="font-size:4px">no desc.</span>
          </template>
        </q-tree>
      </q-list>
    </q-drawer>
    <q-dialog v-model="persistent" transition-show="scale" transition-hide="scale" @keyup.enter="check">
      <q-card class="bg-teal text-white" style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{opt}}</div>
        </q-card-section>
        <q-card-section class="q-pt-none" v-if="opt.startsWith('Remove')">
          <span>
            Confirm remove {{currentNode.header}}
          </span>
          <span class="text-weight-bold text-red-5">
             [ {{currentNode.label}} ].
          </span>
        </q-card-section>
        <q-card-section v-else class="q-pt-none">
          <q-input label="Name" v-model="dlName">
          </q-input>
          <q-input label="Desc" v-model="dlDesc">
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Confirm" @click="check" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="mdDL" transition-show="scale" transition-hide="scale" @keyup.enter="openMd">
      <q-card class="bg-teal text-white" style="width: 500px">
        <q-card-section>
          <div class="text-h6">Swagger api-doc Url</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input label="Url" v-model="mdUrl"></q-input>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Download" @click="downloadMd" v-close-popup/>
          <q-btn flat label="Open" @click="openMd" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- <q-dialog
      v-model="showWF"
      persistent
      :maximized="true"
      transition-show="slide-up"
      transition-hide="slide-down"
    > -->
      <!-- <workflow :env="envProp" /> -->
    <!-- </q-dialog> -->
    <q-dialog
      v-model="showMD"
      persistent
      :maximized="true"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="my-card" id="mdcard">
        <q-bar>
          <q-card-section>
            <div class="text-h6">Markdown</div>
          </q-card-section>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <!-- <iframe id="mdIframe" :src="mdUrl" frameborder="0" width="100%" height="92%" sandbox="allow-scripts allow-same-origin"></iframe> -->
        <mdview :cont="markdownTxt"></mdview>
        <!-- <div width="500px" height="500px">
          <div id="vdmd"></div>
        </div> -->
      </q-card>
    </q-dialog>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { debounce, exportFile } from 'quasar'
import { Opt, getAllInfo, getRequest } from 'src/utils/opt'
import env from 'src/components/env.vue'
import axios from 'axios'
import Workflow from 'src/components/workflow.vue'
import mdview from 'src/components/markdown.vue'
import { toMd } from 'src/utils/trans'
export default {
  components: { env, Workflow, mdview },
  name: 'MainLayout',
  mounted () {
    window.routes = this.$data
    var theme = window.localStorage.getItem('defaultTheme')
    if (theme !== 'dark') {
      theme = 'light'
    }
    this.isDark = theme
    this.toCus(getAllInfo().projectList)
  },
  data () {
    return {
      mdsrc: '/httpproxy/md/index',
      createProjectOpt: [
        'New Project',
        'Import Project(Swagger)'
      ],
      pndl: false,
      showMD: false,
      mdDL: false,
      mdString: '',
      createType: '',
      projectName: '',
      projectDesc: '',
      importUrl: '',
      defaultScript: 'function run_before_send(argument) {\n  // body...\n  setHeader("Content-Type", "application/json")\n}\nrun_before_send()',
      mdUrl: '',
      ai: {},
      selected: '',
      projectList: [],
      leftDrawerOpen: true,
      isDark: 'light',
      filter: '',
      customize: [],
      currentNode: {},
      selectNode: {},
      opt: '',
      dlName: '',
      dlDesc: '',
      persistent: false,
      nodeMap: {},
      prjoectOption: [
        'Add Group',
        'Add Request',
        'Edit',
        'Copy Project',
        'Remove Project'
      ],
      groupOption: [
        'Add Request',
        'Edit',
        'Copy Group',
        'Remove Group'
      ],
      requestOption: [
        'Edit',
        'Copy Request',
        'Remove Request'
      ],
      showWF: false,
      envProp: new Map(),
      markdownTxt: 'Blank',
      vditor: {}
    }
  },
  created () {
    this.closeWindow = debounce(this.closeWindow, 700)
    this.$root.$on('synCEnv', this.syncEnvCallback)
    window.exportFile = exportFile
  },
  methods: {
    syncEnvCallback (envMap) {
      this.envProp = envMap
    },
    confirmCP () {
      var promis
      switch (this.createType) {
        case 'New Project':
          promis = Opt.createProject(this.projectName, this.projectDesc, this.defaultScript)
          break
        case 'Import Project(Swagger)':
          promis = Opt.importFormattedModel(this.projectName, this.projectDesc, this.importUrl, this.defaultScript)
          break
      }
      promis.then(resp => {
        if (resp === 'succeed') {
          this.refreshTree()
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Create failed.., Reason: ' + resp,
            position: 'top',
            timeout: 1500
          })
        }
      })
      this.pndl = false
    },
    downloadMd () {
      axios.get(this.mdUrl).then(resp => {
        var mdtxt = toMd(resp.data)
        var idx = mdtxt.indexOf('\n')
        idx = idx > 17 ? 17 : idx
        var filename
        if (idx <= 2) {
          filename = 'auto-API.md'
        } else {
          filename = mdtxt.substring(2, idx) + '.md'
        }
        exportFile(filename, mdtxt)
      })
    },
    openMd () {
      this.mdDL = false
      this.showMD = true
      // this.mdsrc = '/httpproxy/md/index?api=' + btoa(this.mdUrl)
      axios.get(this.mdUrl).then(resp => {
        this.markdownTxt = toMd(resp.data)
      })
    },
    createProject (item) {
      this.pndl = true
      this.createType = item
    },
    nameProjcet (node, opt) {
      this.currentNode = node
      this.opt = opt
      this.persistent = true
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
    init () {
      this.ai = getAllInfo()
      this.projectList = this.ai.projectList
      this.customize = this.toCus(this.projectList)
    },
    getOpt (type) {
      switch (type) {
        case 'project':
          return this.prjoectOption
        case 'group':
          return this.groupOption
        default:
          return this.requestOption
      }
    },
    selectNodeOtp (node, opt) {
      this.currentNode = node
      this.opt = opt
      this.persistent = true
      if (opt === 'Edit') {
        this.dlName = node.label
        this.dlDesc = node.story
      } else if (opt.startsWith('Copy')) {
        this.dlName = 'Copy of ' + node.label
        this.dlDesc = node.story
      }
    },
    check () {
      var name = this.currentNode.label
      var type = this.currentNode.header
      var project = this.currentNode.project
      var group = this.currentNode.group
      var opt = this.opt
      var promis
      if (opt.startsWith('Remove')) {
        switch (type) {
          case 'project':
            promis = Opt.removeProject(name)
            break
          case 'group':
            promis = Opt.removeGroup(name, project)
            break
          default:
            if (group === undefined) {
              promis = Opt.removeRequestOnProjcet(name, project)
            } else {
              promis = Opt.removeRequestOnGroup(name, project, group)
            }
            break
        }
        promis.then(resp => {
          if (resp === 'failed') {
            this.$q.notify({
              type: 'negative',
              message: 'Remove failed..',
              position: 'top',
              timeout: 1500
            })
          } else {
            this.$q.notify({
              type: 'positive',
              message: 'Success',
              position: 'top',
              timeout: 1500
            })
          }
          this.refreshTree()
        })
      } else {
        switch (type) {
          case 'project':
            switch (opt) {
              case 'Add Group':
                promis = Opt.createGroup(this.dlName, this.dlDesc, name)
                break
              case 'Add Request':
                promis = Opt.createRequestOnProjcet(this.dlName, this.dlDesc, name)
                break
              case 'Edit':
                promis = Opt.editProject(this.dlName, this.dlDesc, name)
                break
              case 'Copy Project':
                promis = Opt.copyProject(this.dlName, this.dlDesc, name)
                break
            }
            break
          case 'group':
            switch (opt) {
              case 'Add Request':
                promis = Opt.createRequestOnGroup(this.dlName, this.dlDesc, project, name)
                break
              case 'Edit':
                promis = Opt.editGroup(this.dlName, this.dlDesc, project, name)
                break
              case 'Copy Group':
                promis = Opt.copyGroup(this.dlName, this.dlDesc, project, name)
                break
            }
            break
          default:
            switch (opt) {
              case 'Edit':
                promis = Opt.editRequest(this.dlName, this.dlDesc, project, group, name)
                break
              case 'Copy Request':
                promis = Opt.copyRequest(this.dlName, this.dlDesc, project, group, name)
                break
            }
            break
        }
        promis.then(resp => {
          if (resp === 'failed') {
            this.$q.notify({
              type: 'negative',
              message: 'Operate failed.., Reason: ' + resp,
              position: 'top',
              timeout: 1500
            })
          } else {
            this.$q.notify({
              type: 'positive',
              message: 'Success',
              position: 'top',
              timeout: 1500
            })
            this.dlName = ''
            this.dlDesc = ''
          }
          this.refreshTree()
        })
      }
      this.persistent = false
    },
    refreshTree () {
      this.toCus(getAllInfo().projectList)
      this.selectedChange(this.selected)
    },
    selectedChange (val) {
      var reqNode = this.nodeMap.get(val)
      if (reqNode === undefined || reqNode === null) {
      } else {
        var request = getRequest(reqNode.project, reqNode.group, reqNode.label, reqNode.uuid)
        if (request !== undefined) {
          this.$root.$emit('openRequest', request, reqNode.project, reqNode.group, reqNode.label, reqNode.uuid)
        }
      }
    },
    workflow () {
      this.showWF = true
    },
    markdown () {
      this.mdDL = true
    }
  },
  watch: {
    isDark: function (val) {
      const flag = (val === 'dark')
      this.$q.dark.set(flag)
      window.aceEditor.forEach(element => {
        element.setTheme(flag ? 'ace/theme/chaos' : 'ace/theme/tomorrow')
      })
    },
    selected: function (val) {
      this.selectedChange(val)
    },
    showWF (val) {
      if (val === true) {
        this.$root.$emit('openWorkflow')
      }
    }
  }
}
</script>
