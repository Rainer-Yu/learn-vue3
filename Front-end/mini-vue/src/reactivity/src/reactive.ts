import {
    reactiveHandlers,
    readonlyHandlers,
    shallowReadonlyHandlers,
    shallowReactiveHandlers
} from './baseHandlers'

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}
type Target = {
    [ReactiveFlags.IS_REACTIVE]?: boolean
    [ReactiveFlags.IS_READONLY]?: boolean
}

/**
 * 创建并返回一个响应式对象
 * @param raw
 */
export function reactive<T extends object>(raw: T): T {
    return createReactiveObject(raw, reactiveHandlers)
}
export function shallowReactive<T extends object>(raw: T): T {
    return createReactiveObject(raw, shallowReactiveHandlers)
}

/**
 * 返回原始对象的只读代理
 * @param raw
 */
export function readonly<T extends object>(raw: T): T {
    return createReactiveObject(raw, readonlyHandlers)
}
export function shallowReadonly<T extends object>(raw: T): T {
    return createReactiveObject(raw, shallowReadonlyHandlers)
}

/**
 * 创建反应对象
 * @param target 原始对象
 * @param baseHandlers Proxy处理函数的对象
 */
function createReactiveObject<T extends object>(
    target: T,
    baseHandlers: ProxyHandler<any>
) {
    return new Proxy<T>(target, baseHandlers)
}

export function isReactive(value: unknown): boolean {
    return !!(value as Target)[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(value: unknown): boolean {
    return !!(value as Target)[ReactiveFlags.IS_READONLY]
}
export function isProxy(value: unknown): boolean {
    return isReactive(value) || isReadonly(value)
}
