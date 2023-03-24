/*
 * @Author: caiwu
 * @Description:
 * @CreateDate:
 * @LastEditor:
 * @LastEditTime: 2022-11-22 16:20:40
 */
import { default as h, insertedInsQueue } from './createVnode'
import pluginContext from '@/core/pluginContext'
import { getVnOrElm, getVnOrIns, setVnElm, setVnIns } from '../../mappings'
import { isUndef, isDef } from '../../utils'

/**
 * @description 判断是否相同节点
 * @param {*} vnode
 * @param {*} oldVnode
 * @returns {*}
 */
function sameVnode(vnode, oldVnode) {
  return vnode?.key === oldVnode?.key && vnode?.type === oldVnode?.type
}

/**
 * @description 在老节点中查找id
 * @param {*} node
 * @param {*} oldCh
 * @param {*} start
 * @param {*} end
 * @returns {*}
 */
function findIdxInOld(node, oldCh, start, end) {
  for (let i = start; i < end; i++) {
    const c = oldCh[i]
    if (isDef(c) && sameVnode(node, c)) return i
  }
}

/**
 * @description 生成id映射
 * @param {*} children
 * @param {*} beginIdx
 * @param {*} endIdx
 * @returns {*}
 */
function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {}
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key
    if (isDef(key)) {
      map[key] = i
    }
  }
  return map
}

/**
 * @description 增加节点
 * @param {*} parentElm
 * @param {*} [before=null]
 * @param {*} vnodes
 * @param {*} startIdx
 * @param {*} endIdx
 */
function addVnodes(parentElm, before = null, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (ch != null) {
      const elm = pluginContext.platform.createElm(ch)
      // TODO
      setVnElm(elm, ch)
      pluginContext.platform.insertBefore(parentElm, elm, before)
    }
  }
}

/**
 * @description 销毁钩子调用
 * @param {*} vnode
 * @param {*} destoryQueue
 */
function invokeDestroyHook(vnode, destoryQueue) {
  const vn = vnode.ins ? getVnOrIns(vnode.ins) : vnode
  if (vn !== undefined) {
    const ins = getVnOrIns(vn)
    ins?.onBeforeUnmount?.()
    if (vn.children !== undefined) {
      for (let j = 0; j < vn.children.length; ++j) {
        const child = vn.children[j]
        if (child != null && typeof child !== 'string') {
          invokeDestroyHook(child, destoryQueue)
        }
      }
    }
    // 销毁映射
    if (ins) {
      destoryQueue.push(ins)
    }
  }
}

/**
 * @description 节点删除
 * @param {*} parentElm
 * @param {*} oldCh
 * @param {*} startIdx
 * @param {*} endIdx
 */
function removeVnodes(parentElm, oldCh, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const vnode = oldCh[startIdx]
    if (vnode != null) {
      let destoryQueue = []
      // const dom = getVnOrElm(vnode)
      let dom = getVnOrElm(vnode)
      if (!dom) dom = getVnOrElm(getVnOrIns(vnode.ins || {}))
      dom && pluginContext.platform.removeChild(parentElm, dom)
      invokeDestroyHook(vnode, destoryQueue)
      destoryQueue.forEach((ins) => {
        ins.onUnmounted?.()
      })
      destoryQueue = null
    }
  }
}

/**
 * @description children更新函数
 * @param {*} parentElm
 * @param {*} newCh
 * @param {*} oldCh
 */
