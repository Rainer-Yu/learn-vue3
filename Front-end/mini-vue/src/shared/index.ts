/** 对象属性合并 */
export const extend = Object.assign
/** 判断有没有改变 */
export const hasChanged = (val: any, newVal: any): boolean => !Object.is(val, newVal)

export const objectToString = Object.prototype.toString
/** 从字符串（如"[object RawType]"）中提取"RawType" */
export const toRawType = (value: unknown): string =>
    objectToString.call(value).slice(8, -1) // 通过 .call 指定要判断类型的value

/** 判断是不是对象 */
export const isObject = (val: unknown): val is Record<any, any> =>
    !!val && typeof val === 'object'
/** 判断是不是普通对象 */
export const isPlainObject = (val: unknown): val is object =>
    toRawType(val) === 'Object'
/** 判断是不是Array */
export const isArray = Array.isArray
/** 判断是不是Map */
export const isMap = (val: unknown): val is Map<any, any> => toRawType(val) === 'Map'
/** 判断是不是Set */
export const isSet = (val: unknown): val is Set<any> => toRawType(val) === 'Set'
/** 判断是不是String */
export const isString = (val: unknown): val is string => typeof val === 'string'
/** 判断是不是Symbol */
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
/** 判断是不是Date */
export const isDate = (val: unknown): val is Date => val instanceof Date
/** 判断是不是函数 */
export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'
