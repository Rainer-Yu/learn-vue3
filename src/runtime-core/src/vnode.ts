import { extend, isFunction, isString, ShapeFlags } from '../../shared/index'
import { Component, Data } from './component'

export type VNodeTypes = string | VNode | Component

export interface VNode {
    type: VNodeTypes
    props: Record<string, any> | null
    children: VNodeChildren | null
    el: Element | null
    shapeFlag: ShapeFlags
}

type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>
export type VNodeChildren = VNodeChildAtom | VNodeArrayChildren

/** 创建虚拟节点 */
export const createVNode = (
    type: string | Component,
    props: Data | null = null,
    children: VNodeChildren = null,
    shapeFlag: ShapeFlags = initShapFlag(type)
): VNode => {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag
    }

    /* 子节点是文本时 标为 TEXT_CHILDREN 否则视为 ARRAY_CHILDREN */
    vnode.shapeFlag = isString(children)
        ? ShapeFlags.TEXT_CHILDREN
        : ShapeFlags.ARRAY_CHILDREN

    return vnode
}
/** 初始化VNode的默认shapeFlags */
const initShapFlag = (type: VNodeTypes) =>
    isString(type)
        ? ShapeFlags.ELEMENT
        : isFunction(type)
        ? ShapeFlags.FUNCTIONAL_COMPONENT
        : ShapeFlags.STATEFUL_COMPONENT
