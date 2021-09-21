import { Dep } from './dep'
import { ReactiveEffect, triggerEffects } from './effect'
import { trackRefValue } from './ref'

type ComputedGetter<T> = (...args: any[]) => T
type ComputedSetter<T> = (v: T) => void
type ComputedRef<T> = {
    readonly value: T
}

class ComputedRefImpl<T> {
    private _value!: T /* 缓存 */
    private _cached: boolean = false /* 是否应景缓存根据依赖 计算出的最新值 */
    public dep?: Dep = void 0 /* dep 只会在读取ref的值时才会进行初始化 */
    public readonly __v_isRef: boolean = true /* ref类型标志 */
    public readonly effect: ReactiveEffect<T> /* ComputedRefImpl实例的副作用函数 */

    constructor(public getter: ComputedGetter<T>) {
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
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T> {
    return new ComputedRefImpl(getter)
}
