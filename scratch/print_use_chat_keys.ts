import { useChat } from "@ai-sdk/react";
import * as React from "react";

// Mock React hook APIs so useChat doesn't throw
(React as any).useRef = (init: any) => ({ current: init });
(React as any).useState = (val: any) => [val, () => {}];
(React as any).useEffect = () => {};
(React as any).useCallback = (fn: any) => fn;
(React as any).useMemo = (fn: any) => fn();
(React as any).useId = () => "id";

try {
  const result = useChat();
  console.log("Returned keys:", Object.keys(result));
} catch (e: any) {
  console.error("Failed to run:", e.message || e);
}
