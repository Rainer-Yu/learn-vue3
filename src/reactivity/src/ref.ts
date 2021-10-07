import { hasChanged, isArray } from '../../shared/index'
import { shallowUnwrapRefHandlers } from './baseHandlers'
import { createDep, Dep } from './dep'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { isProxy, toReactive } from './reactive'
import { ReactivityFlags } from './enumeration'

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

// REVIEW
export type UnwrapRef<T> = T extends Ref<infer V>
    ? UnwrapRefSimple<V>
    : UnwrapRefSimple<T>
// REVIEW
export type UnwrapRefSimple<T> = T extends
    | Function
    //   | CollectionTypes
    //   | BaseTypes
    | Ref
    ? //   | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
      T
    : T extends Array<any>
    ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
    : T extends object
    ? {
          [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>
      }
    : T

// Ref实现类
class RefImpl<T> {
    private _rawValue: T
    private _value: T
    public dep?: Dep = void 0 /* dep 只会在读取ref的值时才会进行初始化 */
    public readonly [ReactivityFlags.IS_REF]: boolean = true /* ref类型标志 */
    public readonly [ReactivityFlags.IS_READONLY]: boolean = false /* 是否只读标志 */

    constructor(value: T, private readonly _shallow: boolean) {
        // 如果传入的是一个对象,则用reactive将此对象代理成响应式
        this._rawValue = value
        this._value = _shallow ? value : toReactive(value)
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
            this._value = this._shallow ? newValue : toReactive(newValue)
            this.dep && triggerEffects(this.dep)
        }
    }
}

/** 收集ref的依赖 */
export function trackRefValue(ref: RefBase<any>) {
    // 判断是否应该进行进行依赖收集
    // 如果这个ref被收集过依赖并且对应的effect没有被stop过的话,进行依赖收集
    if (!isTracking()) return
    // 如果ref对应的dep没有初始化,就对其进行初始化
    ref.dep || (ref.dep = createDep())
    trackEffects(ref.dep)
}

/** REVIEW 为源响应式对象上的某个 property 新创建一个 ref */
class ObjectRefImpl<T extends object, K extends keyof T> {
    public readonly [ReactivityFlags.IS_REF]: boolean = true

    constructor(private readonly _rawObject: T, private readonly _key: K) {}

    get value() {
        return this._rawObject[this._key]
    }
    set value(newVal) {
        this._rawObject[this._key] = newVal
    }
}

/**
 * 创建一个 Ref 变量
 */ /* TS重载 */
export function ref<T extends object>(raw: T): Ref<T>
export function ref<T>(raw: T): Ref<T>
export function ref<T = any>(): Ref<T | undefined>
export function ref(raw?: unknown) {
    return createRef(raw)
}

export function shallowRef<T extends object>(value: T): T extends Ref ? T : Ref<T>
export function shallowRef<T>(value: T): Ref<T>
export function shallowRef<T = any>(): Ref<T | undefined>
export function shallowRef(raw?: unknown) {
    return createRef(raw, true)
}

const createRef = (rawValue: unknown, shallow: boolean = false) =>
    isRef(rawValue) ? rawValue : new RefImpl(rawValue, shallow)

/** 检查变量是否为一个 ref 对象 */
export const isRef = <T>(value: Ref<T> | unknown): value is Ref<T> =>
    !!(value && (value as any)[ReactivityFlags.IS_REF] === true)

/** 如果参数是一个 ref，则返回内部值，否则返回参数本身 */
export const unref = <T>(ref: Ref<T> | T): T => (isRef(ref) ? ref.value : ref)

/** REVIEW toRef 为源响应式对象上的某个 property 新创建一个 ref(是ref的直接返回) */
export type ToRef<T> = [T] extends [Ref] ? T : Ref<UnwrapRef<T>>
export const toRef = <T extends object, K extends keyof T>(
    rawObject: T,
    key: K
): ToRef<T[K]> => {
    const val = rawObject[key]
    return isRef(val) ? val : (new ObjectRefImpl(rawObject, key) as any)
}

/** REVIEW toRefs */
export type ToRefs<T = any> = {
    [K in keyof T]: T[K] extends Ref ? T[K] : Ref<UnwrapRef<T[K]>>
}
export function toRefs<T extends object>(object: T): ToRefs<T> {
    if (!isProxy(object)) {
        console.warn(`toRefs() expects a reactive object but received a plain one.`)
    }
    const ret: any = isArray(object) ? new Array(object.length) : {}
    for (const key in object) {
        ret[key] = toRef(object, key)
    }
    return ret
}

/** proxyRefs 对 object对象中的 ref 进行浅解包 */
export function proxyRefs<T extends object>(objectWithRefs: T): ShallowUnwrapRef<T> {
    return new Proxy(objectWithRefs, shallowUnwrapRefHandlers)
}
