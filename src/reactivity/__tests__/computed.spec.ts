import { computed } from '../src/computed'
import { effect } from '../src/effect'
import { isReadonly, reactive } from '../src/reactive'
import { ref } from '../src/ref'

describe('reactivity/computed', () => {
    it('should return updated value', () => {
        const reactiveObj = reactive<{ foo?: number }>({})
        const computedValue = computed(() => reactiveObj.foo)
        console.warn = jest.fn()

        // 默认情况下 computed 是只读的
        expect(isReadonly(computedValue)).toBe(true)
        // @ts-ignore-nextline 对只读的computed赋值不会成功,并且会发出警告
        computedValue.value = 1
        expect(console.warn).toBeCalledTimes(1)

        expect(computedValue.value).toBe(undefined)
        reactiveObj.foo = 1
        expect(computedValue.value).toBe(1)
    })

    it('should compute lazily', () => {
        const reactiveObj = reactive<{ foo?: number }>({})
        const getter = jest.fn(() => reactiveObj.foo)
        const computedValue = computed(getter)

        // 懒执行
        expect(getter).not.toHaveBeenCalled()

        expect(computedValue.value).toBe(undefined)
        expect(getter).toHaveBeenCalledTimes(1)

        // computed 的依赖不改变时, 再次获取值时使用缓存的computed值
        expect(computedValue.value).toBe(undefined)
        expect(getter).toHaveBeenCalledTimes(1)

        // computed的依赖改变后,在被再次读取值之前不重新计算
        reactiveObj.foo = 0
        reactiveObj.foo = 1
        expect(getter).toHaveBeenCalledTimes(1)

        // computed的依赖改变后,再次读取值时重新计算
        expect(computedValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(2)

        // computed 的依赖不改变时, 再次获取值时使用缓存的computed值,不会重新计算
        computedValue.value
        expect(getter).toHaveBeenCalledTimes(2)
    })

    it('should trigger effect', () => {
        const reactiveObj = reactive<{ foo?: number }>({})
        const computedValue = computed(() => reactiveObj.foo)
        let dummy
        effect(() => {
            dummy = computedValue.value
        })
        expect(dummy).toBe(undefined)
        reactiveObj.foo = 1
        expect(dummy).toBe(1)
    })

    it('should support setter', () => {
        const n = ref(1)
        const plusOne = computed({
            get: () => n.value + 1,
            set: (val) => {
                n.value = val - 1
            }
        })

        expect(isReadonly(plusOne)).toBe(false)
        expect(plusOne.value).toBe(2)
        n.value++
        expect(plusOne.value).toBe(3)

        plusOne.value = 0
        expect(n.value).toBe(-1)
    })
    it('should not support setter when the configuration object only has getter', () => {
        const n = ref(1)
        // @ts-ignore-nextline
        const plusOne = computed({ get: () => n.value + 1 })
        console.warn = jest.fn()

        expect(isReadonly(plusOne)).toBe(true)
        expect(plusOne.value).toBe(2)
        n.value++
        expect(plusOne.value).toBe(3)

        // @ts-ignore-nextline
        plusOne.value = 0
        expect(console.warn).toHaveBeenCalledTimes(1)
        expect(n.value).toBe(2)
    })
})
