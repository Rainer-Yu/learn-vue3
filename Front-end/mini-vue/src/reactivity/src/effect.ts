import { extend } from '../../shared'
/**
 * TS 类型
 */
type Dep = Set<ReactiveEffect | undefined>
type KeyToDepMap = Map<any, Dep>
export type ReactiveEffectOptions = {
    scheduler?: EffectScheduler
    onStop?: () => void
}
type EffectScheduler = (...args: any[]) => any
export type ReactiveEffectRunner<T = any> = {
    (): T
    effect: ReactiveEffect
}

/* 全局变量: 当前 effect */
let activeEffect: ReactiveEffect | undefined
let shouldTrack: boolean = false

class ReactiveEffect<T = any> {
    public deps: Dep[] = []
    /* 是否是活跃的 (没有被stop) */
    public active: boolean = true
    /* effect() options里的onStop函数  */
    public onStop?: () => void
    constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null
    ) {}

    run() {
        /* effect没有stop过 是活跃的 打开依赖收集标志 
        并将全局变量activeEffect 指向当前 effect */
        if (this.active) {
            shouldTrack = true
            activeEffect = this
        }
        /* 运行 fn() 会触发依赖收集 根据依赖收集标志shouldTrack判断是否执行track() */
        const result = this.fn()
        /* effect已经stop的 关闭依赖收集标志 */
        shouldTrack = false
        return result
    }

    stop() {
        /* 如果是活跃的 则清空对应依赖 如果已经stop过 跳过依赖清空过程 */
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

/**
 * 从包含当前effect的依赖(dep)中 清除当前effect 并把effect内的deps清空
 */
function cleanupEffect(effect: ReactiveEffect) {
    /* 从包含当前effect的依赖(dep)中 清除当前effect */
    effect.deps.forEach((dep) => {
        dep.delete(effect)
    })
    /* 清空effect内的deps */
    effect.deps.length = 0
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
/**
 * 停止响应式监听
 * @param runner
 */
export function stop(runner: ReactiveEffectRunner) {
    runner.effect.stop()
}

// REVIEW  这一段依赖收集的逻辑关系 需要多复习
const targetMap = new WeakMap<object, KeyToDepMap>()
/**
 * 依赖收集
 */
export function track(target: object, key: unknown) {
    /* 判断是否进行依赖收集 不需要的直接 return */
    if (!isTracking()) return

    /* 依赖对应关系: target -> key -> dep */
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map() as KeyToDepMap))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set() as Dep))
    }
    /* 已经收集过的依赖 就不需要重复收集了 */
    if (dep.has(activeEffect!)) return

    /* 未收集的依赖 进行收集 并且当前effect进行反向收集 dep */
    dep.add(activeEffect!)
    activeEffect!.deps.push(dep)
}

/**
 * 是否进行依赖收集
 */
export function isTracking() {
    /* 如果activeEffect是 undefined 则跳过依赖收集 */
    /* 如果shouldTrack为false 则跳过依赖收集 */
    return activeEffect !== void 0 && shouldTrack
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
