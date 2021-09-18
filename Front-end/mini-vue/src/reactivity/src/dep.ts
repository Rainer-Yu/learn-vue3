import { ReactiveEffect } from './effect'

export type Dep = Set<ReactiveEffect>

/** 创建并初始化一个空的 `dep: Set<ReactiveEffect>` */
export function createDep(effects?: ReactiveEffect[]): Dep {
    return new Set<ReactiveEffect>(effects)
}
