'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/** 对象属性合并 */
const extend = Object.assign;
/** 对象自身属性中是否具有指定的属性 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
/** 空对象 */
const EMPTY_OBJ = {};
/** 是on开头的事件 */
const isOn = (key) => /^on[A-Z]/.test(key);
/* -n 字符串驼峰化 */
const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
});
/* 首字母大写 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
/* 变成事件名称 */
const toHandlerKey = (str) => (str ? 'on' + capitalize(str) : '');

/** 判断是不是对象 */
const isObject = (val) => !!val && typeof val === 'object';
/** 判断是不是String */
const isString = (val) => typeof val === 'string';
/** 判断是不是函数 */
const isFunction = (val) => typeof val === 'function';

// REVIEW  这一段依赖收集的逻辑关系 需要多复习
const targetMap = new WeakMap();
/**
 * 触发依赖执行(从reactive的target->key->dep 然后收集依赖)
 */
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    // 没有收集过依赖(tracked),直接跳过trigger
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    dep && triggerEffects(dep);
}
/**
 * 触发依赖执行(直接触发dep中的依赖)
 */
function triggerEffects(dep) {
    dep.forEach((effect) => {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}

// 储存reactive和其原始对象对应关系的 全局WeakMap
const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function reactive(raw) {
    return createReactiveObject(raw, reactiveHandlers, reactiveMap);
}
/**
 * 返回原始对象的只读代理
 * @param raw
 */
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers, readonlyMap);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers, shallowReadonlyMap);
}
/**
 * 创建反应对象
 * @param target 原始对象
 * @param baseHandlers Proxy处理函数的对象
 */
function createReactiveObject(target, baseHandlers, proxyMap) {
    // target 已经具有相应的 Proxy
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

const reactvieGet = createGetter();
const reactvieSet = createSetter();
/** reactive 拦截方法 */
const reactiveHandlers = {
    get: reactvieGet,
    set: reactvieSet
};
const readonlyGet = createGetter(true);
const readonlySet = readonlySetter;
/** readonly 拦截方法 */
const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet
};
const shallowReadonlyGet = createGetter(true, true);
const shallowReadonlySet = readonlySetter;
/** shallowReadonly 拦截方法 */
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: shallowReadonlySet
};
/**
 * 创建proxy对象的get方法
 * @param isReadonly
 */
function createGetter(isReadonly = false, shallow = false) {
    return (target, key, receiver) => {
        // isReactive和isReadonly 检测 不是readonly的就是reactive
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* RAW */ &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap).get(target)) {
            return target;
        }
        const res = Reflect.get(target, key, receiver);
        // 不执行嵌套对象的深度readonly转换
        if (shallow) {
            return res;
        }
        // 实现 reactive和readonly 的嵌套对象转换
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
/**
 * 创建非readoly Proxy对象的 set 方法
 */
function createSetter() {
    // reactive创建的代理对象 触发 set 操作时 触发依赖执行
    return (target, key, value, receiver) => {
        const res = Reflect.set(target, key, value, receiver);
        // 触发依赖执行
        trigger(target, key);
        return res;
    };
}
/**
 * readoly Proxy对象的 set 方法
 */
function readonlySetter(target, key) {
    // readonly创建的代理对象, 触发 set 操作时控制台进行警告提示
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
    return true;
}

function emit(instance, eventName, ...args) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(eventName));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = extend(Object.create(null), {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
});
/** publicInstanceProxyHandlers */
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 如果 key 存在于公共Api中 则返回对应的公共Api
        else if (hasOwn(publicPropertiesMap, key)) {
            return publicPropertiesMap[key](instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

/** 创建组件实例 */
function createComponentInstance(vnode) {
    const type = vnode.type;
    const instance = {
        vnode,
        props: EMPTY_OBJ,
        emit: () => { },
        slots: EMPTY_OBJ,
        type,
        render: null,
        subTree: null,
        setupState: EMPTY_OBJ,
        proxy: null,
        ctx: EMPTY_OBJ
    };
    instance.emit = emit.bind(null, instance);
    instance.ctx = { _: instance };
    return instance;
}
/** 初始化组件 */
function setupComponent(instance) {
    const { props, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    setupStatefulComponent(instance);
}
/** 初始化 有状态的(非函数式)组件 */
function setupStatefulComponent(instance) {
    // 此处 type = component VNode
    const { type: { setup }, props, ctx } = instance;
    // context
    instance.proxy = new Proxy(ctx, publicInstanceProxyHandlers);
    if (setup) {
        const setupResult = setup(shallowReadonly(props), instance);
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
    if (vnode.shapeFlag & 8 /* TEXT_CHILDREN */) {
        // 获取el节点及其后代的文本内容并把子节点替换为文本
        el.textContent = children;
    }
    else if (vnode.shapeFlag & 16 /* ARRAY_CHILDREN */) {
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
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag
    };
    /* 子节点是文本时 标为 TEXT_CHILDREN 否则视为 ARRAY_CHILDREN */
    vnode.shapeFlag |= isString(children)
        ? 8 /* TEXT_CHILDREN */
        : 16 /* ARRAY_CHILDREN */;
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 32 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
};
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

function renderSlots(slots, slotName, props) {
    const slot = slots === null || slots === void 0 ? void 0 : slots[slotName];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode('div', {}, slot(props));
        }
    }
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;
