import { Component, Data } from './component'

export type VNodeTypes = string | VNode | Component
export type VNode = {
    type: VNodeTypes
    props: { [key: string]: any } | null
    children: VNodeChildren | null
    el: Element | null
}
type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>
export type VNodeChildren = VNodeChildAtom | VNodeArrayChildren

/** 创建虚拟节点 */
export const createVNode = (
    type: string | Component,
    props: Data | null = null,
    children: VNodeChildren = null
): VNode => ({
    type,
    props,
    children,
    el: null
})
