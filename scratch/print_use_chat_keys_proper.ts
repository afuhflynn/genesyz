const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === "react") {
    return {
      useRef: (init) => ({ current: init }),
      useState: (val) => [val, () => {}],
      useEffect: () => {},
      useCallback: (fn) => fn,
      useMemo: (fn) => fn(),
      useId: () => "id",
      useTransition: () => [false, (fn) => fn()],
      useDeferredValue: (val) => val,
      useInsertionEffect: () => {},
      useLayoutEffect: () => {},
      useDebugValue: () => {},
      useImperativeHandle: () => {},
      useContext: () => ({}),
      useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
      createContext: () => ({}),
      createElement: () => ({}),
      forwardRef: (fn) => fn,
      Component: class {},
      Fragment: Symbol("Fragment"),
    };
  }
  return originalRequire.apply(this, arguments);
};

// Now import the hook and run it!
const { useChat } = require("@ai-sdk/react");
try {
  const result = useChat({
    transport: {
      stream: async () => ({
        body: new ReadableStream(),
      }),
    },
  });
  console.log("Returned keys:", Object.keys(result));
  console.log("Returned sendMessage:", typeof result.sendMessage);
  console.log("Returned status:", result.status);
} catch (e) {
  console.error("Failed:", e.message || e);
}
