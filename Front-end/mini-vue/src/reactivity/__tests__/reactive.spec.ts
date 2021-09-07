import { reactive } from "../src/reactive";
describe('reactive', () => {
    it('happy path', () => {
        const original ={ foo: 1 }
        const observed =reactive(original)
        /* reactive最基础的功能 */
        expect(observed).not.toBe(original) // 包装对象
        expect(observed.foo).toBe(1)    // 可以获取到被包装对象内的值
    });
});