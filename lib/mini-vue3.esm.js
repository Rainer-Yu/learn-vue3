/** 对象属性合并 */
const extend = Object.assign;
/** 对象自身属性中是否具有指定的属性 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
/** 空对象 */
const EMPTY_OBJ = {};
/** 是on开头的事件 */
const isOn = (key) => /^on[A-Z]/.test(key);

/** 判断是不是对象 */
const isObject = (val) => !!val && typeof val === 'object';
/** 判断是不是String */
const isString = (val) => typeof val === 'string';
/** 判断是不是函数 */
const isFunction = (val) => typeof val === 'function';

const shapeFlagMap = extend(Object.create(null), {
    ELEMENT: 1 /* ELEMENT */,
    FUNCTIONAL_COMPONENT: 2 /* FUNCTIONAL_COMPONENT */,
    STATEFUL_COMPONENT: 4 /* STATEFUL_COMPONENT */,
    COMPONENT: 6 /* COMPONENT */,
    TEXT_CHILDREN: 8 /* TEXT_CHILDREN */,
    ARRAY_CHILDREN: 16 /* ARRAY_CHILDREN */
});

const publicPropertiesMap = extend(Object.create(null), {
    $el: (i) => i.vnode.el
});
/** publicInstanceProxyHandlers */
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        // 如果 key 存在于公共Api中 则返回对应的公共Api
        else if (hasOwn(publicPropertiesMap, key)) {
            return publicPropertiesMap[key](instance);
        }
    }
};

/** 创建组件实例 */
function createComponentInstance(vnode) {
    const type = vnode.type;
    const instance = {
        vnode,
        type,
        render: null,
        subTree: null,
        setupState: EMPTY_OBJ,
        proxy: null,
        ctx: EMPTY_OBJ
    };
    instance.ctx = { _: instance };
    return instance;
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
    const { type: component, ctx } = instance;
    // context
    instance.proxy = new Proxy(ctx, publicInstanceProxyHandlers);
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
    const { type: component } = instance;
    instance.render = component.render;
}

/** render */
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
    // 根据tagName创建HTML节点
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props } = vnode;
    // 处理 props 通过循环给DOM节点设置属性
    for (const key in props) {
        // 挂载事件
        if (isOn(key) && isFunction(props[key])) {
            el.addEventListener(key.slice(2).toLowerCase(), props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
    }
    // 处理子节点 子节点可能是 TEXT_CHILDREN 或 ARRAY_CHILDREN
    if (vnode.shapeFlagIs('TEXT_CHILDREN')) {
        // 获取el节点及其后代的文本内容并把子节点替换为文本
        el.textContent = children;
    }
    else if (vnode.shapeFlagIs('ARRAY_CHILDREN')) {
        mountChildren(children, el);
    }
    // 将el节点插入到容器节点的子末位
    container.append(el);
};
/** 挂载子节点 */
const mountChildren = (vnodeArray, container) => vnodeArray.forEach((vnode) => patch(vnode, container));
/** 挂载组件 */
const mountComponent = (initialVNode, container) => {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
};
/** setupRenderEffect */
function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

/** 创建虚拟节点 */
const createVNode = (type, props = null, children = null, shapeFlag = initShapFlag(type)) => {
    const vnode = extend(new VNode(), {
        type,
        props,
        children,
        el: null,
        shapeFlag
    });
    /* 子节点是文本时 标为 TEXT_CHILDREN 否则视为 ARRAY_CHILDREN */
    vnode.shapeFlagMark(isString(children) ? 'TEXT_CHILDREN' : 'ARRAY_CHILDREN');
    return vnode;
};
/**
 * @internal
 * vnode 位运算函数类
 */
class VNode {
    /**
     * 为 shapeFlag 添加xxx标志
     */
    shapeFlagMark(flagName) {
        this.shapeFlag |= shapeFlagMap[flagName];
    }
    /**
     * shapeFlag 有 xxx 标志
     */
    shapeFlagIs(flagName) {
        return !!(this.shapeFlag & shapeFlagMap[flagName]);
    }
}
/** 初始化VNode的默认shapeFlags */
const initShapFlag = (type) => isString(type)
    ? 1 /* ELEMENT */
    : isFunction(type)
        ? 2 /* FUNCTIONAL_COMPONENT */
        : 4 /* STATEFUL_COMPONENT */;

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
