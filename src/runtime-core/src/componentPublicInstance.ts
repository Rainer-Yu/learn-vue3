import { extend, hasOwn } from '../../shared/index'
import { ComponentInternalInstance } from './component'
export interface ComponentRenderContext {
    _: ComponentInternalInstance
}
type PublicPropertiesMap = Record<string, (i: ComponentInternalInstance) => any>

export const publicPropertiesMap: PublicPropertiesMap = extend(Object.create(null), {
    $el: (i) => i.vnode.el
} as PublicPropertiesMap)

/** publicInstanceProxyHandlers */
export const publicInstanceProxyHandlers: ProxyHandler<any> = {
    get({ _: instance }: ComponentRenderContext, key: string) {
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        }
        // 如果 key 存在于公共Api中 则返回对应的公共Api
        else if (hasOwn(publicPropertiesMap, key)) {
            return publicPropertiesMap[key](instance)
        }
    }
}
