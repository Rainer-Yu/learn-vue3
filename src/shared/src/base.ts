/** 对象属性合并 */
export const extend = Object.assign
/** 获取包装类型的字符串 Object.prototype.toString的别名 */
export const objectToString = Object.prototype.toString
/** 判断有没有改变 */
export const hasChanged = (val: any, newVal: any): boolean => !Object.is(val, newVal)
/** 空对象 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}
