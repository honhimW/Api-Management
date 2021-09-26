import Interpreter from 'js-interpreter'
import Md5 from 'md5'
import jsrsasign, { KEYUTIL, KJUR } from 'jsrsasign'

/**
 * 定义方法
 */

var globalProp

function inv (interpreter, globalObject) {
  var innerCont = function () {
    return globalProp
  }
  interpreter.setProperty(globalObject, 'getContent', interpreter.createNativeFunction(innerCont))
  var innerGetBody = function () {
    return globalProp.body
  }
  interpreter.setProperty(globalObject, 'getBody', interpreter.createNativeFunction(innerGetBody))
  var innerGetHeaders = function (key) {
    return globalProp.headers.get(key)
  }
  interpreter.setProperty(globalObject, 'getHeader', interpreter.createNativeFunction(innerGetHeaders))
  var innerGetEnv = function (key) {
    return globalProp.envProp.get(key)
  }
  interpreter.setProperty(globalObject, 'getEnvProp', interpreter.createNativeFunction(innerGetEnv))
  var innerSetHeaders = function (key, val) {
    globalProp.headers.set(key, val)
    return true
  }
  interpreter.setProperty(globalObject, 'setHeader', interpreter.createNativeFunction(innerSetHeaders))
  var innerSetEnv = function (key, val) {
    globalProp.envProp.set(key, val)
    return true
  }
  interpreter.setProperty(globalObject, 'setEnvProp', interpreter.createNativeFunction(innerSetEnv))
  // bota
  var innerBtoA = function (str) {
    return btoa(str)
  }
  interpreter.setProperty(globalObject, 'btoa', interpreter.createNativeFunction(innerBtoA))
  // atob
  var innerAtoB = function (str) {
    return atob(str)
  }
  interpreter.setProperty(globalObject, 'atob', interpreter.createNativeFunction(innerAtoB))
  // MD5
  var innerMd5 = function (str) {
    return Md5(str)
  }
  interpreter.setProperty(globalObject, 'md5', interpreter.createNativeFunction(innerMd5))
  // timestamp
  var innerTimestamp = function () {
    return new Date().getTime()
  }
  interpreter.setProperty(globalObject, 'timestamp', interpreter.createNativeFunction(innerTimestamp))
  // signSHA256withRSA
  var innerSignSHA256withRSA = function (str) {
    return signSHA256withRSA(str)
  }
  interpreter.setProperty(globalObject, 'rsa', interpreter.createNativeFunction(innerSignSHA256withRSA))
  // signSHA256withRSA
  var innerSignSHA256withRSAwithPK = function (str, pk) {
    return signSHA256withRSAwithPK(str, pk)
  }
  interpreter.setProperty(globalObject, 'rsawp', interpreter.createNativeFunction(innerSignSHA256withRSAwithPK))
  // dateFormat
  var innerDateFormat = function (fmt) {
    if (fmt === undefined) {
      fmt = 'YYYYmmddHHMMSS'
    }
    return dateFormat(fmt, new Date())
  }
  interpreter.setProperty(globalObject, 'formatDate', interpreter.createNativeFunction(innerDateFormat))
  var innerAlert = function (msg) {
    return alert(msg)
  }
  interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction(innerAlert))
  var innerLog = function (obj) {
    return console.log(obj)
  }
  interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(innerLog))
}

export const interRun = (input, gp) => {
  globalProp = gp
  var myInterpreter = new Interpreter(input, inv)
  myInterpreter.run()
  return myInterpreter.value
}

export const editHeader = (input, gp) => {
  globalProp = gp
  var myInterpreter = new Interpreter(input, inv)
  myInterpreter.run()
  return globalProp
}

function dateFormat (fmt, date) {
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
}

export const signSHA256withRSA = (str) => {
  var privateKey = '-----BEGIN PRIVATE KEY-----\n' +
  '私钥填这\n' + // 私钥
  '-----END PRIVATE KEY-----\n'
  var priKy = KEYUTIL.getKey(privateKey)
  var signature = new KJUR.crypto.Signature({
    alg: 'SHA256withRSA',
    prvkeypem: priKy
  })
  signature.updateString(str)
  var signed = signature.sign()
  var b64 = jsrsasign.hextob64(signed)
  return b64
}

export const signSHA256withRSAwithPK = (str, pk) => {
  var privateKey = '-----BEGIN PRIVATE KEY-----\n' +
  pk + '\n' +
  '-----END PRIVATE KEY-----\n'
  var priKy = KEYUTIL.getKey(privateKey)
  var signature = new KJUR.crypto.Signature({
    alg: 'SHA256withRSA',
    prvkeypem: priKy
  })
  signature.updateString(str)
  var signed = signature.sign()
  var b64 = jsrsasign.hextob64(signed)
  return b64
}
