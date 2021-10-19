import { ComponentInternalInstance } from './component'

export function initProps(
    instance: ComponentInternalInstance,
    rawProps: object | null
) {
    instance.props = rawProps || {}
}
