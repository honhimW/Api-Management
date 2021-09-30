import axios from 'axios'
import { deepClone } from './deepClone'
import { trans, buildExample } from './trans'

export const save = () => {
  if (window.configStorage !== undefined) {
    window.localStorage.setItem('config', JSON.stringify(window.configStorage))
  }
}

export const saveRequest = (requestName, groupName, projectName, uuid, request) => {
  var oldRequest = getRequest(projectName, groupName, requestName, uuid)
  if (oldRequest !== undefined) {
    oldRequest.method = request.method
    oldRequest.url = request.url
    oldRequest.requestBody = request.requestBody
    oldRequest.header = request.header
    oldRequest.preScript = request.preScript
    save()
  }
}

export const getRequest = (projectName, groupName, requestName, uuid) => {
  var project, group, request, config
  config = window.configStorage
  for (let i = 0; i < config.projectList.length; i++) {
    project = config.projectList[i]
    if (project.name === projectName && isNotEmpty(project.groupList)) {
      if (isBlank(groupName)) {
        if (isNotEmpty(project.requestList)) {
          for (let k = 0; k < project.requestList.length; k++) {
            request = project.requestList[k]
            if (request.name === requestName && request.uuid === uuid) {
              return request
            }
          }
        }
      } else if (isNotEmpty(project.groupList)) {
        for (let j = 0; j < project.groupList.length; j++) {
          group = project.groupList[j]
          if (group.name === groupName && isNotEmpty(group.requestList)) {
            for (let k = 0; k < group.requestList.length; k++) {
              request = group.requestList[k]
              if (request.name === requestName && request.uuid === uuid) {
                return request
              }
            }
          }
        }
      }
    }
  }
  return undefined
}

export const getAllInfo = () => {
  if (window.configStorage !== undefined) {
    return window.configStorage
  }
  var configStorage = window.localStorage.getItem('config')
  if (configStorage === undefined || configStorage === null) {
    configStorage = {
      projectList: [{
        name: 'New Project',
        desc: '',
        uuid: getUUID(),
        groupList: [
          {
            name: 'New Group',
            uuid: getUUID(),
            requestList: [
              {
                name: 'New Request',
                uuid: getUUID()
              }
            ]
          }
        ],
        requestList: [
          {
            name: 'New Request',
            uuid: getUUID()
          }
        ]
      }],
      envList: [{
        name: 'New Env',
        prop: {},
        uuid: getUUID()
      }]
    }
    window.localStorage.setItem('config', JSON.stringify(configStorage))
    window.configStorage = configStorage
  } else {
    window.configStorage = JSON.parse(configStorage)
  }
  return window.configStorage
}

const isNotEmpty = (arr) => {
  return arr !== undefined && arr.length > 0
}

const defaultIfBlank = (str, def) => {
  return isBlank(str) ? def : str
}

const isBlank = (str) => {
  if (str !== undefined && str.length !== 0) {
    for (let i = 0; i < str.length; i++) {
      if (str.charAt(i) !== ' ') {
        return false
      }
    }
  }
  return true
}

export const createProject = (name, desc) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === name) {
      promise = new Promise((resolve, reject) => {
        resolve('The project name cannot be duplicated!')
      })
      return promise
    }
  }
  project = {
    name,
    desc,
    uuid: getUUID(),
    groupList: [
      {
        name: 'New Group',
        uuid: getUUID(),
        requestList: [
          {
            name: 'New Request',
            uuid: getUUID()
          }
        ]
      }
    ],
    requestList: [
      {
        name: 'New Request',
        uuid: getUUID()
      }
    ]
  }
  window.configStorage.projectList.push(project)
  promise = new Promise((resolve, reject) => {
    resolve('succeed')
  })
  save()
  return promise
}

export const createGroup = (name, desc, projectName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.groupList.length; j++) {
        var group = project.groupList[j]
        if (group.name === name) {
          promise = new Promise((resolve, reject) => {
            resolve('The group name cannot be duplicated!')
          })
          return promise
        }
      }
      group = {
        name,
        desc,
        uuid: getUUID(),
        requestList: [
          {
            name: 'New Request',
            uuid: getUUID()
          }
        ]
      }
      project.groupList.push(group)
      promise = new Promise((resolve, reject) => {
        resolve('succeed')
      })
      save()
      return promise
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const createRequestOnProjcet = (name, desc, projectName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.requestList.length; j++) {
        var req = project.requestList[j]
        if (req.name === name) {
          promise = new Promise((resolve, reject) => {
            resolve('The request name cannot be duplicated!')
          })
          return promise
        }
      }
      var request = {
        name,
        desc,
        uuid: getUUID()
      }
      project.requestList.push(request)
      promise = new Promise((resolve, reject) => {
        resolve(request)
      })
      save()
      return promise
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('Project not exist!')
  })
  return promise
}

