import { isArray, ShapeFlags } from '../../shared/index'
import { ComponentInternalInstance } from './component'
import { VNodeNormalizedChildren } from './vnode'

export function initSlots(
    instance: ComponentInternalInstance,
    children: VNodeNormalizedChildren
) {
    const { vnode } = instance
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
}
function normalizeObjectSlots(children: any, slots: any) {
    for (const key in children) {
        const value = children[key]
        slots[key] = (props: any) => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue(value: any) {
    return Array.isArray(value) ? value : [value]
}
