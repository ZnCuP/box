// 扩展类型定义文件
import { AlgoResult, Vector3, Rotation } from "../algorithm/packingAlgorithm";
import { AlgoInput } from "../algorithm/packingAlgorithm";

// 扩展的产品输入类型，包含OE号和重量信息
export type ExtendedItemInput = {
  id: string;
  qty: number;
  dim: [number, number, number]; // [长度, 宽度, 高度]
  oeNumber?: string; // OE号
  productNetWeight?: number; // 产品净重，单位g
  productGrossWeight?: number; // 产品毛重，单位g
  boxNetWeight?: number; // 盒子净重，单位g
};

// 标签面朝向类型
export type LabelOrientation = 'auto' | 'length_width_up' | 'length_height_up' | 'width_height_up';

// 装箱方式类型
export type PackingMethod = 'space' | 'weight' | 'quantity';

// 扩展的容器输入类型，包含单号箱号、重量信息和厚度
export type ExtendedContainerInput = {
  id: string;
  qty: number;
  dim: [number, number, number]; // [长度, 宽度, 高度]
  thickness?: number; // 厚度，默认为0
  orderBoxNumber?: string; // 单号箱号
  containerNetWeight?: number; // 外箱净重，单位kg
  containerGrossWeight?: number; // 外箱毛重，单位kg
  labelOrientation?: LabelOrientation; // 标签面朝向，默认为auto
  packingMethod?: PackingMethod; // 装箱方式，默认为space
  maxWeight?: number; // 最大重量（kg）
  maxQuantity?: number; // 最大数量
};

// 扩展的算法输入类型
export type ExtendedAlgoInput = {
  containers: ExtendedContainerInput[];
  items: ExtendedItemInput[];
};

// 扩展的物品结果类型
export type ExtendedItemResult = {
  id: string;
  dim: Vector3;
  pos: Vector3;
  rot: Rotation;
  qty?: number;
  oeNumber?: string;
  productNetWeight?: number;
  productGrossWeight?: number;
  boxNetWeight?: number;
};

// 扩展的容器结果类型
export type ExtendedContainerResult = {
  id: string;
  dim: Vector3;
  items: ExtendedItemResult[];
  orderBoxNumber?: string;
  containerNetWeight?: number;
  containerGrossWeight?: number;
};

// 扩展的算法结果类型
export type ExtendedAlgoResult = {
  containers: ExtendedContainerResult[];
  unpacked_items: ExtendedItemResult[];
};

// 辅助函数：安全地将值转换为数字，支持字符串形式的小数
function safeParseFloat(value: any): number {
  console.log('[extended.ts] safeParseFloat input:', {
    value,
    type: typeof value,
    isNull: value === null,
    isUndefined: value === undefined,
    isEmpty: value === ''
  });
  
  if (value === null || value === undefined || value === '') {
    console.log('[extended.ts] safeParseFloat returning 0 (null/undefined/empty)');
    return 0;
  }
  
  if (typeof value === 'number') {
    console.log('[extended.ts] safeParseFloat returning number:', value);
    return value;
  }
  
  if (typeof value === 'string') {
    // 处理中文句号
    const processedValue = value.replace(/。/g, '.');
    console.log('[extended.ts] safeParseFloat processed string:', processedValue);
    
    const parsed = parseFloat(processedValue);
    const result = isNaN(parsed) ? 0 : parsed;
    console.log('[extended.ts] safeParseFloat parsed result:', {
      parsed,
      isNaN: isNaN(parsed),
      finalResult: result
    });
    return result;
  }
  
  console.log('[extended.ts] safeParseFloat returning 0 (unknown type)');
  return 0;
}

// 转换函数：将扩展类型转换为标准的AlgoInput类型
export function convertToAlgoInput(extendedInput: ExtendedAlgoInput): AlgoInput {
  console.log('转换前的扩展输入数据:', extendedInput);
  
  const result = {
    containers: extendedInput.containers.map(container => ({
      id: container.id,
      qty: container.qty,
      dim: container.thickness 
        ? [container.dim[0] - safeParseFloat(container.thickness) * 2, container.dim[1] - safeParseFloat(container.thickness) * 2, container.dim[2] - safeParseFloat(container.thickness) * 2] as [number, number, number]
        : container.dim,
      labelOrientation: container.labelOrientation || 'auto',
      packingMethod: container.packingMethod || 'space',
      maxWeight: safeParseFloat(container.maxWeight),
      maxQuantity: container.maxQuantity || 0,
      containerNetWeight: safeParseFloat(container.containerNetWeight)
    })),
    items: extendedInput.items.map(item => ({
      id: item.id,
      qty: item.qty,
      dim: item.dim,
      productNetWeight: safeParseFloat(item.productNetWeight),
      productGrossWeight: safeParseFloat(item.productGrossWeight),
      boxNetWeight: safeParseFloat(item.boxNetWeight)
    }))
  };
  
  console.log('转换后的标准输入数据:', result);
  return result;
}

// 转换函数：将扩展结果类型转换为标准结果类型
export function convertToExtendedResult(
  result: AlgoResult,
  originalInput: ExtendedAlgoInput
): ExtendedAlgoResult {
  return {
    containers: result.containers.map((container) => {
      // 找到对应的原始容器输入（所有结果容器都来自第一个输入容器）
      const originalContainer = originalInput.containers[0];
      return {
        ...container,
        orderBoxNumber: originalContainer?.orderBoxNumber || "",
        containerNetWeight: originalContainer?.containerNetWeight || 0,
        containerGrossWeight: originalContainer?.containerGrossWeight || 0,
        items: container.items.map((item) => {
          // 根据item.id找到原始输入中对应的物品
          const originalItem = originalInput.items.find(inputItem => inputItem.id === item.id);
          return {
            ...item,
            oeNumber: originalItem?.oeNumber || "",
            productNetWeight: originalItem?.productNetWeight || 0,
            productGrossWeight: originalItem?.productGrossWeight || 0,
            boxNetWeight: originalItem?.boxNetWeight || 0,
            qty: originalItem?.qty || 0
          };
        })
      };
    }),
    unpacked_items: result.unpacked_items.map((item) => {
      const originalItem = originalInput.items.find(inputItem => inputItem.id === item.id);
      return {
        ...item,
        oeNumber: originalItem?.oeNumber || "",
        productNetWeight: originalItem?.productNetWeight || 0,
        productGrossWeight: originalItem?.productGrossWeight || 0,
        boxNetWeight: originalItem?.boxNetWeight || 0,
        qty: originalItem?.qty || 0
      };
    })
  };
}