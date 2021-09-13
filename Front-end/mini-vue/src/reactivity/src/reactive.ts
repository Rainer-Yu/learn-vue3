import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export function reactive<T extends object>(target: T): T {
    return createReactiveObject(target, mutableHandlers)
}

export function readonly<T extends object>(target: T): T {
    return createReactiveObject(target, readonlyHandlers)
}

function createReactiveObject<T extends object>(
    raw: T,
    baseHandlers: ProxyHandler<any>
) {
    return new Proxy<T>(raw, baseHandlers)
}
