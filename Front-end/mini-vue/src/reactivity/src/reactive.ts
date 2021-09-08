import {track, trigger} from "./effect"

export function reactive<T extends object>(raw:T):T{    /* 得到什么类型 返回什么类型 */

    return new Proxy(raw,{
        get(target, key){
            const res = Reflect.get(target, key)

            // 依赖收集
            track(target, key)
            return res
        },
        set(target, key, value){
            const res = Reflect.set(target, key, value)

            // 触发依赖执行
            trigger(target, key)
            return res
        }
    })
}