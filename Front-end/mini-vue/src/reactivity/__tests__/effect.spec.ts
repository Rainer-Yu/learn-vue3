import { reactive } from '../src/reactive'
import { effect } from '../src/effect'
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
})
