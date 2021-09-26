<template>
  <div class="flex justify-center items-center">
    <q-btn
      round
      color="info"
      icon="edit"
      style="margin-right: 15px"
      @click="edit"
    />
    <q-dialog v-model="fixed" @keyup.enter="modify" @keyup.esc="repeal" persistent style="max-height: 60vh">
      <q-card>
        <q-card-section class="text-teal row">
          <q-select
            class="q-mb-none"
            style="width: 400px;height: 70px"
            standout
            v-model="currentEnv"
            :options="env"
            label="Environment"
            :color="'info'"
            :borderless="true"
            stack-label
          >
            <template v-slot:selected-item="scope">
              <q-chip
                dense
                text-color="orange-13"
                class="q-ma-none"
                style="font-size: x-large"
              >
                <q-input :value="scope.opt" input-style="width: 350px;height:10px;color:darkgoldenrod;font-size: x-large" :dense="true" readonly :borderless="true"/>
              </q-chip>
            </template>
          </q-select>
          <q-btn-dropdown
            color="teal"
            flat
            dense
            dropdown-icon="menu"
          >
            <q-list>
              <q-item v-for="(item, index) of options" :key="index" @click="optEnv(item.name)" clickable v-close-popup>
                <q-item-section avatar>
                  <q-avatar :icon="item.icon"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label style="font-size:4px">{{item.name}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 50vh" class="scroll">
          <request-header v-for="(item, index) of currentEnvProps" :cont="item" :key="index" :index="index" @isnull="isnull" @notnull="notnull"/>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-input v-if="!revisable" v-model="msg" :dense="true" readonly :borderless="true" input-style="color:red" style="width: 300px;height:100%"/>
          <q-btn id="repealbtn" flat label="Repeal" color="warning" @click="repeal"/>
          <q-btn id="modifybtn" flat label="Modify" color="secondary" @click="modify" :disable="!revisable"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="innerdl" @keyup.enter="confirm" @keyup.esc="cancel" persistent style="max-height: 60vh">
      <q-card>
        <q-card-section class="text-teal row">
          <q-input v-model="opt" :dense="true" readonly :borderless="true" id="envName" class="text-h5" input-class="text-teal" input-style="width:300px"></q-input>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 50vh" class="scroll">
          <q-input v-if="opt !== 'Remove'" v-model="newName" @input="checkName(newName)" :dense="true" :borderless="true" style="width: 98%;height:100%" @show="focus(this)"/>
          <q-input v-else :value="'Confirm remove env [ ' + currentEnv + ' ].'" :dense="true" readonly :borderless="true" class="text-h6" input-style="color:teal" style="width: 400px;height:100%"/>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-input v-model="envNameMsg" :dense="true" readonly :borderless="true" input-style="color:red" style="width: 300px;height:100%"/>
          <q-btn flat label="Cancel" color="warning" @click="cancel"/>
          <q-btn flat label="Confirm" color="secondary" @click="confirm" :disable="!comfirmable"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-btn
      round
      :color="eyeColor"
      :icon="visibility"
      style="margin-right: 15px"
      @mouseleave="visibilityOff"
      @mouseenter="visibilityOn"
      @click="onClick"
    >
      <q-popup-proxy v-model="showProxy">
        <q-banner v-if="currentEnvProps.length > 1">
          <div v-for="(item, index) of currentEnvProps" :key="index" style="max-width: 60vh">
            <div class="my-card flex justify-left items-center" v-if="item.key !== ''" style="height: 45px">
                <q-input  v-model="item.key" :dense="true" readonly :borderless="true" input-style="color:orange" style="width: 150px;height:100%"/>
                <span>&thinsp;&thinsp;=&thinsp;&thinsp;</span>
                <q-input  v-model="item.val" :dense="true" readonly :borderless="true" input-style="color:orange" style="width: 300px;height:100%"/>
            </div>
          </div>
        </q-banner>
        <q-banner v-else>
          <div class="my-card flex justify-left items-center" style="height: 45px">
            <q-input value="当前环境未配置参数" :dense="true" readonly :borderless="true" input-style="color:orange" style="width: 150px;height:100%"/>
          </div>
        </q-banner>
      </q-popup-proxy>
    </q-btn>
    <q-select
      class="q-mb-none"
      style="width: 350px;height: 50px;font-size: x-small"
      standout
      v-model="currentEnv"
      :options="env"
      label="Environment"
      :color="'orange'"
      :dark="true"
      :borderless="true"
    />
  </div>
</template>

<script>
import requestHeader from 'src/components/requestHeader.vue'
import { deepClone } from 'src/utils/deepClone'
import { save, updateEnv, getAllInfo } from 'src/utils/opt'
import { obj2Array } from 'src/utils/convert'
export default {
  components: { requestHeader },
  mounted () {
    this.split()
    this.syncEnv()
  },
  data () {
    return {
      msg: '',
      envNameMsg: '',
      newName: '',
      currentEnv: '',
      env: [],
      envMap: new Map(),
      visibility: 'visibility_off',
      currentEnvProps: [
        {
          key: '',
          val: ''
        }
      ],
      backup: [],
      eyeColor: 'dark',
      showProxy: false,
      isClick: false,
      fixed: false,
      innerdl: false,
      revisable: true,
      comfirmable: true,
      dupKeySet: {},
      opt: '',
      options: [
        {
          name: 'Rename',
          icon: 'edit'
        },
        {
          name: 'New Env',
          icon: 'add'
        },
        {
          name: 'Remove',
          icon: 'delete'
        },
        {
          name: 'Clone',
          icon: 'content_copy'
        }
      ]
    }
  },
  methods: {
    focus (ele) {
      console.log(ele)
    },
    visibilityOn () {
      this.visibility = 'visibility'
      this.eyeColor = 'secondary'
      this.showProxy = true
    },
    visibilityOff () {
      this.visibility = 'visibility_off'
      this.eyeColor = 'dark'
      if (!this.isClick) {
        this.showProxy = false
      }
      this.isClick = false
    },
    onClick () {
      this.showProxy = !this.showProxy
      if (!this.showProxy) {
        this.isClick = true
      } else {
        this.isClick = false
      }
    },
    notnull (index) {
      if (index === this.currentEnvProps.length - 1) {
        this.currentEnvProps.push({ key: '', val: '' })
      }
      this.checkDup()
    },
    isnull (index) {
      if (this.currentEnvProps.length > 1) {
        if (index !== this.currentEnvProps.length - 1) {
          this.currentEnvProps.splice(index, 1)
        }
      }
      this.checkDup()
    },
    checkDup () {
      var set = new Set()
      var dupSet = new Set()
      this.currentEnvProps.forEach(prop => {
        if (prop.key !== '') {
          if (!set.has(prop.key)) {
            set.add(prop.key)
          } else {
            dupSet.add(prop.key)
          }
        }
      })
      if (dupSet.size > 0) {
        this.revisable = false
        this.msg = '[ ' + Array.from(dupSet).join(', ') + ' ] is already defined.'
      } else {
        this.revisable = true
        this.msg = ''
      }
    },
    modify () {
      if (this.revisable) {
        this.fixed = false
        if (this.currentEnv !== '' && this.currentEnv !== 'temp env (unsave)') {
          updateEnv(0, {
            name: this.currentEnv,
            prop: this.prop2Obj(this.currentEnvProps),
            uuid: this.envMap.get(this.currentEnv).uuid
          })
          save()
          this.split()
        }
      }
      this.syncEnv()
    },
    repeal () {
      this.fixed = false
      this.currentEnvProps = this.backup
      this.revisable = false
      this.msg = ''
    },
    split () {
      var nameList = []
      var envMap = new Map()
      var config = getAllInfo()
      config.envList.forEach(env => {
        nameList.push(env.name)
        envMap.set(env.name, env)
      })
      this.env = nameList.sort()
      this.envMap = envMap
      if (!this.env.includes(this.currentEnv)) {
        this.currentEnv = 'temp env (unsave)'
        this.currentEnvProps = [
          {
            key: '',
            val: ''
          }
        ]
      } else {
        this.currentEnvProps = obj2Array(envMap.get(this.currentEnv).prop)
      }
    },
    edit () {
      this.backup = deepClone(this.currentEnvProps)
      this.fixed = true
    },
    optEnv (opt) {
      this.innerdl = true
      this.opt = opt
      this.fixed = false
      switch (opt) {
        case 'Rename':
          this.newName = this.currentEnv
          break
        case 'New Env':
          break
        case 'Remove':
          this.comfirmable = true
          break
        case 'Clone':
          this.newName = 'Copy of ' + this.currentEnv
          this.comfirmable = true
          break
      }
    },
    checkName (name) {
      if (this.env.includes(name)) {
        this.envNameMsg = 'Env name is already defined'
        this.comfirmable = false
      } else {
        this.envNameMsg = ''
        this.comfirmable = true
      }
    },
    cancel () {
      this.innerdl = false
      this.opt = ''
      this.newName = ''
      this.fixed = true
    },
    confirm () {
      if (!this.comfirmable) {
        return
      }
      var promis
      switch (this.opt) {
        case 'Rename':
          this.innerdl = false
          promis = updateEnv(0, {
            name: this.newName,
            prop: this.prop2Obj(this.currentEnvProps),
            uuid: this.envMap.get(this.currentEnv).uuid
          })
          break
        case 'New Env':
          this.innerdl = false
          promis = updateEnv(1, {
            name: this.newName
          })
          break
        case 'Remove':
          this.innerdl = false
          updateEnv(2, {
            name: this.currentEnv,
            uuid: this.envMap.get(this.currentEnv).uuid
          }).finally(() => {
            this.split()
            this.currentEnv = 'temp env (unsave)'
            this.opt = ''
            this.comfirmable = false
            this.fixed = true
          })
          break
        case 'Clone':
          this.innerdl = false
          promis = updateEnv(1, {
            name: this.newName,
            prop: this.prop2Obj(this.currentEnvProps)
          })
          break
      }
      if (promis !== undefined) {
        promis.finally(() => {
          this.split()
          this.currentEnv = this.newName
          this.opt = ''
          this.newName = ''
          this.fixed = true
        })
      }
    },
    prop2Map (prop) {
      var map = new Map()
      prop.forEach(p => {
        map.set(p.key, p.val)
      })
      map.delete('')
      return map
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
    syncEnv () {
      this.$root.$emit('synCEnv', this.prop2Map(this.currentEnvProps))
    }
  },
  watch: {
    currentEnv (val) {
      if (val !== '' && val !== 'temp env (unsave)') {
        var env = this.envMap.get(val)
        if (env !== undefined) {
          var prop = env.prop
          if (prop !== undefined) {
            this.currentEnvProps = obj2Array(prop)
          } else {
            this.currentEnvProps = [
              {
                key: '',
                val: ''
              }
            ]
          }
        } else {
          this.currentEnvProps = [
            {
              key: '',
              val: ''
            }
          ]
        }
      }
      this.syncEnv()
    },
    newName (val) {
      if (val === '') {
        this.comfirmable = false
      }
    }
  }
}
</script>

<style>

</style>
