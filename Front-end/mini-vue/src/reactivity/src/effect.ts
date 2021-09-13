import { extend } from '../../shared'
/**
 * TS 类型
 */
type Dep = Set<ReactiveEffect | undefined>
type KeyToDepMap = Map<any, Dep>
export type ReactiveEffectOptions = {
    scheduler?: EffectScheduler
}
type EffectScheduler = (...args: any[]) => any
export type ReactiveEffectRunner<T = any> = {
    (): T
    effect: ReactiveEffect
}

/* 全局变量: 当前 effect */
let activeEffect: ReactiveEffect | undefined

class ReactiveEffect<T = any> {
    deps: Dep[] = []
    active = true /* 是否没有被stop() */
    constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null
    ) {}

    run() {
        activeEffect = this
        return this.fn()
    }

    stop() {
        /* 如果没有被stop 则清空对应依赖 如果已经stop过 跳过依赖清空过程 */
        if (this.active) {
            cleanupEffect(this)
            this.active = false
        }
    }
}
/**
 * 从依赖中删除effect
 */
function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect)
    })
}
/**
 * 副作用函数
 * @param fn 要执行的副作用 注意: 默认自执行一次 fn
 */
export function effect<T = any>(
    fn: () => T,
    options?: ReactiveEffectOptions
): ReactiveEffectRunner {
    const _effect = new ReactiveEffect(fn)

    if (options) {
        extend(_effect, options)
    }

    _effect.run()
    /* 返回当前 effect对应的的run()方法 */
    const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
    runner.effect = _effect
    return runner
}

export function stop(runner: ReactiveEffectRunner) {
    runner.effect.stop()
}

// REVIEW  这一段依赖收集的逻辑关系 需要多复习
const targetMap = new WeakMap<object, KeyToDepMap>()
/**
 * 依赖收集
 */
export function track(target: object, key: unknown) {
    /* 依赖对应关系: target -> key -> dep */
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map() as KeyToDepMap))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set() as Dep))
    }
    dep.add(activeEffect!)
    /* 反向收集 dep */
    activeEffect?.deps.push(dep)
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
