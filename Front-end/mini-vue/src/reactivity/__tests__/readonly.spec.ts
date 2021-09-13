import { readonly } from '../src/reactive'

describe('readonly', () => {
    it('happy path', () => {
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)

        /* readonly 代理后生成一个与源对象内容相同新的对象 */
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
        expect(wrapped.bar.baz).toBe(2)
    })

    it('should warn when called set', () => {
        /* readonly() 创建的proxy对象不可以被set */

        console.warn = jest.fn()
        const user = readonly({
            age: 10,
        })
        user.age = 11
        expect(console.warn).toBeCalledTimes(1)
        user.age++
        expect(console.warn).toBeCalledTimes(2)
    })
})
