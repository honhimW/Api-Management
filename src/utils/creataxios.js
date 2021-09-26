import axios from 'axios'

var baseURL = ''
export const initAxios = (component) => {
  baseURL = component.$store.state.origin
}

export default axios.create({
  baseURL
})
