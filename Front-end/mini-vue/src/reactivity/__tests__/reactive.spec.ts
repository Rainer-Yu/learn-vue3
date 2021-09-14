import { reactive, isReactive } from '../src/reactive'
describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original) // 包装后的对象与源对象不同
        expect(observed.foo).toBe(1) // 可以获取到被包装对象内的值 与源对象对应的值一致
        expect(isReactive(original)).toBe(false) // 验证 original 不是是一个 reactive
        expect(isReactive(observed)).toBe(true) // 验证 observed 是一个 reactive
    })
})
