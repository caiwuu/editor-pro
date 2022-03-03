import { isEmptyNode } from '../share/utils'
const insKey = Symbol('key')
export default class VNode {
  static [insKey] = 1000
  key = 0
  _type = null
  attrs = {}
  position = '0'
  path = []
  index = 0
  parentNode = null
  _isVnode = true
  ele = null
  isRoot = true
  tagName = null
  children = []
  styles = new Map()
  classes = new Set()
  listeners = new Map()
  constructor() {
    this.key = VNode[insKey]
    VNode[insKey]++
    this.path = [this]
  }
  get type() {
    if (this._type) return this._type
    switch (this.tagName) {
      case 'div':
      case 'p':
      case 'ul':
      case 'li':
      case 'ol':
        return 'block'
      case 'span':
      case 'a':
      case 'sub':
      case 'sup':
      case 'code':
      case 'string':
      case 'u':
      case 'del':
      case 'em':
        return 'inline'
      case 'text':
        return 'text'
      case 'br':
        return 'br'
      case 'img':
        return 'img'
      default:
        return 'inline'
    }
  }
  insert(vnode, index) {
    console.log('insert')
    index = index === undefined ? this.length : index
    if (this.children.length > index) {
      if (index === 0) {
        this.ele.insertBefore(vnode.ele, this.ele.childNodes[0])
      } else {
        this.ele.insertBefore(vnode.ele, this.ele.childNodes[index - 1].nextSibling)
      }
    } else {
      console.log(vnode)
      this.ele.appendChild(vnode.ele)
    }
    this.children.splice(index, 0, vnode)
    this.reArrangement()
  }
  repalce() {
    console.log('replace')
  }
  delete(index, count) {
    console.log('delete')
    const start = index - count <= 0 ? 0 : index - count
    this.children.splice(start, index - start).forEach((vnode) => vnode.ele.remove())
    this.reArrangement()
  }
  moveTo(target, index) {
    console.log('moveTo')
    const removeNodes = this.parentNode.children.splice(this.index, 1)
    this.parentNode.reArrangement()
    removeNodes.forEach((vnode) => {
      target.insert(vnode, index)
    })
  }
  remove() {
    console.log('remove')
    this.parentNode.children.splice(this.index, 1).forEach((i) => {
      i.removed = true
      i.ele.remove()
    })
    this.parentNode.reArrangement()
  }
  reArrangement() {
    if (this.children) {
      this.children.forEach((item, index) => {
        const oldPosition = item.position
        item.isRoot = false
        item.path = [...this.path, item]
        item.index = index
        item.parentNode = this
        item.position = this.position + '-' + index
        if (oldPosition !== item.position) item.reArrangement()
      })
    }
  }
  appendChild(...vnodes) {
    vnodes && this.children.push(...vnodes)
    this.reArrangement()
  }
  get isEmpty() {
    return isEmptyNode(this)
  }
  get length() {
    if (this.type === 'atom') {
      return -1
    } else {
      return this.children.filter((ele) => ele.type !== 'placeholder').length
    }
  }
  get isEditable() {
    return this.editable !== 'off'
  }
  render() {
    const dom = document.createElement(this.tagName)
    this.ele = dom
    dom.vnode = this
    switch (this.tagName) {
      case 'a':
        dom.href = this.attrs.href ?? ''
        Reflect.deleteProperty(this.attrs, 'href')
        break
      case 'img':
        dom.src = this.attrs.src ?? ''
        Reflect.deleteProperty(this.attrs, 'src')
        break
    }
    if (this.attrs.isRoot) {
      this.isRoot = this.attrs.isRoot
      Reflect.deleteProperty(this.attrs, 'isRoot')
    }
    if (this.attrs.type) {
      this._type = this.attrs.type
      Reflect.deleteProperty(this.attrs, 'type')
    }
    if (!this.isEditable) {
      this.styles.set('user-select', 'none')
    }
    // set style
    this.styles.forEach((value, key) => {
      dom.style[key] = value
    })
    // set class
    this.classes.forEach((className) => {
      dom.classList.add(className)
    })
    // set listeners
    this.listeners.forEach((value, key) => {
      dom.addEventListener(key, value)
    })
    Object.keys(this.attrs).forEach((key) => {
      dom.setAttribute(key, this.attrs[key])
    })
    return dom
  }
}
