// 应用上下文提供者 - 管理颜色映射
import { ReactNode, createContext, useCallback, useState } from "react";
import uniqolor from "uniqolor";

// 颜色映射类型
type ColorMap = Map<string, string>;

const stub = () => {};

// 应用上下文 - 用于管理物品颜色映射
export const AppContext = createContext<{
  colorMap: ColorMap;
  setColorMap: (id: string, c: string) => void;
  deleteColorMap: (id: string) => void;
}>({
  colorMap: new Map(),
  setColorMap: stub,
  deleteColorMap: stub,
});

function AppProvider(props: { children: ReactNode }) {
  // 颜色映射状态
  const [cMapState, setCMap] = useState<Map<string, string>>(
    new Map([["产品 1", uniqolor("产品 1").color]])
  );

  // 设置颜色映射
  const setColorMap = useCallback((id: string, c: string) => {
    setCMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, c);
      return newMap;
    });
  }, []);

  // 删除颜色映射
  const deleteColorMap = useCallback((id: string) => {
    setCMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ colorMap: cMapState, setColorMap, deleteColorMap }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

export default AppProvider;
