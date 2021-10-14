import axi from 'axios'
import https from 'https'

const CT = axi.CancelToken

window.axios = axi
// export const post = (url, mtd, header, params) => {
//   return axi.request({
//     url: '/httpproxy/send',
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     data: {
//       proxyUrl: url,
//       method: mtd,
//       headers: header,
//       body: params
//     }
//   })
// }

// export const httpDetail = (url, mtd, header, params) => {
//   return axi.request({
//     url: '/httpproxy/httpDetail',
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     data: {
//       proxyUrl: url,
//       method: mtd,
//       headers: header,
//       body: params
//     }
//   })
// }

export const post = (url, mtd, header, params) => {
  return axi.request({
    url: url,
    method: mtd.toUpperCase(),
    headers: JSON.parse(header),
    data: params
  })
}

export const send = (url, mtd, header, params) => {
  var cancelerHolder = {}
  return {
    request: axi.request({
      url: url,
      method: mtd.toUpperCase(),
      headers: JSON.parse(header),
      data: params,
      timeout: 20000,
      cancelToken: new CT((cancler) => {
        cancelerHolder.cancel = cancler
      }),
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    }),
    cancelerHolder
  }
}
