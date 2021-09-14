import { isReadonly, shallowReadonly } from '../src/reactive'

describe('shallowReadonly', () => {
    it('should only set the non-reactive attribute of the root node as readonly', () => {
        const props = shallowReadonly({ n: { foo: 1 } })
        expect(isReadonly(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })
})
