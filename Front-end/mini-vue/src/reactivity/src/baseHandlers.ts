import { track, trigger } from './effect'

type ReactiveGetter = <T extends object>(target: T, key: string | symbol) => T
type ReactiveSetter = <T extends object>(
    target: T,
    key: string | symbol,
    value: any
) => boolean

const reactvieGet = createGetter()
const reactvieSet = createSetter()
const readonlyGet = createGetter(true)
const readonlySet = createSetter(true)

export const mutableHandlers: ProxyHandler<object> = {
    get: reactvieGet,
    set: reactvieSet
}
export const readonlyHandlers: ProxyHandler<object> = {
    get: readonlyGet,
    set: readonlySet
}

/**
 * 创建proxy对象的get方法
 * @param isReadonly
 */
function createGetter(isReadonly: boolean = false): ReactiveGetter {
    return (target, key) => {
        const res = Reflect.get(target, key)

        // 不是 readonly时进行依赖收集
        if (!isReadonly) {
            track(target, key)
        }

        return res
    }
}
/**
 * 创建proxy对象的set 方法
 */
function createSetter(isReadonly: boolean = false): ReactiveSetter {
    if (isReadonly) {
        return (target, key) => {
            console.warn(
                `Set operation on key "${String(key)}" failed: target is readonly.`,
                target
            )
            return true
        }
    } else {
        return (target, key, value) => {
            const res = Reflect.set(target, key, value)
            // 触发依赖执行
            trigger(target, key)
            return res
        }
    }
}