export const createRequestOnGroup = (name, desc, projectName, groupName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.groupList.length; j++) {
        var group = project.groupList[j]
        if (group.name === groupName) {
          for (let k = 0; k < group.requestList.length; k++) {
            var req = group.requestList[j]
            if (req.name === name) {
              promise = new Promise((resolve, reject) => {
                resolve('The request name cannot be duplicated!')
              })
              return promise
            }
          }
          var request = {
            name,
            desc,
            uuid: getUUID()
          }
          group.requestList.push(request)
          promise = new Promise((resolve, reject) => {
            resolve(request)
          })
          save()
          return promise
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('Project Or Group not exist!')
  })
  return promise
}

export const removeProject = (name) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === name) {
      projectList.splice(i, 1)
      promise = new Promise((resolve, reject) => {
        resolve('succeed')
      })
      save()
      return promise
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const removeGroup = (name, projectName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.groupList.length; j++) {
        var group = project.groupList[j]
        if (group.name === name) {
          project.groupList.splice(j, 1)
          promise = new Promise((resolve, reject) => {
            resolve('succeed')
          })
          save()
          return promise
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const removeRequestOnProjcet = (name, projectName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.requestList.length; j++) {
        var req = project.requestList[j]
        if (req.name === name) {
          project.requestList.splice(j, 1)
          promise = new Promise((resolve, reject) => {
            resolve('succeed')
          })
          save()
          return promise
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const removeRequestOnGroup = (name, projectName, groupName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.groupList.length; j++) {
        var group = project.groupList[j]
        if (group.name === groupName) {
          for (let k = 0; k < group.requestList.length; k++) {
            var req = group.requestList[k]
            if (req.name === name) {
              group.requestList.splice(k, 1)
              promise = new Promise((resolve, reject) => {
                resolve('succeed')
              })
              save()
              return promise
            }
          }
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const editProject = (newName, newDesc, projectName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      project.name = newName
      project.desc = newDesc
      promise = new Promise((resolve, reject) => {
        resolve('succeed')
      })
      save()
      return promise
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const editGroup = (newName, newDesc, projectName, groupName) => {
  var promise
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.groupList.length; j++) {
        var group = project.groupList[j]
        if (group.name === groupName) {
          group.name = newName
          group.desc = newDesc
          promise = new Promise((resolve, reject) => {
            resolve('succeed')
          })
          save()
          return promise
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const editRequest = (newName, newDesc, projectName, groupName, requestName) => {
  var promise
  var projectList = window.configStorage.projectList
  var req
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      if (!isBlank(groupName)) {
        for (let j = 0; j < project.groupList.length; j++) {
          var group = project.groupList[j]
          if (group.name === groupName) {
            for (let k = 0; k < group.requestList.length; k++) {
              req = group.requestList[k]
              if (req.name === requestName) {
                req.name = newName
                req.desc = newDesc
                promise = new Promise((resolve, reject) => {
                  resolve('succeed')
                })
                save()
                return promise
              }
            }
          }
        }
      } else {
        for (let k = 0; k < project.requestList.length; k++) {
          req = project.requestList[k]
          if (req.name === requestName) {
            req.name = newName
            req.desc = newDesc
            promise = new Promise((resolve, reject) => {
              resolve('succeed')
            })
            save()
            return promise
          }
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const copyProject = (newName, newDesc, projectName) => {
  var promise
  var projectList = window.configStorage.projectList
  var group, req
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      var newProject = deepClone(project)
      newProject.name = newName
      newProject.desc = newDesc
      newProject.uuid = getUUID()
      for (let j = 0; j < newProject.groupList.length; j++) {
        group = newProject.groupList[j]
        group.uuid = getUUID()
        for (let k = 0; k < group.requestList.length; k++) {
          req = group.requestList[k]
          req.uuid = getUUID()
        }
      }
      for (let k = 0; k < newProject.requestList.length; k++) {
        req = newProject.requestList[k]
        req.uuid = getUUID()
      }
      projectList.splice(i + 1, 0, newProject)
      promise = new Promise((resolve, reject) => {
        resolve('succeed')
      })
      return promise
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const copyGroup = (newName, newDesc, projectName, groupName) => {
  var promise
  var projectList = window.configStorage.projectList
  var group, req
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      for (let j = 0; j < project.groupList.length; j++) {
        group = project.groupList[j]
        if (group.name === groupName) {
          var newGroup = deepClone(group)
          newGroup.name = newName
          newGroup.desc = newDesc
          newGroup.uuid = getUUID()
          for (let k = 0; k < newGroup.requestList.length; k++) {
            req = newGroup.requestList[k]
            req.uuid = getUUID()
          }
          project.groupList.splice(j + 1, 0, newGroup)
          promise = new Promise((resolve, reject) => {
            resolve('succeed')
          })
          save()
          return promise
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const copyRequest = (newName, newDesc, projectName, groupName, requestName) => {
  var promise
  var projectList = window.configStorage.projectList
  var group, req
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === projectName) {
      if (!isBlank(groupName)) {
        for (let j = 0; j < project.groupList.length; j++) {
          group = project.groupList[j]
          if (group.name === groupName) {
            for (let k = 0; k < group.requestList.length; k++) {
              req = group.requestList[k]
              if (req.name === requestName) {
                var newRequest = deepClone(req)
                newRequest.name = newName
                newRequest.desc = newDesc
                newRequest.uuid = getUUID()
                group.requestList.splice(k + 1, 0, newRequest)
                promise = new Promise((resolve, reject) => {
                  resolve('succeed')
                })
                save()
                return promise
              }
            }
          }
        }
      } else {
        for (let k = 0; k < project.requestList.length; k++) {
          req = project.requestList[k]
          if (req.name === requestName) {
            newRequest = deepClone(req)
            newRequest.name = newName
            newRequest.desc = newDesc
            newRequest.uuid = getUUID()
            project.requestList.splice(k + 1, 0, newRequest)
            promise = new Promise((resolve, reject) => {
              resolve('succeed')
            })
            save()
            return promise
          }
        }
      }
    }
  }
  promise = new Promise((resolve, reject) => {
    resolve('failed')
  })
  return promise
}

export const updateEnv = (type, env) => {
  var promise
  var envList = window.configStorage.envList
  var e
  switch (type) {
    case 0: // 编辑
      for (let i = 0; i < envList.length; i++) {
        e = envList[i]
        if (e.uuid === env.uuid) {
          e.name = env.name
          e.prop = env.prop
          promise = new Promise((resolve, reject) => {
            resolve('succeed')
          })
          save()
          return promise
        }
      }
      promise = new Promise((resolve, reject) => {
        resolve('failed')
      })
      return promise
    case 1: // 新增
      for (let i = 0; i < envList.length; i++) {
        e = envList[i]
        if (e.name === env.name) {
          promise = new Promise((resolve, reject) => {
            resolve('failed')
          })
          return promise
        }
      }
      e = {
        name: defaultIfBlank(env.name, 'New Env'),
        uuid: getUUID()
      }
      if (env.prop !== undefined) {
        e.prop = env.prop
      } else {
        e.prop = {}
      }
      envList.push(e)
      promise = new Promise((resolve, reject) => {
        resolve('succeed')
      })
      save()
      return promise
    case 2: // 删除
      for (let i = 0; i < envList.length; i++) {
        e = envList[i]
        if (e.uuid === env.uuid) {
          envList.splice(i, 1)
        }
      }
      promise = new Promise((resolve, reject) => {
        resolve('failed')
      })
      return promise
    default:
      promise = new Promise((resolve, reject) => {
        resolve('failed')
      })
      return promise
  }
}

export const importFormattedModel = (name, desc, url) => {
  var model
  var projectList = window.configStorage.projectList
  for (let i = 0; i < projectList.length; i++) {
    var project = projectList[i]
    if (project.name === name) {
      var pro = new Promise((resolve, reject) => {
        resolve('The project name cannot be duplicated!')
      })
      return pro
    }
  }
  return axios.get(url).then(resp => {
    try {
      model = trans(resp.data)
      var controllerMap = model.tableMap
      var project = {
        name,
        desc,
        uuid: getUUID(),
        groupList: [],
        requestList: []
      }
      Object.keys(controllerMap).forEach(key => {
        var method = controllerMap[key]
        var group = {
          name: key,
          desc: '',
          uuid: getUUID(),
          requestList: []
        }
        method.forEach(table => {
          var request = {
            name: table.description,
            desc: '',
            uuid: getUUID(),
            requestBody: buildExample(table.requestParam),
            method: table.requestType,
            url: url.replace('/v2/api-docs', '') + table.url
          }
          group.requestList.push(request)
        })
        project.groupList.push(group)
      })
      window.configStorage.projectList.push(project)
      save()
      return 'succeed'
    } catch (error) {
      return 'failed'
    }
  })
}

export const getUUID = () => {
  return Math.random().toString(16).substring(2) + '-' + Math.random().toString(16).substring(2)
}

export const Opt = {
  save,
  saveRequest,
  getRequest,
  createProject,
  createGroup,
  createRequestOnProjcet,
  createRequestOnGroup,
  removeProject,
  removeGroup,
  removeRequestOnProjcet,
  removeRequestOnGroup,
  editProject,
  editGroup,
  editRequest,
  copyProject,
  copyGroup,
  copyRequest,
  updateEnv,
  importFormattedModel
}
