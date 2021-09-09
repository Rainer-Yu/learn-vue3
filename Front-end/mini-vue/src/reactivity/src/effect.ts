type Dep = Set<ReactiveEffect | undefined>
type KeyToDepMap = Map<any, Dep>
let activeEffect: ReactiveEffect | undefined
class ReactiveEffect<T = any>{
    private _fn: ()=>T
    constructor(fn: ()=>T){
        this._fn=fn
    }
    run(){
        activeEffect=this
       return this._fn()
    }
}
/**
 * 副作用函数
 * @param fn 要执行的副作用 注意: 默认自执行一次 fn
 */
export function effect<T = any>(fn: ()=>T){

    const _effect = new ReactiveEffect(fn)

    _effect.run()
    /* 返回当前 effect对应的的run()方法 */
    return _effect.run.bind(_effect)
}

/* 这一段依赖收集的逻辑关系 需要多复习 */
const targetMap = new WeakMap<object,KeyToDepMap>()
/**
 * 依赖收集
 * @param target 
 * @param key 
 */ 
export function track(target:object,key:unknown){
    /* 依赖对应关系: target -> key -> dep */
    let depsMap = targetMap.get(target)
    if(!depsMap){
        targetMap.set(target,(depsMap = new Map() as KeyToDepMap))
    }
    let dep = depsMap.get(key)
    if(!dep){
        depsMap.set(key,(dep = new Set() as Dep))
    }
    dep.add(activeEffect)

}

/**
 * 触发依赖执行
 */
export function  trigger(target:object,key:unknown){
    let depsMap = targetMap.get(target)

    if(!depsMap){
        return
    }

    let dep = depsMap.get(key)
    if(dep&&dep?.size>0){
        dep.forEach((effect)=>{
            if(effect) effect?.run()
        })
    }
    
}