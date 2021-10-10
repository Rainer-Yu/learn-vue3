/** 对象属性合并 */
/** 对象自身属性中是否具有指定的属性 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
/** 空对象 */
const EMPTY_OBJ = {};

/** 判断是不是对象 */
const isObject = (val) => !!val && typeof val === 'object';
/** 判断是不是Array */
const isArray = Array.isArray;
/** 判断是不是String */
const isString = (val) => typeof val === 'string';

const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (key === '$el') {
            return instance.vnode.el;
        }
    }
};

/** 创建组件实例 */
function createComponentInstance(vnode) {
    const type = vnode.type;
    return {
        vnode,
        type,
        render: null,
        subTree: null,
        setupState: EMPTY_OBJ,
        proxy: null
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
    // context
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
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
/** 组件初始化 完成 */
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

/**  */
function render(vnode, container) {
    // 调用 patch 方法
    patch(vnode, container);
}
/** 处理各种vnode */
function patch(vnode, container) {
    if (isString(vnode.type)) {
        // 处理Element类型的vnode
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理组件vnode
        processComponent(vnode, container);
    }
}
/** 处理Element */
const processElement = (vnode, container) => mountElement(vnode, container);
/** 处理组件 */
const processComponent = (vnode, container) => mountComponent(vnode, container);
/** 挂载Element */
const mountElement = (vnode, container) => {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props } = vnode;
    // 处理 props
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    // 处理子节点 子节点可能是 string字符串 或 array数组
    if (isString(children)) {
        el.textContent = children;
    }
    else if (isArray(children)) {
        mountChildren(children, el);
    }
    container.append(el);
};
/** 挂载子节点 */
const mountChildren = (vnodeArray, container) => vnodeArray.forEach((vnode) => patch(vnode, container));
/** 挂载组件 */
const mountComponent = (vnode, container) => {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
};
function setupRenderEffect(instance, vnode, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}

/** 创建虚拟节点 */
const createVNode = (type, props = null, children = null) => ({
    type,
    props,
    children,
    el: null
});

/** 创建一个提供应用上下文的应用实例 */
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先把组件转化成虚拟节点 component -> VNode
            // 所有逻辑操作都会基于 VNode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

/** 返回一个`虚拟节点` */
function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
