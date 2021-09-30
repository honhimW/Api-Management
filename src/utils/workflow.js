import axios from 'axios'
import { StringUtils } from 'src/utils/stringUtils'

const baseURL = '/httpproxy'
const axi = axios.create({
  baseURL
})

export const getWorkflow = () => {
  if (window.workflowStorage !== undefined) {
    return window.workflowStorage
  }
  axi.interceptors.request.use()
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
    window.localStorage.setItem('config', JSON.stringify(workflowStorage))
    window.workflowStorage = workflowStorage
  } else {
    window.workflowStorage = JSON.parse(workflowStorage)
  }
  return window.workflowStorage
}

export const addWorkflow = (name) => {
  return axi.request({
    url: '/workflow/addWorkflow',
    method: 'post',
    data: {
      name
    }
  })
}

export const removeWorkflow = (uuid) => {
  return axi.request({
    url: '/workflow/removeWorkflow',
    method: 'post',
    data: {
      uuid
    }
  })
}

export const addRequest = (requestName, groupName, projectName, uuid, workflow) => {
  return axi.request({
    url: '/workflow/addRequest',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      requestName,
      groupName,
      projectName,
      uuid,
      workflow
    }
  })
}

export const removeRequest = (name, uuid, oldIdx) => {
  return axi.request({
    url: '/workflow/removeRequest',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      name,
      uuid,
      oldIdx
    }
  })
}

export const Wf = {
  getWorkflow,
  addWorkflow,
  removeWorkflow,
  addRequest,
  removeRequest
}
