import axi from 'axios'

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
  return axi.request({
    url: url,
    method: mtd.toUpperCase(),
    headers: JSON.parse(header),
    data: params,
    timeout: 20000
  })
}
