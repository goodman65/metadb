const COMMON_TYPE_KEY = 'menu-common'
class ContextPad {
  constructor({ lf }) {
    this.menuTypeMap = new Map()
    this.lf = lf
    this.__menuDOM = document.createElement('div')
    this.__menuDOM.className = 'lf-inner-context'
    this.menuTypeMap.set(COMMON_TYPE_KEY, [])
  }
  render(lf, container) {
    this.container = container
    lf.on('node:mouseenter', ({ data }) => {
      this._activeData = data
      this.createContextMenu()
    })
    // lf.on('edge:click', ({ data }) => {
    //   // 获取右上角坐标
    //   this._activeData = data
    //   this.createContextMenu()
    // })
    lf.on('blank:click', () => {
      this.hideContextMenu()
    })
  }
  setContextMenuByType = (type, menus) => {
    this.menuTypeMap.set(type, menus)
  }
  /**
   * 隐藏菜单
   */
  hideContextMenu() {
    this.__menuDOM.innerHTML = ''
    this.__menuDOM.style.display = 'none'
    if (this.isShow) {
      this.container.removeChild(this.__menuDOM)
    }
    this.lf.off(
      'node:delete,edge:delete,node:drag,graph:transform',
      this.listenDelete,
    )
    this.isShow = false
  }
  /**
   * 显示指定元素菜单
   * @param data 节点id、节点类型、菜单位置
   */
  showContextMenu(data) {
    if (!data || !data.id) {
      console.warn('请检查传入的参数')
      return
    }
    this._activeData = data
    this.createContextMenu()
  }
  setContextMenuItems(menus) {
    this.menuTypeMap.set(COMMON_TYPE_KEY, menus)
  }
  /**
   * 获取新菜单位置
   */
  getContextMenuPosition() {
    const data = this._activeData
    const Model = this.lf.graphModel.getElement(data.id)
    if (!Model) {
      // console.warn(`找不到元素${data.id}`)
      return
    }
    let x
    let y
    // if (Model.BaseType === 'edge') {
    //   x = Number.MIN_SAFE_INTEGER
    //   y = Number.MAX_SAFE_INTEGER
    //   const edgeData = Model.getData()
    //   x = Math.max(edgeData.startPoint.x, x)
    //   y = Math.min(edgeData.startPoint.y, y)
    //   x = Math.max(edgeData.endPoint.x, x)
    //   y = Math.min(edgeData.endPoint.y, y)
    //   if (edgeData.pointsList) {
    //     edgeData.pointsList.forEach((point) => {
    //       x = Math.max(point.x, x)
    //       y = Math.min(point.y, y)
    //     })
    //   }
    // }
    if (Model.BaseType === 'node') {
      x = data.x - Model.width - 14
      y = data.y - Model.height / 2 - 14
    }
    return this.lf.graphModel.transformModel.CanvasPointToHtmlPoint([x, y])
  }
  createContextMenu() {
    const { isSilentMode } = this.lf.options
    // 静默模式不显示菜单
    if (isSilentMode) {
      return
    }
    let items = this.menuTypeMap.get(this._activeData.type) || []
    items = items.concat(this.menuTypeMap.get(COMMON_TYPE_KEY))
    const menus = document.createDocumentFragment()
    items.forEach((item) => {
      const menuItem = document.createElement('div')
      menuItem.className = 'lf-context-item'
      const img = document.createElement('img')
      img.src = item.icon
      img.className = 'lf-context-img'
      if (item.className) {
        menuItem.className = `${menuItem.className} ${item.className}`
      }
      img.addEventListener('click', () => {
        this.hideContextMenu()
        if (item.callback) {
          item.callback(this._activeData)
        } else {
          this.addNode({
            sourceId: this._activeData.id,
            x: this._activeData.x,
            y: this._activeData.y,
            properties: item.properties,
            type: item.type,
          })
        }
      })
      menuItem.appendChild(img)
      menus.appendChild(menuItem)
    })
    this.__menuDOM.innerHTML = ''
    this.__menuDOM.appendChild(menus)
    this.showMenu()
  }
  showMenu() {
    if (!this.getContextMenuPosition()) {
      return
    }
    const [x, y] = this.getContextMenuPosition()
    this.__menuDOM.style.display = 'flex'
    this.__menuDOM.style.top = `${y}px`
    this.__menuDOM.style.left = `${x + 10}px`
    this.container.appendChild(this.__menuDOM)
    // 菜单显示的时候，监听删除，同时隐藏
    !this.isShow &&
      this.lf.on(
        'node:delete,edge:delete,node:drag,graph:transform',
        this.listenDelete,
      )
    this.isShow = true
  }

  listenDelete = () => {
    this.hideContextMenu()
  }
}

ContextPad.pluginName = 'contextPad'

export { ContextPad }
