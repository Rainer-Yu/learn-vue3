import { isObject } from '../../shared/index'
import { track, trigger } from './effect'
import {
    reactive,
    reactiveMap,
    readonly,
    readonlyMap,
    shallowReactiveMap,
    shallowReadonlyMap,
    Target
} from './reactive'
import { ReactivityFlags } from './enumeration'
import { isRef, unref } from './ref'

type ReactiveGetter = <T extends object>(
    target: T & Target,
    key: PropertyKey,
    receiver?: any
) => T
type ReactiveSetter = <T extends object>(
    target: T & Target,
    key: PropertyKey,
    value: any,
    receiver?: any
) => boolean

const reactvieGet = createGetter()
const reactvieSet = createSetter()
/** reactive 拦截方法 */
export const reactiveHandlers: ProxyHandler<object> = {
    get: reactvieGet,
    set: reactvieSet
}

const shallowReactiveGet = createGetter(false, true)
const shallowReactiveSet = reactvieSet
/** shallowReactive 拦截方法 */
export const shallowReactiveHandlers: ProxyHandler<object> = {
    get: shallowReactiveGet,
    set: shallowReactiveSet
}

const readonlyGet = createGetter(true)
const readonlySet = readonlySetter
/** readonly 拦截方法 */
export const readonlyHandlers: ProxyHandler<object> = {
    get: readonlyGet,
    set: readonlySet
}

const shallowReadonlyGet = createGetter(true, true)
const shallowReadonlySet = readonlySetter
/** shallowReadonly 拦截方法 */
export const shallowReadonlyHandlers: ProxyHandler<object> = {
    get: shallowReadonlyGet,
    set: shallowReadonlySet
}

export const shallowUnwrapRefHandlers: ProxyHandler<any> = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, newValue, receiver) => {
        const oldValue = Reflect.get(target, key, receiver)
        if (isRef(oldValue) && !isRef(newValue)) {
            oldValue.value = newValue
            return true
        } else {
            return Reflect.set(target, key, newValue, receiver)
        }
    }
}

/**
 * 创建proxy对象的get方法
 * @param isReadonly
 */
function createGetter(
    isReadonly: boolean = false,
    shallow: boolean = false
): ReactiveGetter {
    return (target, key, receiver) => {
        // isReactive和isReadonly 检测 不是readonly的就是reactive
        if (key === ReactivityFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactivityFlags.IS_READONLY) {
            return isReadonly
        } else if (
            key === ReactivityFlags.RAW &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                    ? shallowReactiveMap
                    : reactiveMap
                ).get(target)
        ) {
            return target
        }

        const res = Reflect.get(target, key, receiver)

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
 * 创建非readoly Proxy对象的 set 方法
 */
function createSetter(): ReactiveSetter {
    // reactive创建的代理对象 触发 set 操作时 触发依赖执行
    return (target, key, value, receiver) => {
        const res = Reflect.set(target, key, value, receiver)
        // 触发依赖执行
        trigger(target, key)
        return res
    }
}
/**
 * readoly Proxy对象的 set 方法
 */
function readonlySetter<T extends object>(target: T, key: PropertyKey): boolean {
    // readonly创建的代理对象, 触发 set 操作时控制台进行警告提示
    console.warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
    )
    return true
}
