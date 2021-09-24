import { computed } from '../src/computed'
import { effect } from '../src/effect'
import { isReadonly, reactive } from '../src/reactive'
import { ref } from '../src/ref'

describe('reactivity/computed', () => {
    it('should return updated value', () => {
        const reactiveObj = reactive<{ foo?: number }>({})
        const computedValue = computed(() => reactiveObj.foo)

        expect(isReadonly(computedValue)).toBe(true)
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
        computedValue.value
        expect(getter).toHaveBeenCalledTimes(1)

        // should not compute until needed
        reactiveObj.foo = 1
        expect(getter).toHaveBeenCalledTimes(1)

        // now it should compute
        expect(computedValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(2)

        // should not compute again
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
})
