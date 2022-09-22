/*
 * @Description:
 * @Author: caiwu
 * @CreateDate:
 * @LastEditor:
 * @LastEditTime: 2022-09-22 17:31:32
 */
import { Content } from '@/core'
export default class Block extends Content {
  _type = 'block'
  /**
   * @desc: 获取块级根节点
   * @return {*}
   */
  getContentContainer(elm) {
    if (elm.nodeName === 'EDITOR-CONTENT') return elm
    return this.getContentContainer(elm.parentNode)
  }
  /**
   * @desc: 删除动作
   * @param {*} path
   * @param {*} range
   * @return {*}
   */
  onBackspace(path, range) {
    console.log(this.$BR)
    const { endContainer, endOffset, collapsed } = range
    // 选区折叠
    if (collapsed) {
      if (endOffset > 0) {
        path.node.data = path.node.data.slice(0, endOffset - 1) + path.node.data.slice(endOffset)
        if (!this.props.path.len) {
          this.props.editor.selection.updatePoints(endContainer, endOffset, -1)
        } else if (path.node.data === '') {
          const prevSibling = this.getPrevPath(path).lastLeaf
          path.delete()
          if (prevSibling) {
            range.setStart(prevSibling, prevSibling.node.data.length)
          }
        } else {
          this.props.editor.selection.updatePoints(endContainer, endOffset, -1)
        }
      } else {
        const prevSibling = this.getPrevPath(path).lastLeaf
        if (!this.props.path.len) {
          const p = this.props.path.parent.component
          console.log(p)
          this.props.path.delete()
          console.log(p)
          p.update().then(() => {
            console.log(p)
          })
        }
        if (prevSibling) {
          range.setStart(prevSibling, prevSibling.node.data.length)
        }
      }
      // range.collapse(true)
    } else {
      console.log('TODO')
    }
    this.update(path, range)
  }
  // onBackspace(path, range) {
  //   const startOffset = range.startOffset
  //   if (startOffset > 0) {
  //     path.node.data = path.node.data.slice(0, startOffset - 1) + path.node.data.slice(startOffset)
  //     if (!this.contentLength) {
  //       const $root = this.getBlockRoot()
  //       path.delete()
  //       range.setStart($root, 0)
  //     } else if (path.node.data === '') {
  //       const prev = this.getPrevPath(path)?.lastLeaf
  //       path.delete()
  //       if (prev) {
  //         range.setStart(prev, prev.node.data.length)
  //       }
  //     } else {
  //       range.startOffset -= 1
  //     }
  //   } else {
  //     const prev = this.getPrevPath(path)?.lastLeaf
  //     if (prev) {
  //       range.setStart(prev, prev.node.data.length)
  //     }
  //   }
  //   range.collapse(true)
  //   this.update(path, range)
  // }
}
