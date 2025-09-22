// packme-wasm 模块类型定义
declare module "packme-wasm" {
  export interface Vector3 {
    length: number;
    width: number;
    height: number;
  }

  export interface ItemResult {
    id: string;
    position: Vector3;
    dimensions: Vector3;
    rotation: string;
    weight?: number;
  }

  export interface ContainerResult {
    id: string;
    dimensions: Vector3;
    items: ItemResult[];
    utilization: number;
    weight?: number;
  }

  export interface AlgoResult {
    containers: ContainerResult[];
    unpackedItems: ItemResult[];
    totalUtilization: number;
    packingTime: number;
  }

  export interface AlgoInput {
    containers: Array<{
      id: string;
      dimensions: Vector3;
      maxWeight?: number;
      maxQuantity?: number;
    }>;
    items: Array<{
      id: string;
      dimensions: Vector3;
      weight?: number;
      quantity?: number;
      canRotate?: boolean;
    }>;
    packingMethod?: string;
  }

  export function pack(input: AlgoInput): AlgoResult;
}