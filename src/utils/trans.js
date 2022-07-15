
export const swagger2toMd = (jsonObj) => {
  var map = swagger2trans(jsonObj)
  var controllerMap = map.tableMap
  var sb = ''
  sb += '# ' + map.info.title + '\n\n'
  sb += '> base path: ' + map.basePath + '\n\n'
  sb += '---\n\n'
  var i = 1
  Object.keys(controllerMap).forEach(key => {
    var j = 1
    var method = controllerMap[key]
    sb += '## ' + i + ' ' + method[0].title + '\n\n'
    method.forEach(table => {
      sb += '### ' + i + '.' + j++ + ' ' + table.description + '\n\n'
      sb += '**URL: ' + table.url + '**\n\n'
      sb += '**请求方式: ' + table.requestType.toUpperCase() + '**\n\n'
      sb += '**请求参数: **\n\n'
      var requestList = table.requestList
      sb += buildRequestTable(requestList) + '\n\n'
      sb += '**Body: **\n\n'
      sb += buildRequestModelTableAndSample(requestList) + '\n\n'
      sb += '**请求示例: **\n\n'
      sb += '```json\n' + buildExample(table.requestParam) + '\n```\n\n'
      sb += '**返回示例: **\n\n'
      sb += '```json\n' + buildExample(table.responseParam) + '\n```\n\n'
      sb += '**返回参数说明: **\n\n'
      var properties = table.modelAttr.properties
      sb += buildResponseTable(properties) + '\n\n'
      sb += '---\n\n'
    })
    i++
  })
  return sb
}

export const swagger2trans = (jsonObj) => {
  // var jsonObj = JSON.parse(jsontxt)
  var attrs = parseDefinitions(jsonObj)

  var resultMap = {}
  var result = []

  var paths = jsonObj.paths
  if (paths !== undefined) {
    Object.keys(paths).forEach(pathKey => {
      var pathVal = paths[pathKey]

      var url = pathKey

      var requestType = Object.keys(pathVal).join(',')

      var firstRequest = Object.keys(pathVal)[0]
      var content = pathVal[firstRequest]

      var title = content.tags[0]

      var tag = content.summary

      var description = content.summary

      var requestForm = ''
      var consumes = content.consumes
      if (consumes !== undefined && consumes.length > 0) {
        requestForm = consumes.join(',')
      }

      var responseForm = ''
      var produces = content.produces
      if (produces !== undefined && produces.length > 0) {
        responseForm = produces.join(',')
      }

      var parameters = content.parameters

      var responses = content.responses

      var table = { title, url, tag, description, requestForm, responseForm, requestType, requestList: processRequestList(parameters, attrs), responseList: processResponseList(responses) }
      table.modelAttr = {
        className: '',
        name: '',
        type: '',
        require: false,
        properties: [],
        isCompleted: false
      }
      var too = responses['200']
      if (too !== undefined && too.schema !== undefined) {
        table.modelAttr = processResponseModelAttrs(too, attrs)
      }

      table.requestParam = processRequestParam(table.requestList)
      table.responseParam = processResponseParam(too, attrs)
      result.push(table)
    })
  }
  var tableMap = groupingBy(result, 'title')
  resultMap.tableMap = tableMap
  resultMap.info = jsonObj.info
  resultMap.basePath = jsonObj.basePath
  return resultMap
}

const parseDefinitions = (origin) => {
  var definitin = origin.definitions
  var attrs = {}
  if (definitin !== undefined) {
    Object.keys(definitin).forEach(modeName => {
      fillModel(definitin, attrs, modeName)
    })
  }
  return attrs
}
const DEFINITIONS_PREFIX = '#/definitions/'
const fillModel = (defObj, attrs, modeName) => {
  var attr = attrs[DEFINITIONS_PREFIX + modeName]
  if (attr === undefined) {
    attr = {}
    attrs[DEFINITIONS_PREFIX + modeName] = attr
  } else if (attr.isCompleted) {
    return attr
  }
  var properties = defObj[modeName].properties
  var required = defObj[modeName].required
  if (properties === undefined) {
    return
  }
  var list = []
  Object.keys(properties).forEach(key => {
    var attrInfo = properties[key]
    var child = {}
    child.name = key
    child.type = defaultIfBlank(attrInfo.type, '')
    if (attrInfo.format !== undefined) {
      child.type = child.type + '(' + attrInfo.format + ')'
    }
    if (isBlank(child.type)) {
      child.type = 'object'
    }
    var ref = attrInfo.$ref
    var items = attrInfo.items
    if (ref !== undefined || (items !== undefined && (ref = items.$ref) !== undefined)) {
      var clzName = ref.substring(DEFINITIONS_PREFIX.length)
      var refModel = fillModel(defObj, attrs, clzName)
      if (refModel !== undefined) {
        child.properties = refModel.properties
      } else {
        child.properties = []
      }
      child.type = child.type + ':' + clzName
    } else if (items !== undefined && attrInfo.type === 'array') {
      child.type += ':' + items.type
    }
    child.description = attrInfo.description
    if (required !== undefined) {
      if (required.includes(child.name)) {
        child.required = true
      }
    }
    list.push(child)
  })
  var title = defObj[modeName].title
  var description = defObj[modeName].description
  attr.className = defaultIfBlank(title, '')
  attr.description = defaultIfBlank(description, '')
  attr.properties = list
  return attr
}

