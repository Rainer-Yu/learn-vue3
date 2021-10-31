import { Slots } from '../component'
import { createVNode, Fragment } from '../vnode'

export function renderSlots(slots: Slots, slotName: string, props: any) {
    const slot = slots?.[slotName]
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props))
        }
    }
}
