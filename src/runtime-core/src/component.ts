import { EMPTY_OBJ, isObject } from '../../shared/index'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { VNode, VNodeChildren } from './vnode'

export type Component = any
export type Data = Record<string, unknown>

/**
 * @internal
 */
export type InternalRenderFunction = {
    (): VNodeChildren
}
// 组件实例对象接口
export interface ComponentInternalInstance {
    vnode: VNode
    type: any
    /**
     * 返回vdom树的渲染函数
     * @internal
     */
    render: InternalRenderFunction | null
    /**
     * 此组件vdom树的 根vnode(虚拟节点)
     */
    subTree: VNode
    /**
     * setup related
     * @internal
     */
    setupState: Data
    /**
     * proxy
     */
    proxy: any
    /**
     * ctx
     */
    ctx: Data
}

/** 创建组件实例 */
export function createComponentInstance(vnode: VNode): ComponentInternalInstance {
    const type = vnode.type
    const instance = {
        vnode,
        type,
        render: null,
        subTree: null!,
        setupState: EMPTY_OBJ,
        proxy: null,
        ctx: EMPTY_OBJ
    }
    instance.ctx = { _: instance }

    return instance
}

/** 初始化组件 */
export function setupComponent(instance: ComponentInternalInstance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance)
}

/** 初始化 有状态的(非函数式)组件 */
function setupStatefulComponent(instance: ComponentInternalInstance) {
    const component = instance.type

    // context
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

    const { setup } = component
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}

/** 处理组件内 setup函数 的返回值 */
function handleSetupResult(
    instance: ComponentInternalInstance,
    setupResult: unknown
) {
    // TODO setup 返回的是函数时

    // 如果 setup 返回的是对象时 将setupResult赋值给组件实例对象上的setupState
    if (isObject(setupResult)) {
        instance.setupState = setupResult
    }

    finishComponentSetup(instance)
}

/** 组件初始化 完成 */
function finishComponentSetup(instance: any) {
    const Component = instance.type

    instance.render = Component.render
}