import { hasChanged, isObject } from '../../shared'
import { createDep, Dep } from './dep'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

type Ref<T = any> = {
    value: T
}
type RefBase<T> = {
    dep?: Dep
    value: T
}
// proxyRefs中 Ref 类型浅解包
export type ShallowUnwrapRef<T> = {
    // 如果 `V` 是`unknown` ，则表示它不是 extend `Ref` 并且是 undefined
    [K in keyof T]: T[K] extends Ref<infer V>
        ? V
        : T[K] extends Ref<infer V> | undefined
        ? unknown extends V
            ? undefined
            : V | undefined
        : T[K]
}

// Ref实现类
class RefImpl<T> {
    private _rawValue: T
    private _value: T
    public dep?: Dep = void 0 /* dep 只会在读取ref的值时才会进行初始化 */
    public readonly __v_isRef: boolean = true /* ref类型标志 */

    constructor(value: T) {
        // 如果传入的是一个对象,则用reactive将此对象代理成响应式
        this._rawValue = value
        this._value = convertObjectToReactive(value)
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        // 新值与旧值不相等时,才会对ref执行重新赋值操作
        if (hasChanged(this._rawValue, newValue)) {
            // 先修改value,再触发依赖
            this._rawValue = newValue
            // 如果传入的是一个对象,则用reactive将此对象代理成响应式
            this._value = convertObjectToReactive(newValue)
            this.dep && triggerEffects(this.dep)
        }
    }
}
/** 将对象类型的ref.value用reactive代理 */
const convertObjectToReactive = <T extends unknown>(value: T): T =>
    isObject(value) ? reactive(value) : value

/** 收集ref的依赖 */
function trackRefValue(ref: RefBase<any>) {
    // 判断是否应该进行进行依赖收集
    // 如果这个ref被收集过依赖并且对应的effect没有被stop过的话,进行依赖收集
    if (!isTracking()) return
    // 如果ref对应的dep没有初始化,就对其进行初始化
    ref.dep || (ref.dep = createDep())
    trackEffects(ref.dep)
}

/**
 * 创建一个 Ref 变量
 */ /* TS重载 */
export function ref<T extends object>(raw: T): Ref<T>
export function ref<T>(raw: T): Ref<T>
export function ref<T = any>(): Ref<T | undefined>
export function ref(raw?: unknown) {
    return new RefImpl(raw)
}

/** 检查变量是否为一个 ref 对象 */
export const isRef = <T>(value: Ref<T> | unknown): value is Ref<T> =>
    !!(value as any).__v_isRef === true

/** 如果参数是一个 ref，则返回内部值，否则返回参数本身 */
export const unref = <T>(ref: Ref<T> | T): T => (isRef(ref) ? ref.value : ref)

/** proxyRefs 对 object对象中的 ref 进行浅解包 */
export function proxyRefs<T extends object>(objectWithRefs: T): ShallowUnwrapRef<T> {
    return new Proxy(objectWithRefs, shallowUnwrapRefHandlers)
}

const shallowUnwrapRefHandlers: ProxyHandler<any> = {
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
