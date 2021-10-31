import { shallowReadonly } from '../../reactivity/index'
import { EMPTY_OBJ, isObject } from '../../shared/index'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'
import { VNode, VNodeChildren } from './vnode'

export type Component = {
    setup: (props: object) => object
    render: () => (type: any, props?: any, children?: any) => VNode
}
export type Data = Record<string, unknown>

export type Slot = (...args: any[]) => VNode[]
export type InternalSlots = {
    [name: string]: Slot | undefined
}
export type Slots = Readonly<InternalSlots>

/**
 * @internal
 */
export type InternalRenderFunction = {
    (): VNodeChildren
}
// 组件实例对象接口
export interface ComponentInternalInstance {
    vnode: VNode
    props: Data
    emit: Function
    slots: InternalSlots
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
        props: EMPTY_OBJ,
        emit: () => {},
        slots: EMPTY_OBJ,
        type,
        render: null,
        subTree: null!,
        setupState: EMPTY_OBJ,
        proxy: null,
        ctx: EMPTY_OBJ
    }
    instance.emit = emit.bind(null, instance) as any
    instance.ctx = { _: instance }

    return instance
}

/** 初始化组件 */
export function setupComponent(instance: ComponentInternalInstance) {
    const { props, children } = instance.vnode
    initProps(instance, props)
    initSlots(instance, children)
    setupStatefulComponent(instance)
}

/** 初始化 有状态的(非函数式)组件 */
function setupStatefulComponent(instance: ComponentInternalInstance) {
    // 此处 type = component VNode
    const {
        type: { setup },
        props,
        ctx
    } = instance

    // context
    instance.proxy = new Proxy(ctx, publicInstanceProxyHandlers)

    if (setup) {
        // 执行 setup 前 将currentInstance指向当前组件的instance
<<<<<<< HEAD
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(props), instance)
        // 当前组件的 setup 执行完成后 清空将currentInstance
        setCurrentInstance(null)
=======
        currentInstance = instance
        const setupResult = setup(shallowReadonly(props), instance)
        // 当前组件的 setup 执行完成后 清空将currentInstance
        currentInstance = null
>>>>>>> 9d548f35cbfd54fa70305b4501dd70b4a76bb783
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
function finishComponentSetup(instance: ComponentInternalInstance) {
    const { type: component } = instance

    instance.render = component.render
}

// 组件实例全局变量
let currentInstance: ComponentInternalInstance | null = null
// 在setup里获取当前组件的实例
export const getCurrentInstance = () => currentInstance!
// 修改组件实例全局变量或清空
const setCurrentInstance = (instance: ComponentInternalInstance | null) =>
    (currentInstance = instance)
