import { effect } from '../src/effect'
import { isReactive } from '../src/reactive'
import { ref } from '../src/ref'
describe('reactivity/ref', () => {
    it('ref happy path', () => {
        const a = ref(1)
        expect(a.value).toBe(1)
        a.value = 2
        expect(a.value).toBe(2)
    })
    // ref() 没有初始值时也能正常工作
    it('should work without initial value', () => {
        const a = ref()
        let dummy
        effect(() => {
            dummy = a.value
        })
        expect(dummy).toBe(undefined)
        a.value = 2
        expect(dummy).toBe(2)
    })
    // ref()创建的变量应该是响应式的
    it('should be reactive', () => {
        const a = ref(1)
        let dummy
        let calls = 0
        effect(() => {
            calls++
            dummy = a.value
        })
        expect(calls).toBe(1)
        expect(dummy).toBe(1)
        a.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
        // 相同的值不触发 trigger()
        a.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
    })
    // 嵌套属性应该是响应式的
    it('should make nested properties reactive', () => {
        const a = ref({
            count: 1
        })
        // 嵌套属性应该是被reactive代理的响应式对象
        expect(isReactive(a.value)).toBe(true)
        let dummy
        effect(() => {
            dummy = a.value.count
        })
        expect(dummy).toBe(1)
        a.value.count = 2
        expect(dummy).toBe(2)
    })
})
