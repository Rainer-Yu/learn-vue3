type ComputedGetter<T> = (...args: any[]) => T
type ComputedSetter<T> = (v: T) => void
type ComputedRef<T> = {
    readonly value: T
}
export function computed<T>(getterFn: ComputedGetter<T>): ComputedRef<T> {
    return {
        value: 1 as unknown as T
    }
}
