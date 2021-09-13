import { reactive } from '../src/reactive'
import { effect, stop } from '../src/effect'
describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10,
        })

        let nextAge
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)

        // update
        user.age++
        expect(nextAge).toBe(12)
    })

    /**
     * 调用 effect(fn) ->  返回一个 runner函数
     *  ->  手动调用 runner()时 ->  会调用effect(fn)内的 fn()
     *  ->  返回fn()的返回值
     */
    it('should return runner when call effect', () => {
        let foo = 0
        const runner = effect(() => {
            foo++
            return foo
        })
        // effect(fn)函数会默认执行一次fn()
        expect(foo).toBe(1)
        // 调用effect(fn)返回的runner()函数会再次执行一次fn()
        runner()
        expect(foo).toBe(2)
        // 调用effect(fn)返回的runner()函数会得到再次执行一次fn()后fn()的返回值
        expect(runner()).toBe(3)
    })

    it('scheduler', () => {
        let dummy
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )
        // 调用effect时默认会调用一次fn 不调用scheduler函数
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        /**
         * 此后修改effect的依赖的值时
         * 默认情况下有scheduler时会触发scheduler函数并且不调用fn()
         * 无scheduler时,会触发调用fn()
         */
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        // 手动运行runner函数时 只调用fn() 不会调用 scheduler函数
        run() // 通过scheduler()函数把effect()返回的runner函数赋值给 run -> run===runner
        expect(dummy).toBe(2)
        expect(scheduler).toHaveBeenCalledTimes(1)
    })

    it('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)
        obj.prop = 3
        expect(dummy).toBe(2)

        // stopped effect should still be manually callable
        runner()
        expect(dummy).toBe(3)
    })

    it('onStop', () => {
        const onStop = jest.fn()
        const runner = effect(() => {}, {
            onStop,
        })

        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })
})
