import { isString, shapeFlagMap, ShapeFlags } from '../../shared/index'
import { Component, Data } from './component'

export type VNodeTypes = string | VNode | Component
export type VNode = {
    type: VNodeTypes
    props: { [key: string]: any } | null
    children: VNodeChildren | null
    el: Element | null
    shapeFlag: ShapeFlags
    /**
     * @internal
     */
    setShapeFlag: (flagName: keyof typeof ShapeFlags) => void
    /**
     * @internal
     */
    shapeFlagHas: (flagName: keyof typeof ShapeFlags) => boolean
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
    const vnode = new VNodeFactory(type, props, children, shapeFlag)

    /* 子节点是文本时 标为 TEXT_CHILDREN 否则视为 ARRAY_CHILDREN */
    vnode.setShapeFlag(isString(children) ? 'TEXT_CHILDREN' : 'ARRAY_CHILDREN')

    return vnode
}

/** vnode 工厂类 */
class VNodeFactory implements VNode {
    type: VNodeTypes
    props: { [key: string]: any } | null
    children: VNodeChildren | null
    el: Element | null = null
    shapeFlag: ShapeFlags
    constructor(
        type: string | Component,
        props: Data | null = null,
        children: VNodeChildren = null,
        shapeFlag: ShapeFlags
    ) {
        this.type = type
        this.props = props
        this.children = children
        this.shapeFlag = shapeFlag
    }
    /**
     * 为 shapeFlag 添加xxx标志
     */
    setShapeFlag(flagName: keyof typeof ShapeFlags) {
        this.shapeFlag |= shapeFlagMap[flagName]
    }
    /**
     * shapeFlag 有 xxx 标志
     */
    shapeFlagHas(flagName: keyof typeof ShapeFlags) {
        return !!(this.shapeFlag & shapeFlagMap[flagName])
    }
}
/** 初始化VNode的默认shapeFlags */
const initShapFlag = (type: VNodeTypes) =>
    isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
