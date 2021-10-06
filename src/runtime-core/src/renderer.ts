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

/**  */
function patch(vnode: any, container: any) {
    // 处理组件
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
