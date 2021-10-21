import { ComponentInternalInstance, Data } from './component'

export function initProps(
    instance: ComponentInternalInstance,
    rawProps: Data | null
) {
    instance.props = rawProps || {}
}
