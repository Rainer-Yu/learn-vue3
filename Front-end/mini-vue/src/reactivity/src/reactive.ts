export function reactive<T extends object>(raw:T):T{    /* 得到什么类型 返回什么类型 */

    return new Proxy(raw,{
        get(target, key){
            const res = Reflect.get(target, key)

            // TODO 依赖收集
            return res
        },
        set(target, key, value){
            const res = Reflect.set(target, key, value)

            // TODO 触发依赖执行
            return res
        }
    })
}