export const map2Json = (map) => {
  var obj = {}
  for (var [k, v] of map) {
    obj[k] = v
  }
  return JSON.stringify(obj)
}

export const map2Array = (map) => {
  var arr = []
  if (map === undefined || map === null) {
  } else {
    var obj
    for (var [k, v] of map) {
      obj = {
        key: k,
        val: v
      }
      arr.push(obj)
    }
  }
  arr.push({
    key: '',
    val: ''
  })
  return arr
}

export const obj2Array = (obj) => {
  var arr = []
  for (var key in obj) {
    arr.push({
      key,
      val: obj[key]
    })
  }
  arr.push({
    key: '',
    val: ''
  })
  return arr
}
