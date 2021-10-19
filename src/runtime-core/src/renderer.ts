import { isFunction, isObject, isOn, isString, ShapeFlags } from '../../shared/index'
import {
    ComponentInternalInstance,
    createComponentInstance,
    setupComponent
} from './component'
import { VNode, VNodeArrayChildren } from './vnode'

/** render */
export function render(vnode: VNode, container: any) {
    // 调用 patch 方法
    patch(vnode, container)
}

/** 处理各种vnode */
function patch(vnode: VNode, container: any) {
    if (isString(vnode.type)) {
        // 处理Element类型的vnode
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        // 处理组件vnode
        processComponent(vnode, container)
    }
}

/** 处理Element */
const processElement = (vnode: VNode, container: any) =>
    mountElement(vnode, container)
/** 处理组件 */
const processComponent = (vnode: VNode, container: any) =>
    mountComponent(vnode, container)

/** 挂载Element */
const mountElement = (vnode: VNode, container: Element) => {
    // 根据tagName创建HTML节点
    const el: Element = (vnode.el = document.createElement(vnode.type as string))

    const { children, props } = vnode
    // 处理 props 通过循环给DOM节点设置属性
    for (const key in props) {
        // 挂载事件
        if (isOn(key) && isFunction(props[key])) {
            el.addEventListener(key.slice(2).toLowerCase(), props[key])
        } else {
            el.setAttribute(key, props[key])
        }
    }

    // 处理子节点 子节点可能是 TEXT_CHILDREN 或 ARRAY_CHILDREN
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 获取el节点及其后代的文本内容并把子节点替换为文本
        el.textContent = children as string
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children as VNodeArrayChildren, el)
    }
    // 将el节点插入到容器节点的子末位
    container.append(el)
}

/** 挂载子节点 */
const mountChildren = (vnodeArray: VNodeArrayChildren, container: any) =>
    vnodeArray.forEach((vnode) => patch(vnode as VNode, container))

/** 挂载组件 */
const mountComponent = (initialVNode: VNode, container: any) => {
    const instance = createComponentInstance(initialVNode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

/** setupRenderEffect */
function setupRenderEffect(instance: ComponentInternalInstance, container: any) {
    const subTree = instance.render!.call(instance.proxy) as VNode
    patch(subTree, container)
    instance.vnode.el = subTree.el
}
