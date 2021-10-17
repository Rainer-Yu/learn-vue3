import { extend } from './base'

export const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1,
    STATEFUL_COMPONENT = 1 << 2,
    TEXT_CHILDREN = 1 << 3,
    ARRAY_CHILDREN = 1 << 4,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
export const shapeFlagMap = extend(Object.create(null), {
    ELEMENT: ShapeFlags.ELEMENT,
    FUNCTIONAL_COMPONENT: ShapeFlags.FUNCTIONAL_COMPONENT,
    STATEFUL_COMPONENT: ShapeFlags.STATEFUL_COMPONENT,
    COMPONENT: ShapeFlags.COMPONENT,
    TEXT_CHILDREN: ShapeFlags.TEXT_CHILDREN,
    ARRAY_CHILDREN: ShapeFlags.ARRAY_CHILDREN
})
