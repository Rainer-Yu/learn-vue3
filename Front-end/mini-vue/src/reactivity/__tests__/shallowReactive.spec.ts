import { isReactive, shallowReactive } from '../src/reactive'

describe('shallowReactive', () => {
    it('should only set the non-reactive attribute of the root node as reactive', () => {
        const props = shallowReactive({ n: { foo: 1 } })
        expect(isReactive(props)).toBe(true)
        expect(isReactive(props.n)).toBe(false)
    })
})
