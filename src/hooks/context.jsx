import { memo } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import EventBus from "../utils/EventBus";
const eventBus = new EventBus();
const EVENT_NAME = Symbol("event-name");
/**
 * 用於存儲 context 值的快取
 * @type {Map<Object, any>}
 */
const ctxCache = new Map();
let contextCounter = 0;
/**
 * 創建一個新的 context 物件，包含 Provider 組件
 * @param {any} [initValue] - Context 的初始值，當沒有 Provider 時會使用此值
 * @returns {Object} 包含 Provider 屬性的 context 物件
 */
export const createContext = (initValue) => {
  const ctx = {};
  const eventName = `context-${++contextCounter}`;
  ctxCache.set(ctx, initValue);
  /**
   * Provider 組件，用於向子組件提供 context 值
   * @description 將 value 存儲到 context 快取中，並渲染子組件
   * @param {Object} props - 組件屬性
   * @param {any} props.value - 要提供給子組件的 context 值
   * @param {React.ReactNode} props.children - 子組件
   * @returns {React.ReactElement} 渲染的子組件
   */
  const Provider = ({ value, children }) => {
    useEffect(() => {
      ctxCache.set(ctx, value);
    }, [value]);

    return <>{children}</>;
  };
  ctx.Provider = memo(Provider, (prevProps, nextProps) => {
    if (prevProps.value !== nextProps.value) {
      eventBus.emit(eventName, nextProps.value);
    }
    return true;
  });
  ctx[EVENT_NAME] = eventName;
  return ctx;
};

/**
 * Hook 用於消費 context 值
 * @description 從指定的 context 中獲取當前值或選取的部分值，實現精確的組件重新渲染
 * @param {Object} context - 由 createContext() 創建的 context 物件
 * @param {Function} [selector] - 可選的選擇器函數，用於選取 context 中的特定部分
 * @returns {any} context 的值或選擇器返回的值，如果 context 不存在則返回 undefined
 * @performance
 * - 不使用 selector：任何 context 值改變都會觸發組件重新渲染
 * - 使用 selector：只有選取的部分真正改變時才會觸發重新渲染
 * - 可大幅提升應用性能，避免不必要的重新渲染
 */
export const useContext = (context, selector) => {
  const [state, setState] = useState(() => {
    const ctx = ctxCache.get(context);
    if (!selector) return ctx;
    return selector(ctx);
  });

  useEffect(() => {
    const eventName = context[EVENT_NAME];
    const subscriber = (nextCtx) => {
      setState(() => (selector ? selector(nextCtx) : nextCtx));
    };
    eventBus.on(eventName, subscriber);
    return () => {
      eventBus.off(eventName, subscriber);
    };
  }, []);

  return state;
};
