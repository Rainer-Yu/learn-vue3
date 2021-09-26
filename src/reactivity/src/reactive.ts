import {
    reactiveHandlers,
    readonlyHandlers,
    shallowReadonlyHandlers,
    shallowReactiveHandlers
} from './baseHandlers'
import { ReactivityFlags } from './enumeration'

export type Target = {
    [ReactivityFlags.IS_REACTIVE]?: boolean
    [ReactivityFlags.IS_READONLY]?: boolean
    [ReactivityFlags.RAW]?: any
}

export type ProxyToRawWeakMap = WeakMap<Target, any>
// 储存reactive和其原始对象对应关系的 全局WeakMap
export const reactiveMap: ProxyToRawWeakMap = new WeakMap<Target, any>()
export const shallowReactiveMap: ProxyToRawWeakMap = new WeakMap<Target, any>()
export const readonlyMap: ProxyToRawWeakMap = new WeakMap<Target, any>()
export const shallowReadonlyMap: ProxyToRawWeakMap = new WeakMap<Target, any>()
/**
 * 创建并返回一个响应式对象
 * @param raw
 */ /* TS重载 */
export function reactive<T extends object>(target: T): T
export function reactive(raw: object) {
    return createReactiveObject(raw, reactiveHandlers, reactiveMap)
}
export function shallowReactive<T extends object>(raw: T): T {
    return createReactiveObject(raw, shallowReactiveHandlers, shallowReactiveMap)
}

/**
 * 返回原始对象的只读代理
 * @param raw
 */
export function readonly<T extends object>(raw: T): T {
    return createReactiveObject(raw, readonlyHandlers, readonlyMap)
}
export function shallowReadonly<T extends object>(raw: T): T {
    return createReactiveObject(raw, shallowReadonlyHandlers, shallowReadonlyMap)
}

/**
 * 创建反应对象
 * @param target 原始对象
 * @param baseHandlers Proxy处理函数的对象
 */
function createReactiveObject<T extends object>(
    target: T,
    baseHandlers: ProxyHandler<any>,
    proxyMap: ProxyToRawWeakMap
) {
    // target 已经具有相应的 Proxy
    const existingProxy = proxyMap.get(target)
    if (existingProxy) {
        return existingProxy
    }
    const proxy = new Proxy<T>(target, baseHandlers)
    proxyMap.set(target, proxy)
    return proxy
}

export function isReactive(value: unknown): boolean {
    return !!(value as Target)[ReactivityFlags.IS_REACTIVE]
}
export function isReadonly(value: unknown): boolean {
    return !!(value as Target)[ReactivityFlags.IS_READONLY]
}
export function isProxy(value: unknown): boolean {
    return isReactive(value) || isReadonly(value)
}
export function toRaw<T>(value: T): T {
    const raw = value && (value as Target)[ReactivityFlags.RAW]
    return raw ? toRaw(raw) : value
}
