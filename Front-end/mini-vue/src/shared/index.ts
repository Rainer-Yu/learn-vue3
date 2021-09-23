/** 对象属性合并 */
export const extend = Object.assign

/** 判断是不是对象 */
export const isObject = (val: unknown): val is Record<any, any> =>
    !!val && typeof val === 'object'
/** 判断是不是函数 */
export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'
/** 判断有没有改变 */
export const hasChanged = (val: any, newVal: any): boolean => !Object.is(val, newVal)
