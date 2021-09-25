import { extend, hasChanged, objectToString } from '../src/base'

describe('shared/base', () => {
    it('extend', () => {
        expect(extend).toEqual(Object.assign)
    })
    it('objectToString', () => {
        expect(objectToString).toEqual(Object.prototype.toString)
    })
    it('hasChanged', () => {
        const obj1 = { foo: 1 }
        const obj2 = { foo: 1 }
        const obj3 = extend(obj1, { bar: 1 })
        expect(hasChanged(obj1, obj2)).toBe(true)
        expect(hasChanged(obj1, obj3)).toBe(false)
    })
})
