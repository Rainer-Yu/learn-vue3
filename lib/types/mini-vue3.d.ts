/** 创建一个提供应用上下文的应用实例 */
declare function createApp(rootComponent: any): {
    mount(rootContainer: any): void;
};

declare const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 2,
    STATEFUL_COMPONENT = 4,
    TEXT_CHILDREN = 8,
    ARRAY_CHILDREN = 16,
    COMPONENT = 6
}

declare type Component = {
    setup: (props: object) => object;
    render: () => (type: any, props?: any, children?: any) => VNode;
};

declare type VNodeTypes = string | VNode | Component;
interface VNode {
    type: VNodeTypes;
    props: Record<string, any> | null;
    children: VNodeChildren | null;
    el: Element | null;
    shapeFlag: ShapeFlags;
}
declare class VNode {
}
declare type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;
declare type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;
declare type VNodeChildren = VNodeChildAtom | VNodeArrayChildren;

/** 返回一个`虚拟节点` */
declare function h(type: any, props?: any, children?: any): VNode;

export { createApp, h };
