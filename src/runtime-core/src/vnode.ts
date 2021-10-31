import { isFunction, isString, ShapeFlags } from '../../shared/index'
import { Component, Data } from './component'

export type VNodeTypes = string | VNode | Component | typeof Fragment

export interface VNode {
    type: VNodeTypes
    props: Record<string, any> | null
    children: VNodeNormalizedChildren
    el: Element | null
    shapeFlag: ShapeFlags
}

type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>
export type VNodeChildren = VNodeChildAtom | VNodeArrayChildren
export type VNodeNormalizedChildren =
    | string
    | VNodeArrayChildren
    //   | RawSlots
    | null

export const Fragment = Symbol('Fragment')
/** 创建虚拟节点 */
export const createVNode = (
    type: VNodeTypes,
    props: Data | null = null,
    children: VNodeNormalizedChildren = null,
    shapeFlag: ShapeFlags = initShapFlag(type)
): VNode => {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag
    } as VNode

    /* 子节点是文本时 标为 TEXT_CHILDREN 否则视为 ARRAY_CHILDREN */
    vnode.shapeFlag |= isString(children)
        ? ShapeFlags.TEXT_CHILDREN
        : ShapeFlags.ARRAY_CHILDREN

    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode
}
/** 初始化VNode的默认shapeFlags */
const initShapFlag = (type: VNodeTypes) =>
    isString(type)
        ? ShapeFlags.ELEMENT
        : isFunction(type)
        ? ShapeFlags.FUNCTIONAL_COMPONENT
        : ShapeFlags.STATEFUL_COMPONENT
