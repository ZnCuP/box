// 扩展类型定义文件
import { AlgoResult, ItemResult, Vector3 } from "packme-wasm";
import { AlgoInput } from "../algorithm/packingAlgorithm";

// 扩展的物品输入类型，包含厚度字段、OE号和重量信息
export type ExtendedItemInput = {
  id: string;
  qty: number;
  dim: [number, number, number]; // [长度, 宽度, 高度]
  thickness?: number; // 厚度，默认为0
  oeNumber?: string; // OE号
  productNetWeight?: number; // 产品净重，单位g
  productGrossWeight?: number; // 产品毛重，单位g
  boxNetWeight?: number; // 盒子净重，单位g
};

// 标签面朝向类型
export type LabelOrientation = 'auto' | 'length_width_up' | 'length_height_up' | 'width_height_up';

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
};

// 扩展的算法输入类型
export type ExtendedAlgoInput = {
  containers: ExtendedContainerInput[];
  items: ExtendedItemInput[];
};

// 扩展的物品结果类型
export type ExtendedItemResult = ItemResult & {
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

// 转换函数：将扩展类型转换为标准的AlgoInput类型
export function convertToAlgoInput(extendedInput: ExtendedAlgoInput): AlgoInput {
  return {
    containers: extendedInput.containers.map(container => ({
      id: container.id,
      qty: container.qty,
      dim: container.thickness 
        ? [container.dim[0] - container.thickness * 2, container.dim[1] - container.thickness * 2, container.dim[2] - container.thickness * 2] as [number, number, number]
        : container.dim,
      labelOrientation: container.labelOrientation || 'auto'
    })),
    items: extendedInput.items.map(item => ({
      id: item.id,
      qty: item.qty,
      dim: item.thickness 
        ? [item.dim[0], item.dim[1], item.dim[2] + item.thickness * 2] as [number, number, number]
        : item.dim
    }))
  };
}

// 转换函数：将扩展结果类型转换为标准结果类型
export function convertToExtendedResult(
  result: AlgoResult,
  originalInput: ExtendedAlgoInput
): ExtendedAlgoResult {
  return {
    containers: result.containers.map((container, containerIndex) => ({
      ...container,
      orderBoxNumber: originalInput.containers[containerIndex]?.orderBoxNumber || "",
      containerNetWeight: originalInput.containers[containerIndex]?.containerNetWeight || 0,
      containerGrossWeight: originalInput.containers[containerIndex]?.containerGrossWeight || 0,
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
    })),
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