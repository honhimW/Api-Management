import { StringUtils } from 'src/utils/stringUtils'
import { Opt } from 'src/utils/opt'

export const save = () => {
  if (window.workflowStorage !== undefined) {
    window.localStorage.setItem('workflow', JSON.stringify(window.workflowStorage))
  }
}

export const getWorkflow = () => {
  if (window.workflowStorage !== undefined) {
    return window.workflowStorage
  }
  var workflowStorage = window.localStorage.getItem('workflow')
  if (workflowStorage === undefined || workflowStorage === null) {
    workflowStorage = {
      workflowList: [
        {
          name: 'New Workflow',
          desc: '',
          uuid: StringUtils.getUUID(),
          rUUIDList: []
        }
      ]
    }
    window.localStorage.setItem('workflow', JSON.stringify(workflowStorage))
    window.workflowStorage = workflowStorage
  } else {
    window.workflowStorage = JSON.parse(workflowStorage)
  }
  return window.workflowStorage
}

export const addWorkflow = (name) => {
  var promise
  var workflow = {
    name,
    desc: '',
    uuid: StringUtils.getUUID(),
    rUUIDList: []
  }
  getWorkflow().workflowList.push(workflow)
  promise = new Promise((resolve, reject) => {
    resolve('succeed')
  })
  return promise
}

export const removeWorkflow = (uuid) => {
  var promise
  var workflowList = getWorkflow().workflowList
  for (let i = 0; i < workflowList.length; i++) {
    var workflow = workflowList[i]
    if (workflow.uuid === uuid) {
      workflowList.splice(i, 1)
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

export const addRequest = (requestName, groupName, projectName, requestUUID, workflowUUID) => {
  var promise
  var wf
  var workflowList = getWorkflow().workflowList
  for (let i = 0; i < workflowList.length; i++) {
    var workflow = workflowList[i]
    if (workflow.uuid === workflowUUID) {
      wf = workflow
      break
    }
  }
  if (wf !== undefined) {
    var request = Opt.getRequest(projectName, groupName, requestName, requestUUID)
    if (request !== undefined) {
      wf.rUUIDList.push(requestUUID)
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

export const removeRequest = (requestUUID, workflowUUID, oldIdx) => {
  var promise
  var wf
  var workflowList = getWorkflow().workflowList
  for (let i = 0; i < workflowList.length; i++) {
    var workflow = workflowList[i]
    if (workflow.uuid === workflowUUID) {
      wf = workflow
      break
    }
  }
  if (wf !== undefined) {
    if (wf.rUUIDList[oldIdx] === requestUUID) {
      wf.rUUIDList.splice(oldIdx, 1)
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

export const Wf = {
  save,
  getWorkflow,
  addWorkflow,
  removeWorkflow,
  addRequest,
  removeRequest
}
