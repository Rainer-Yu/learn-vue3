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

// Ref实现类
class RefImpl<T> {
    private _value: T
    public dep?: Dep = void 0 /* dep 只会在读取ref的值时才会进行初始化 */
    private _rawValue: T
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
