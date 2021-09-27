import {
    reactive,
    isReactive,
    isProxy,
    toRaw,
    readonly,
    shallowReadonly,
    shallowReactive,
    toReactive,
    isReadonly,
    toReadonly
} from '../src/reactive'
describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original) // 包装后的对象与源对象不同
        expect(observed.foo).toBe(1) // 可以获取到被包装对象内的值 与源对象对应的值一致
        expect(isProxy(original)).toBe(false) // 验证 original 不是是一个proxy对象
        expect(isReactive(original)).toBe(false) // 验证 original 不是是一个 reactive
        expect(isProxy(observed)).toBe(true) // 验证 observed 是一个proxy对象
        expect(isReactive(observed)).toBe(true) // 验证 observed 是一个 reactive
    })

    it('nested reactives', () => {
        const original = {
            text: 'some text',
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        }
        const observed = reactive(original)
        // 此时没有track过依赖 没有触发trigger
        observed.text = 'text'
        // 只有嵌套的对象被转换为 reactive
        expect(isReactive(observed.text)).toBe(false)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })

    it('toRaw', () => {
        const obj = { foo: { bar: 'bar' }, sum: 1 }
        const reactiveObj = reactive(obj)
        const shallowReactiveObj = shallowReactive(obj)
        const readonlyObj = readonly(obj)
        const shallowReadonlyObj = shallowReadonly(obj)
        expect(toRaw(obj)).toBe(obj)
        expect(toRaw(reactiveObj)).toBe(obj)
        expect(toRaw(shallowReactiveObj)).toBe(obj)
        expect(toRaw(readonlyObj)).toBe(obj)
        expect(toRaw(shallowReadonlyObj)).toBe(obj)
    })

    it('toReactive', () => {
        const obj = { num: 5 }
        const str = 'text'
        // 非对象数据返回其本身
        expect(toReactive(str)).toBe(str)
        expect(isReactive(toReactive(str))).toBe(false)
        // 返回对象的响应式副本
        expect(toReactive(obj)).not.toBe(obj)
        expect(isReactive(toReactive(obj))).toBe(true)
        expect(isReadonly(toReactive(obj))).toBe(false)
    })

    it('toReadonly', () => {
        const obj = { num: 5 }
        const str = 'text'
        // 非对象数据返回其本身
        expect(toReadonly(str)).toBe(str)
        expect(isReadonly(toReadonly(str))).toBe(false)
        // 返回对象的响应式副本
        expect(toReadonly(obj)).not.toBe(obj)
        expect(isReadonly(toReadonly(obj))).toBe(true)
        expect(isReactive(toReadonly(obj))).toBe(false)
    })
})
