export interface BoxPreset {
  id: string;
  name: string;
  dimensions: [number, number, number]; // [长, 宽, 高]
  thickness: number;
  netWeight: number;
  grossWeight: number;
  description?: string;
}

export const boxPresets: BoxPreset[] = [
  {
    id: "preset-1",
    name: "标准箱型 52×40×48",
    dimensions: [52, 40, 48],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "常用标准尺寸"
  },
  {
    id: "preset-2", 
    name: "扁平箱型 52×40×28",
    dimensions: [52, 40, 28],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "适合扁平物品"
  },
  {
    id: "preset-3",
    name: "加宽箱型 52×50×51", 
    dimensions: [52, 50, 51],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "加宽设计"
  },
  {
    id: "preset-4",
    name: "窄长箱型 52×22×42",
    dimensions: [52, 22, 42], 
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "适合长条形物品"
  },
  {
    id: "preset-5",
    name: "中型箱型 59×38×30",
    dimensions: [59, 38, 30],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "中等尺寸"
  },
  {
    id: "preset-6", 
    name: "紧凑箱型 60×29×31",
    dimensions: [60, 29, 31],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "紧凑设计"
  },
  {
    id: "preset-7",
    name: "方形箱型 60×40×40", 
    dimensions: [60, 40, 40],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "方形设计"
  },
  {
    id: "preset-8",
    name: "小型箱型 27×27×37",
    dimensions: [27, 27, 37],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "小型物品专用"
  },
  {
    id: "preset-9",
    name: "迷你箱型 28×14.5×28",
    dimensions: [28, 14.5, 28],
    thickness: 0,
    netWeight: 0,
    grossWeight: 0,
    description: "迷你尺寸"
  }
];

// 获取预设选项用于下拉框
export const getBoxPresetOptions = (customPresets?: BoxPreset[]) => {
  const presets = customPresets || boxPresets;
  return [
    { value: "", label: "请选择箱子规格" },
    ...presets.map(preset => ({
      value: preset.id,
      label: preset.name
    }))
  ];
};

// 根据ID获取预设数据
export const getBoxPresetById = (id: string, customPresets?: BoxPreset[]): BoxPreset | undefined => {
  const presets = customPresets || boxPresets;
  return presets.find(preset => preset.id === id);
};