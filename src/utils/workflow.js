import axios from 'axios'

const baseURL = '/httpproxy'
const axi = axios.create({
  baseURL
})

export const getWorkflow = () => {
  return axi.request({
    url: '/workflow/getAllWorkflow',
    method: 'post'
  })
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
