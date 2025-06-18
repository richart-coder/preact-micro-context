import { createContext as preactCreateContext } from "preact";
import { memo } from "preact/compat";
import {
  useContext as preactUseContext,
  useEffect,
  useState,
} from "preact/hooks";
import EventBus from "../utils/EventBus";
const eventBus = new EventBus();
const EVENT_NAME = Symbol("event-name");
const SCOPE_CONTEXT = Symbol("scope-context");

let contextCounter = 0;

export const createContext = (initValue) => {
  const eventName = `context-${++contextCounter}`;
  const ScopeContext = preactCreateContext(initValue);

  const Provider = ({ value, children }) => {
    return (
      <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
    );
  };

  const context = {
    Provider: memo(Provider, (prevProps, nextProps) => {
      if (prevProps.value !== nextProps.value) {
        eventBus.emit(eventName, nextProps.value);
      }
      return true;
    }),
    [EVENT_NAME]: eventName,
    [SCOPE_CONTEXT]: ScopeContext,
  };
  return context;
};

export const useContext = (context, selector) => {
  const ctx = preactUseContext(context[SCOPE_CONTEXT]);
  const [state, setState] = useState(() => {
    return selector ? selector(ctx) : ctx;
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
