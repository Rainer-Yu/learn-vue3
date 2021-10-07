import {
    ComponentInternalInstance,
    createComponentInstance,
    setupComponent
} from './component'

/**  */
export function render(vnode: any, container: any) {
    // 调用 patch 方法
    patch(vnode, container)
}

/** 处理各种vnode */
function patch(vnode: any, container: any) {
    // TODO 处理Element类型的vnode
    // processElement()
    // 处理组件vnode
    processComponent(vnode, container)
}

/** 处理组件 */
const processComponent = (vnode: any, container: any) =>
    mountComponent(vnode, container)

/** 挂载组件 */
const mountComponent = (vnode: any, container: any) => {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}
function setupRenderEffect(instance: ComponentInternalInstance, container: any) {
    const subTree = instance.render()
    patch(subTree, container)
}
