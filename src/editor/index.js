/*
 * @Author: caiwu
 * @Description:
 * @CreateDate:
 * @LastEditor:
 * @LastEditTime: 2022-08-31 17:12:53
 */
import mount from './mount'
import { createPath, Typex } from '@/core'
import platform from '@/platform'
import formats from './formats'
import { mockData } from './data'
console.log(formats)
class Editor extends Typex {
  conamndHandles = {}
  toolBarOption = []
  constructor(options) {
    super({
      formats,
      plugins: [platform],
      ...options,
    })
    this.on('command', this.command)
  }
  mount(id) {
    mount.call(this, id)
    return this
  }
  setToolBar(toolBarOption) {
    this.toolBarOption = toolBarOption
    toolBarOption.forEach((toolItem) => {
      toolItem.editor = this
      this.conamndHandles[toolItem.command] = toolItem.commandHandle
    })
    return this
  }
  command(name) {
    const commandHandle = this.conamndHandles[name]
    if (typeof commandHandle !== 'function') return
    this.selection.ranges.forEach((range) => {
      const path = range.container
      path.component.setFormat(range, commandHandle)
    })
    Promise.resolve().then(() => {
      this.selection.updateCaret()
    })
  }
}
export default function createEditor(options = {}) {
  const marks = mockData
  const path = createPath(marks)
  return new Editor({ path })
}
