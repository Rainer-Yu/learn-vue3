import { createVNode } from './vnode'

/** 返回一个`虚拟节点` */
export function h(type: any, props?: any, children?: any) {
    return createVNode(type, props, children)
}