function updateChildren(parentElm, newCh, oldCh) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let newEndIdx = newCh.length - 1
  let oldStartVnode = oldCh[0]
  let newStartVnode = newCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx
  let idxInOld
  let elmToMove
  let before
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx]
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx]
      // 新头=旧头
    } else if (sameVnode(newStartVnode, oldStartVnode)) {
      patchVnode(newStartVnode, oldStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
      // 新尾=旧尾
    } else if (sameVnode(newEndVnode, oldEndVnode)) {
      patchVnode(newEndVnode, oldEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
      // 旧头=新尾
    } else if (sameVnode(newEndVnode, oldStartVnode)) {
      // Vnode moved right
      patchVnode(newEndVnode, oldStartVnode)
      pluginContext.platform.insertBefore(
        parentElm,
        getVnOrElm(oldStartVnode),
        getVnOrElm(oldEndVnode).nextSibling
      )
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
      // 新头=旧尾
    } else if (sameVnode(newStartVnode, oldEndVnode)) {
      // Vnode moved left
      patchVnode(newStartVnode, oldEndVnode)
      pluginContext.platform.insertBefore(
        parentElm,
        getVnOrElm(oldEndVnode),
        getVnOrElm(oldStartVnode)
      )
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      }
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      if (isUndef(idxInOld)) {
        // New element
        pluginContext.platform.insertBefore(
          parentElm,
          pluginContext.platform.createElm(newStartVnode),
          getVnOrElm(oldStartVnode)
        )
      } else {
        elmToMove = oldCh[idxInOld]
        if (elmToMove.tagName !== newStartVnode.tagName) {
          pluginContext.platform.insertBefore(
            parentElm,
            pluginContext.platform.createElm(newStartVnode),
            getVnOrElm(oldStartVnode)
          )
        } else {
          patchVnode(newStartVnode, elmToMove)
          oldCh[idxInOld] = undefined
          pluginContext.platform.insertBefore(
            parentElm,
            getVnOrElm(elmToMove),
            getVnOrElm(oldStartVnode)
          )
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }

  if (newStartIdx <= newEndIdx) {
    before = newCh[newEndIdx + 1] == null ? null : getVnOrElm(newCh[newEndIdx + 1])
    addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
  }
  if (oldStartIdx <= oldEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}

/**
 * @description 节点比对
 * @param {*} vnode
 * @param {*} oldVnode
 */
function patchVnode(vnode, oldVnode) {
  if (oldVnode === vnode) return
  if (typeof vnode.type === 'function') {
    if (vnode.type.isComponent) {
      // 常规组件
      const ins = (vnode.ins = oldVnode.ins)
      ins._$pv = vnode
      const oldVn = getVnOrIns(ins)
      ins.props = Object.freeze({ ...vnode.props })
      const newVn = ins.render(h)
      patchVnode(newVn, oldVn)
    } else {
      // 函数组件
      const oldVn = getVnOrIns(oldVnode)
      const newVn = vnode.type(h, vnode.props)
      setVnIns(vnode, newVn)
      patchVnode(newVn, oldVn)
    }
  } else if (vnode.type === 'text') {
    const elm = getVnOrElm(oldVnode)
    setVnElm(elm, vnode)
    pluginContext.platform.updateProps(vnode, oldVnode)
  } else {
    // 重新映射elm和vn
    const elm = getVnOrElm(oldVnode)
    setVnElm(elm, vnode)
    // 如果有ins则重新映射ins
    const ins = getVnOrIns(oldVnode)
    ins && setVnIns(vnode, ins)
    const oldCh = oldVnode.children
    const ch = vnode.children
    pluginContext.platform.updateProps(vnode, oldVnode)
    if (oldCh !== ch) updateChildren(elm, ch, oldCh)
  }
}

/**
 * @description diff函数
 * @export
 * @param {*} vnode
 * @param {*} oldVnode
 * @returns {*}
 */
export default function patch(vnode, oldVnode) {
  insertedInsQueue.length = 0
  // 没有oldvnode 直接创建新dom
  if (isUndef(oldVnode)) {
    const elm = pluginContext.platform.createElm(vnode)
    setVnElm(elm, vnode)
    return elm
  }
  const isRealElment = isDef(oldVnode.nodeType)
  // oldvnode 是dom，先转化为虚拟节点
  if (isRealElment) {
    const elm = oldVnode
    oldVnode = pluginContext.platform.domToVNode(oldVnode)
    setVnElm(elm, oldVnode)
  }
  // 相同节点则执行更新逻辑
  if (sameVnode(vnode, oldVnode)) {
    patchVnode(vnode, oldVnode)
  } else {
    let oldElm = getVnOrElm(oldVnode)
    const newElm = pluginContext.platform.createElm(vnode)
    pluginContext.platform.replaceChild(oldElm.parentNode, newElm, oldElm)
    oldElm = null
  }
  insertedInsQueue.forEach((ele) => {
    if (ele.onMounted) ele.onMounted()
  })
  insertedInsQueue.length = 0
  return getVnOrElm(vnode)
}