const processRequestList = (parameters, attrs) => {
  var requestList = []
  if (parameters !== undefined && parameters.length > 0) {
    parameters.forEach(param => {
      var _in = param.in
      var request = {}
      request.name = param.name
      request.type = defaultIfBlank(param.type, 'object')
      if (param.format !== undefined) {
        request.type = request.type + '(' + parameters.format + ')'
      }
      request.paramType = _in
      // 考虑对象参数类型
      if (_in !== undefined && _in === 'body') {
        var schema = param.schema
        var ref = schema.$ref
        // 数组情况另外处理
        if (schema.type !== undefined && schema.type === 'array') {
          ref = schema.items.$ref
          request.type = 'array'
        }
        if (ref !== undefined) {
          request.type = request.type + ':' + ref.replaceAll(DEFINITIONS_PREFIX, '')
          request.modelAttr = attrs[ref]
        }
      }
      request.require = false
      if (param.required !== undefined) {
        request.require = param.required
      }
      request.remark = param.description
      requestList.push(request)
    })
  }
  return requestList
}

const processResponseList = (responses) => {
  var responseList = []
  Object.keys(responses).forEach(key => {
    var statusCodeInfo = responses[key]
    var response = {}
    response.name = key
    response.description = statusCodeInfo.description
    var schema = statusCodeInfo.schema
    if (schema !== undefined) {
      var originalRef = schema.originalRef
      response.remark = defaultIfBlank(originalRef, '')
    }
    responseList.push(response)
  })
  return responseList
}

const processResponseModelAttrs = (too, attrs) => {
  var schema = too.schema
  var type = schema.type
  var ref

  if (type === 'array') {
    var items = schema.items
    if (items !== undefined && items.$ref !== undefined) {
      ref = items.$ref
    }
  }

  if (schema.$ref !== undefined) {
    ref = schema.$ref
  }

  var modelAttr = {
    className: '',
    name: '',
    type: '',
    require: false,
    properties: [],
    isCompleted: false
  }
  modelAttr.type = defaultIfBlank(type, '')

  if (!isBlank(ref) && attrs[ref] !== undefined) {
    modelAttr = attrs[ref]
  }
  return modelAttr
}

const processRequestParam = (requests) => {
  var headerMap = {}
  var queryMap = {}
  var jsonMap = {}
  if (requests !== undefined && requests.length > 0) {
    requests.forEach(request => {
      var name = request.name
      var paramType = request.paramType
      var value = getValue(request.type, request.modelAttr)
      switch (paramType) {
        case 'header':
          headerMap[name] = value
          break
        case 'query':
          queryMap[name] = value
          break
        case 'body':
          jsonMap[name] = value
          break
        default:
          break
      }
    })
  }
  var sb = ''
  if (Object.keys(queryMap).length > 0) {
    sb = sb + getUrlParamsByMap(queryMap)
  }
  if (Object.keys(headerMap).length > 0) {
    sb = sb + ' ' + getHeaderByMap(headerMap)
  }
  if (Object.keys(jsonMap).length > 0) {
    sb = sb + ' --requestBody'
    if (Object.keys(jsonMap).length === 1) {
      Object.keys(jsonMap).forEach(key => {
        sb = sb + JSON.stringify(jsonMap[key])
      })
    } else {
      sb = sb + JSON.stringify(jsonMap)
    }
  }
  return sb
}

const processResponseParam = (too, attrs) => {
  if (too !== undefined && too.schema !== undefined) {
    var schema = too.schema
    var type = schema.type
    var ref
    if (type === 'array') {
      var items = schema.items
      if (items !== undefined && items.$ref !== undefined) {
        ref = items.$ref
      }
    }

    if (schema.$ref !== undefined) {
      ref = schema.$ref
    }
    if (!isBlank(ref)) {
      var modelAttr = attrs[ref]
      if (modelAttr !== undefined && (modelAttr.properties !== undefined && modelAttr.properties.length > 0)) {
        var responseMap = {}
        modelAttr.properties.forEach(property => {
          responseMap[property.name] = getValue(property.type, property)
        })
        return JSON.stringify(responseMap)
      }
    }
  }
  return ''
}

const getValue = (type, modelAttr) => {
  var currentType = type
  var pos = type.indexOf(':')
  if (pos !== -1) {
    currentType = type.substring(0, pos)
  }
  switch (currentType) {
    case 'string':
      return 'string'
    case 'string(date-time)':
      return '2020/01/01 00:00:00'
    case 'integer':
    case 'integer(int32)':
    case 'integer(int64)':
      return 0
    case 'number':
      return 0.0
    case 'boolean':
      return true
    case 'file':
      return '(binary)'
    case 'array':
      var list = []
      var map = {}
      if (modelAttr !== undefined && (modelAttr.properties !== undefined && modelAttr.properties.length > 0)) {
        modelAttr.properties.forEach(property => {
          map[property.name] = getValue(property.type, property)
        })
      } else {
        map = getValue(type.substring(pos + 1), undefined)
      }
      list.push(map)
      return list
    case 'object':
      map = {}
      if (modelAttr !== undefined && (modelAttr.properties !== undefined && modelAttr.properties.length > 0)) {
        modelAttr.properties.forEach(property => {
          map[property.name] = getValue(property.type, property)
        })
      }
      return map
    default:
      return undefined
  }
}

