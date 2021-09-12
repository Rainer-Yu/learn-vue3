import { extend } from '../../shared'

type Dep = Set<ReactiveEffect | undefined>
type KeyToDepMap = Map<any, Dep>
let activeEffect: ReactiveEffect | undefined
interface ReactiveEffectOptions {
    scheduler?: EffectScheduler
}
type EffectScheduler = (...args: any[]) => any

class ReactiveEffect<T = any> {
    constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) {}

    run() {
        activeEffect = this
        return this.fn()
    }
}
/**
 * 副作用函数
 * @param fn 要执行的副作用 注意: 默认自执行一次 fn
 */
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
    const _effect = new ReactiveEffect(fn)

    if (options) {
        extend(_effect, options)
    }

    _effect.run()
    /* 返回当前 effect对应的的run()方法 */
    return _effect.run.bind(_effect)
}

// REVIEW  这一段依赖收集的逻辑关系 需要多复习
const targetMap = new WeakMap<object, KeyToDepMap>()
/**
 * 依赖收集
 * @param target
 * @param key
 */
export function track(target: object, key: unknown) {
    /* 依赖对应关系: target -> key -> dep */
    // anc
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map() as KeyToDepMap))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set() as Dep))
    }
    dep.add(activeEffect)
}

/**
 * 触发依赖执行
 */
export function trigger(target: object, key: unknown) {
    let depsMap = targetMap.get(target)

    if (!depsMap) {
        return
    }

    let dep = depsMap.get(key)

    if (dep && dep.size > 0) {
        dep.forEach((effect) => {
            if (!effect) {
                return
            } else if (effect.scheduler) {
                effect.scheduler()
            } else {
                effect.run()
            }
        })
    }
}
