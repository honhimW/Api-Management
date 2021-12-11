export const loadFile = (name) => { // name为文件所在位置
  var xhr = new XMLHttpRequest()
  xhr.open('GET', name, false)
  xhr.overrideMimeType('text/html;charset=utf-8')
  xhr.send(null)
  return xhr.responseText
}

export const unicodeToUtf8 = (data) => {
  data = data.replace(/\\/g, '%')
  return unescape(data)
}

export const fileUtils = {
  loadFile,
  unicodeToUtf8
}
