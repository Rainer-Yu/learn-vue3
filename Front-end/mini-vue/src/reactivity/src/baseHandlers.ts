import { isObject } from '../../shared'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'

type ReactiveGetter = <T extends object>(target: T, key: string | symbol) => T
type ReactiveSetter = <T extends object>(
    target: T,
    key: string | symbol,
    value: any
) => boolean

const reactvieGet = createGetter()
const reactvieSet = createSetter()
const shallowReactiveGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const readonlySet = createSetter(true)
const shallowReadonlyGet = createGetter(true, true)

export const reactiveHandlers: ProxyHandler<object> = {
    get: reactvieGet,
    set: reactvieSet
}
export const shallowReactiveHandlers: ProxyHandler<object> = {
    get: shallowReactiveGet,
    set: reactvieSet
}
export const readonlyHandlers: ProxyHandler<object> = {
    get: readonlyGet,
    set: readonlySet
}
export const shallowReadonlyHandlers: ProxyHandler<object> = {
    get: shallowReadonlyGet,
    set: readonlySet
}

/**
 * 创建proxy对象的get方法
 * @param isReadonly
 */
function createGetter(
    isReadonly: boolean = false,
    shallow: boolean = false
): ReactiveGetter {
    return (target, key) => {
        // isReactive和isReadonly 检测 不是readonly的就是reactive
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        const res = Reflect.get(target, key)

        // 不执行嵌套对象的深度readonly转换
        if (shallow) {
            return res
        }

        // 实现 reactive和readonly 的嵌套对象转换
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        // 当不是readonly创建的代理对象时(reactive) 进行依赖收集
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
        // 如果是readonly创建的代理对象
        // 触发 set 操作时控制台进行警告提示
        return (target, key) => {
            console.warn(
                `Set operation on key "${String(key)}" failed: target is readonly.`,
                target
            )
            return true
        }
    } else {
        // 如果是reactive创建的代理对象 触发 set 操作时 触发依赖执行
        return (target, key, value) => {
            const res = Reflect.set(target, key, value)
            // 触发依赖执行
            trigger(target, key)
            return res
        }
    }
}
