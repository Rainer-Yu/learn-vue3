import { isFunction } from '../../shared/index'
import { Dep } from './dep'
import { ReactiveEffect, triggerEffects } from './effect'
import { ReactivityFlags } from './enumeration'
import { trackRefValue } from './ref'

type ComputedGetter<T> = (...args: any[]) => T
type ComputedSetter<T> = (v: T) => void
export type WritableComputedOptions<T> = {
    get: ComputedGetter<T>
    set: ComputedSetter<T>
}

type ComputedRef<T> = {
    readonly value: T
}
type WritableComputedRef<T> = {
    value: T
}

class ComputedRefImpl<T> {
    private _value!: T /* 缓存 */
    private _cached: boolean = false /* 是否已经缓存过 根据依赖计算出的最新值 */
    public dep?: Dep = void 0 /* dep 只会在读取ref的值时才会进行初始化 */
    public readonly [ReactivityFlags.IS_REF]: boolean = true /* ref类型标志 */
    public readonly [ReactivityFlags.IS_READONLY]: boolean /* 是否只读标志 */
    public readonly effect: ReactiveEffect<T> /* ComputedRefImpl实例的副作用函数 */

    constructor(
        public getter: ComputedGetter<T>,
        private readonly _setter: ComputedSetter<T>,
        isReadonly: boolean
    ) {
        this[ReactivityFlags.IS_READONLY] = isReadonly
        this.effect = new ReactiveEffect(getter, () => {
            if (this._cached) {
                this._cached = false
                this.dep && triggerEffects(this.dep)
            }
        })
    }
    get value() {
        trackRefValue(this)
        if (!this._cached) {
            this._cached = true
            this._value = this.effect.run()!
        }
        return this._value
    }

    set value(newValue: T) {
        this._setter(newValue)
    }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
    options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
    getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
    let getter: ComputedGetter<T>
    let setter: ComputedSetter<T>
    let isReadonly: boolean = true
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions
        setter = () => {
            console.warn('Write operation failed: computed value is readonly')
        }
    } else {
        isReadonly = !getterOrOptions.set
        getter = getterOrOptions.get
        setter = isReadonly
            ? () => {
                  console.warn('Write operation failed: computed value is readonly')
              }
            : getterOrOptions.set
    }
    return new ComputedRefImpl(getter, setter, isReadonly)
}
