// 应用上下文提供者 - 管理颜色映射
import { ReactNode, createContext, useCallback, useState } from "react";

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
  // 颜色映射状态 - 使用高对比度颜色确保明显区分
  const highContrastColors = [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#45B7D1', // 蓝色
    '#96CEB4', // 绿色
    '#FFEAA7', // 黄色
    '#DDA0DD', // 紫色
    '#98D8C8', // 薄荷绿
    '#F7DC6F', // 金黄色
    '#BB8FCE', // 淡紫色
    '#85C1E9', // 天蓝色
    '#F8C471', // 橙色
    '#82E0AA', // 浅绿色
    '#F1948A', // 粉红色
    '#85C1E9', // 浅蓝色
    '#D7BDE2'  // 淡紫色
  ];
  
  const initialColorMap = new Map([
    ["产品 1", highContrastColors[0]], // 红色
    ["产品 2", highContrastColors[1]], // 青色
    ["产品 3", highContrastColors[2]], // 蓝色
    ["产品 4", highContrastColors[3]], // 绿色
    ["GCH300001", highContrastColors[4]], // 黄色
    ["GCH300002", highContrastColors[5]], // 紫色
    ["GCH300003", highContrastColors[6]], // 薄荷绿
    ["测试产品", highContrastColors[7]] // 金黄色
  ]);
  
  // 打印初始颜色映射
  console.log("🎨 初始化高对比度颜色映射:", Array.from(initialColorMap.entries()));
  
  const [cMapState, setCMap] = useState<Map<string, string>>(initialColorMap);

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
