/*
 * @Author: caiwu
 * @Description:
 * @CreateDate:
 * @LastEditor:
 * @LastEditTime: 2022-09-20 17:03:43
 */
const actionMap = {
  left: 'arrowLeft',
  right: 'arrowRight',
  up: 'arrowUp',
  down: 'arrowDown',
}

/**
 * 路径查找
 * @param {*} ele
 * @param {*} offset
 * @param {*} editor
 * @returns
 */
function queryPath(ele, offset = 0, editor) {
  if (ele.nodeType !== 3) return editor.queryPath(ele.childNodes[(offset || 1) - 1])
  return editor.queryPath(ele)
}

/**
 * 水平移动
 * @param {*} range
 * @param {*} direction
 * @param {*} shiftKey
 * @returns
 */
function horizontalMove(range, direction, shiftKey) {
  // 拼音输入法聚合输入的时候禁止光标的移动
  if (range.inputState.isComposing) return
  if (!range.collapsed && !shiftKey) {
    range.collapse(direction === 'left')
  } else {
    const path = queryPath(range.container, range.offset, this)
    return path.component.caretMove(actionMap[direction], path, range, shiftKey)
  }
}

/**
 * 获取path所在块
 * @param {*} path
 * @returns
 */
function getBelongBlock(path) {
  if (path.component._type === 'block') return path.component
  return getBelongBlock(path.parent)
}

/**
 * 光标跨行判断
 * @param {*} initialCaretInfo
 * @param {*} prevCaretInfo
 * @param {*} currCaretInfo
 * @param {*} editor
 * @returns
 */
function isSameLine(initialCaretInfo, prevCaretInfo, currCaretInfo, editor) {
  // 标识光标是否在同一行移动
  let sameLine = true
  // 判断自动折行(非结构层面的换行,如一行文字太长被浏览器自动换行的情况)
  // 这种情况第一行必定会占满整个屏幕宽度，只需要判断前后光标位置是否为一个屏幕宽度减去一个字符宽度即可
  // 这里通过判断前后两个光标位置距离是否大于一定的值来判断
  if (
    Math.abs(currCaretInfo.x - prevCaretInfo.x) >
    editor.ui.body.offsetWidth - 2 * currCaretInfo.h
  ) {
    sameLine = false
  }
  // 当前光标位置和前一个位置所属块不一致则肯定发生跨行
  if (currCaretInfo.belongBlock !== prevCaretInfo.belongBlock) {
    sameLine = false
  }
  //光标Y坐标和参考点相同说明光标还在本行，最理想的情况放在最后判断
  if (currCaretInfo.y === initialCaretInfo.y) {
    sameLine = true
  }
  return sameLine
}

/**
 * 循环执行函数
 * @param {*} range
 * @param {*} direction
 * @param {*} initialCaretInfo
 * @param {*} prevCaretInfo
 * @param {*} lineChanged
 * @param {*} shiftKey
 * @returns
 */
function loop(range, direction, initialCaretInfo, prevCaretInfo, lineChanged = false, shiftKey) {
  if (range.collapsed) {
    range.d = 0
  }
  const { path } = horizontalMove.call(this, range, direction, shiftKey) || {}
  if (!path) return
  range.updateCaret(false)
  const belongBlock = getBelongBlock(path)
  if (lineChanged) {
    const currCaretInfo = { ...range.caret.rect, belongBlock }
    const preDistance = Math.abs(prevCaretInfo.x - initialCaretInfo.x)
    const currDistance = Math.abs(currCaretInfo.x - initialCaretInfo.x)
    // 标识前后光标是否在同一行
    const sameLine = isSameLine(initialCaretInfo, prevCaretInfo, currCaretInfo, this)
    if (!(currDistance <= preDistance && sameLine)) {
      const d = direction === 'left' ? 'right' : 'left'
      horizontalMove.call(this, range, d, shiftKey)
      range.updateCaret(false)
      return
    }
  }
  const currCaretInfo = { ...range.caret.rect, belongBlock }
  const sameLine = isSameLine(initialCaretInfo, prevCaretInfo, currCaretInfo, this)
  if (!sameLine) {
    lineChanged = true
  }
  return loop.call(this, range, direction, initialCaretInfo, currCaretInfo, lineChanged, shiftKey)
}

/**
 * 垂直移动 垂直移动等效于水平移动N步的结果，关键点在于确定N
 * 这里通过光标位置回溯法，计算出最合适的N
 * @param {*} range
 * @param {*} direction
 * @param {*} shiftKey
 */
function verticalMove(range, direction, shiftKey) {
  const belongBlock = getBelongBlock(queryPath(range.container, range.offset, this))
  const initialCaretInfo = { ...range.caret.rect, belongBlock }
  const prevCaretInfo = { ...range.caret.rect, belongBlock }
  const d = direction === 'up' ? 'left' : 'right'
  loop.call(this, range, d, initialCaretInfo, prevCaretInfo, false, shiftKey)
}

/**
 * 光标移动
 * @param {*} param
 */
export default function caretMove({ direction, drawCaret, shiftKey }) {
  switch (direction) {
    case 'left':
    case 'right':
      this.selection.ranges.forEach((range) => {
        horizontalMove.call(this, range, direction, shiftKey)
      })
      break

    case 'up':
    case 'down':
      this.selection.ranges.forEach((range) => {
        verticalMove.call(this, range, direction, shiftKey)
      })

      break
  }
  // 在事件循环末尾绘制更新光标UI
  Promise.resolve().then(() => {
    this.selection.updateCaret(drawCaret)
  })
}
