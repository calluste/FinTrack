
import { createContext, useContext, useMemo, useState } from "react";

const DemoCtx = createContext({ demo: null, setDemo: () => {} });


export function DemoProvider({ children }) {
  const [demo, setDemo] = useState(null);
  const value = useMemo(() => ({ demo, setDemo }), [demo]);
  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  return useContext(DemoCtx);
}
