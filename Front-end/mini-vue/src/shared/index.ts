/** 对象属性合并 */
export const extend = Object.assign
/** 判断是不是对象 */
export const isObject = (val: unknown): boolean => !!val && typeof val === 'object'
