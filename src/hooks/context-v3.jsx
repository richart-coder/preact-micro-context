import { createContext as preactCreateContext } from "preact";
import { useSyncExternalStore } from "preact/compat";
import { memo } from "preact/compat";
import {
	useRef,
	useCallback,
	useContext as preactUseContext,
} from "preact/hooks";
import EventBus from "../utils/EventBus";

const eventBus = new EventBus();
const EVENT_NAME = Symbol("event-name");
const SCOPED_CONTEXT = Symbol("scoped-context");

let contextCounter = 0;

export const createContext = (initValue) => {
	const eventName = `context-${++contextCounter}`;
	const ScopedContext = preactCreateContext(initValue);

	const Provider = ({
		value,
		children = <b>⚠️ {Provider.displayName} 缺少 children</b>,
	}) => {
		return (
			<ScopedContext.Provider value={value}>{children}</ScopedContext.Provider>
		);
	};
	Provider.displayName = "Context.Provider";
	const context = {
		Provider: memo(Provider, (prevProps, nextProps) => {
			if (prevProps.value !== nextProps.value) {
				eventBus.emit(eventName, nextProps.value);
			}
			return true;
		}),
		[EVENT_NAME]: eventName,
		[SCOPED_CONTEXT]: ScopedContext,
	};
	return context;
};

export const useContext = (context, selector) => {
	const ctx = preactUseContext(context[SCOPED_CONTEXT]);
	const ctxRef = useRef(ctx);

	const subscribe = useCallback((callback) => {
		const eventName = context[EVENT_NAME];
		const listener = (nextCtx) => {
			ctxRef.current = nextCtx;
			callback();
		};

		eventBus.on(eventName, listener);
		return () => eventBus.off(eventName, listener);
	}, []);

	return useSyncExternalStore(subscribe, () => selector(ctxRef.current));
};
