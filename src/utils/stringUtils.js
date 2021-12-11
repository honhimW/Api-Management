import { uid } from 'quasar'
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

export const getUUID = () => {
  return uid()
}

export const StringUtils = {
  defaultIfBlank,
  isBlank,
  getUUID
}
