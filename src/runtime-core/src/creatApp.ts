import { createVNode } from './vNode'

/**  */
export function createApp(rootComponent: any) {
    return {
        mount(rootContainer: any) {
            // 先把组件转化成虚拟节点 component -> VNode
            // 所有逻辑操作都会基于 VNode 做处理
            const vnode = createVNode(rootComponent)
        }
    }
}
