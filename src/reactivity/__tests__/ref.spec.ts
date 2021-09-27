import { effect } from '../src/effect'
import { isReactive, isReadonly } from '../src/reactive'
import { isRef, proxyRefs, ref, unref } from '../src/ref'
describe('reactivity/ref', () => {
    it('ref happy path', () => {
        const r = ref(1)
        expect(isReadonly(r)).toBe(false)
        expect(r.value).toBe(1)
        r.value = 2
        expect(r.value).toBe(2)
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

    it('isRef', () => {
        expect(isRef(ref(1))).toBe(true)
        // expect(isRef(computed(() => 1))).toBe(true)

        expect(isRef(0)).toBe(false)
        expect(isRef(1)).toBe(false)
        // 看起来像 ref 的对象不一定是 ref
        expect(isRef({ value: 0 })).toBe(false)
    })

    it('unref', () => {
        expect(unref(1)).toBe(1)
        expect(unref(ref(1))).toBe(1)
    })

    it('proxyRefs', () => {
        const user = {
            age: ref(10),
            name: 'xiaohong'
        }

        const proxyUser = proxyRefs(user)
        expect(user.age.value).toBe(10)
        expect(proxyUser.age).toBe(10)
        expect(proxyUser.name).toBe('xiaohong')

        proxyUser.age = 20
        expect(proxyUser.age).toBe(20)
        expect(user.age.value).toBe(20)

        // @ts-ignore
        proxyUser.age = ref(10)
        expect(proxyUser.age).toBe(10)
        expect(user.age.value).toBe(10)
    })
    it.skip('toRef', () => {
        const a = reactive({
            x: 1
        })
        const x = toRef(a, 'x')
        expect(isRef(x)).toBe(true)
        expect(x.value).toBe(1)

        // source -> proxy
        a.x = 2
        expect(x.value).toBe(2)

        // proxy -> source
        x.value = 3
        expect(a.x).toBe(3)

        // reactivity
        let dummyX
        effect(() => {
            dummyX = x.value
        })
        expect(dummyX).toBe(x.value)

        // mutating source should trigger effect using the proxy refs
        a.x = 4
        expect(dummyX).toBe(4)

        // should keep ref
        const r = { x: ref(1) }
        const rr = toRef(r, 'x')
        expect(rr).toBe(r.x)
        rr.value = 2
        expect(r.x.value).toBe(2)
        r.x.value = 3
        expect(rr.value).toBe(3)
    })
})
