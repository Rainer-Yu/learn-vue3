import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
type Target = {
    [ReactiveFlags.IS_REACTIVE]?: boolean
}

/**
 * 创建并返回一个响应式对象
 * @param target
 */
export function reactive<T extends object>(target: T): T {
    return createReactiveObject(target, mutableHandlers)
}

/**
 * 返回原始对象的只读代理
 * @param target
 */
export function readonly<T extends object>(target: T): T {
    return createReactiveObject(target, readonlyHandlers)
}

/**
 * 创建反应对象
 * @param raw 原始对象
 * @param baseHandlers Proxy处理函数的对象
 */
function createReactiveObject<T extends object>(
    raw: T,
    baseHandlers: ProxyHandler<any>
) {
    return new Proxy<T>(raw, baseHandlers)
}

export function isReactive(value: unknown): boolean {
    return !!(value as Target)[ReactiveFlags.IS_REACTIVE]
}