const getHeaderByMap = (headerMap) => {
  if (headerMap === undefined || Object.keys(headerMap).length === 0) {
    return ''
  }
  var sb = ''
  Object.keys(headerMap).forEach(key => {
    sb = sb + '--header \''
    sb = sb + key + ':' + headerMap[key]
    sb = sb + '\''
  })
  return sb
}

const getUrlParamsByMap = (paramMap) => {
  if (paramMap === undefined || Object.keys(paramMap).length === 0) {
    return ''
  }
  var sb = ''
  Object.keys(paramMap).forEach(key => {
    if (!isBlank(sb)) {
      sb = sb + '&'
    }
    sb = sb + key + '=' + paramMap[key]
  })
  return sb
}

const buildRequestTable = (requestList) => {
  if (requestList.length === 0) {
    return '- 无\n\n'
  }

  var sb = ''
  sb += '|Model|必选|类型|\n'
  sb += '|----|----|-----|\n'
  requestList.forEach(request => {
    sb += '|' + request.type + '|' + request.require + '|' + request.paramType + '|\n'
  })
  sb += '\n'
  return sb
}

const buildRequestModelTableAndSample = (requestList) => {
  if (requestList.length === 0) {
    return '- 无\n\n'
  }

  var sb = ''
  requestList.forEach(request => {
    if (request.paramType === 'body') {
      sb += '|字段|字段类型|是否必选|说明|\n'
      sb += '|----|----|----|----|\n'
      var lm = request.modelAttr.properties
      if (lm !== undefined) {
        lm.sort((a, b) => {
          if (a.required && !b.required) {
            return -1
          } else if (!a.required && b.required) {
            return 1
          } else {
            return 0
          }
        })
        var tableSb = ''
        sb += recursion(lm, tableSb, 0, true)
      } else {
        console.log(request)
        sb += '|-|-|-|-|\n'
      }
      sb += '\n'
    }
    sb += '\n'
  })
  return sb
}

const recursion = (lm, tableSb, deep, select) => {
  lm.forEach(modelAttr => {
    var paramName = ''
    for (var i = 0; i < deep; i++) {
      paramName += '∟'
    }
    paramName += modelAttr.name
    if (select) {
      tableSb += '|' + paramName + '|' + modelAttr.type + '|' + (modelAttr.required ? '是' : '否') + '|' + defaultIfBlank(modelAttr.description, '-') + '|\n'
    } else {
      tableSb += '|' + paramName + '|' + modelAttr.type + '|' + defaultIfBlank(modelAttr.description, '-') + '|\n'
    }
    if (modelAttr.type.startsWith('object:') && modelAttr.properties.length !== 0) {
      tableSb = recursion(modelAttr.properties, tableSb, deep + 1, select)
    }
  })
  return tableSb
}

export const buildExample = (str) => {
  var param
  if (isBlank(str)) {
    return '- 无\n\n'
  }
  if (str.includes('--requestBody')) {
    str = str.split('--requestBody')[1]
  }
  // POST
  if (str.startsWith(' -d ')) {
    var start = str.indexOf('{')
    var end = str.lastIndexOf('}') + 1
    str = str.substring(start, end)
    param = JSON.parse(str)
  } else if (str.startsWith('{') && str.endsWith('}')) {
    param = JSON.parse(str)
  } else {
    var split = str.split('&')
    var map = {}
    split.forEach(s => {
      var splitChild = s.split('=')
      if (splitChild.length === 1) {
        map[splitChild[0]] = ''
      } else {
        map[splitChild[0]] = splitChild[1]
      }
    })
    param = map
  }
  return JSON.stringify(param, null, 2)
}

const buildResponseTable = (properties) => {
  if (properties.length === 0) {
    return '- 无\n\n'
  }
  var sb = ''
  sb += '|参数名|类型|说明|\n'
  sb += '|----|----|-----|\n'
  var tableSb = ''
  sb += recursion(properties, tableSb, 0, false)
  sb += '\n'
  return sb
}

const defaultIfBlank = (str, def) => {
  return isBlank(str) ? def : str
}

const isBlank = (str) => {
  if (str !== undefined && str.length !== 0) {
    for (var i = 0; i < str.length; i++) {
      if (str.charAt(i) !== ' ') {
        return false
      }
    }
  }
  return true
}

const groupingBy = (arr, key) => {
  var map = {}
  arr.forEach(item => {
    if (map[item[key]] !== undefined) {
      map[item[key]].push(item)
    } else {
      map[item[key]] = []
      map[item[key]].push(item)
    }
  })
  return map
}
