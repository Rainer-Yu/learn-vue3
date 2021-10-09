import { isArray, isObject, isString } from '../../shared/index'
import {
    ComponentInternalInstance,
    createComponentInstance,
    setupComponent
} from './component'

/**  */
export function render(vnode: any, container: any) {
    // 调用 patch 方法
    patch(vnode, container)
}

/** 处理各种vnode */
function patch(vnode: any, container: any) {
    if (isString(vnode.type)) {
        // 处理Element类型的vnode
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        // 处理组件vnode
        processComponent(vnode, container)
    }
}

/** 处理Element */
const processElement = (vnode: any, container: any) => mountElement(vnode, container)
/** 处理组件 */
const processComponent = (vnode: any, container: any) =>
    mountComponent(vnode, container)

/** 挂载Element */
const mountElement = (vnode: any, container: Element) => {
    const el: Element = document.createElement(vnode.type)

    const { children, props } = vnode
    // 处理 props
    for (const key in props) {
        el.setAttribute(key, props[key])
    }

    // 处理子节点 子节点可能是 string字符串 或 array数组
    if (isString(children)) {
        el.textContent = children
    } else if (isArray(children)) {
        mountChildren(children, el)
    }

    container.append(el)
}
/** 挂载子节点 */
const mountChildren = (vnodeArray: any[], container: any) =>
    vnodeArray.forEach((vnode) => patch(vnode, container))
/** 挂载组件 */
const mountComponent = (vnode: any, container: any) => {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: ComponentInternalInstance, container: any) {
    const subTree = instance.render.call(instance.proxy)
    patch(subTree, container)
}
