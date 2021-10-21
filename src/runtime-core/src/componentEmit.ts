import { camelize, toHandlerKey } from '../../shared/index'
import { ComponentInternalInstance } from './component'

export function emit(
    instance: ComponentInternalInstance,
    eventName: string,
    ...args: any
) {
    const { props } = instance
    const handlerName = toHandlerKey(camelize(eventName))
    const handler = props[handlerName] as Function
    handler && handler(...args)
}
