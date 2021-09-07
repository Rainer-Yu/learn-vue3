class ReactiveEffect{
    private _fn: Function;
    constructor(fn:Function){
        this._fn=fn
    }
    run(){
        this._fn()
    }
}
export function effect(fn: Function){

    const _effect = new ReactiveEffect(fn)

    _effect.run()
}