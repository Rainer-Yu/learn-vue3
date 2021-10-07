/** 对象属性合并 */
/** 空对象 */
const EMPTY_OBJ = {};

/** 判断是不是对象 */
const isObject = (val) => !!val && typeof val === 'object';

/** 创建组件实例 */
function createComponentInstance(vnode) {
    const type = vnode.type;
    return {
        vnode,
        type,
        render: null,
        subTree: null,
        setupState: EMPTY_OBJ
    };
}
/** 初始化组件 */
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
/** 初始化 有状态的(非函数式)组件 */
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
/** 处理组件内 setup函数 的返回值 */
function handleSetupResult(instance, setupResult) {
    // TODO setup 返回的是函数时
    // 如果 setup 返回的是对象时 将setupResult赋值给组件实例对象上的setupState
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (!Component.render) {
        Component.render = instance.render;
    }
}

/**  */
function render(vnode, container) {
    // 调用 patch 方法
    patch(vnode);
}
/**  */
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode);
}
/** 处理组件 */
const processComponent = (vnode, container) => mountComponent(vnode);
/** 挂载组件 */
const mountComponent = (vnode, container) => {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
};
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

/** 创建虚拟节点 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

/**  */
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先把组件转化成虚拟节点 component -> VNode
            // 所有逻辑操作都会基于 VNode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

export { createApp };
