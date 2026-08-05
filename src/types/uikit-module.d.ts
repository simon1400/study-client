// UIkit 3.1.4 без собственных типов — нам хватает пары методов,
// остальное поведение задаётся html-атрибутами uk-*.
declare module 'uikit' {
  interface UIkitStatic {
    use(plugin: unknown): void;
    modal(element: string | Element): { show(): void; hide(): void };
    util: { find(selector: string): Element | null };
  }
  const UIkit: UIkitStatic;
  export default UIkit;
}

declare module 'uikit/dist/js/uikit-icons' {
  const Icons: unknown;
  export default Icons;
}
