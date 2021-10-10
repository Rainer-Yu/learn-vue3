/** 对象属性合并 */
export const extend = Object.assign
/** 对象自身属性中是否具有指定的属性 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val =>
    hasOwnProperty.call(val, key)
/** 获取包装类型的字符串 Object.prototype.toString的别名 */
export const objectToString = Object.prototype.toString
/** 判断有没有改变 */
export const hasChanged = (val: any, newVal: any): boolean => !Object.is(val, newVal)
/** 空对象 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}
