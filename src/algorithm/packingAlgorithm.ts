// TypeScript移植版本的3D装箱算法
// 基于 packme-wasm 的 Rust 实现

// 枚举定义
export enum Rotation {
  LWH = "LWH",
  WLH = "WLH", 
  WHL = "WHL",
  HLW = "HLW",
  HWL = "HWL",
  LHW = "LHW"
}

export enum Axis {
  X = "X",
  Y = "Y", 
  Z = "Z"
}

// 3D向量类
export class Vector3 {
  constructor(
    public length: number = 0,
    public width: number = 0,
    public height: number = 0
  ) {}

  static new(params: [number, number, number]): Vector3 {
    return new Vector3(params[0], params[1], params[2]);
  }

  static default(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  volume(): number {
    return this.length * this.width * this.height;
  }

  getByAxis(axis: Axis): number {
    switch (axis) {
      case Axis.X: return this.length;
      case Axis.Y: return this.width;
      case Axis.Z: return this.height;
    }
  }

  static computePivot(axis: Axis, pos: Vector3, dims: Vector3): Vector3 {
    switch (axis) {
      case Axis.X:
        return new Vector3(pos.length + dims.length, pos.width, pos.height);
      case Axis.Y:
        return new Vector3(pos.length, pos.width + dims.width, pos.height);
      case Axis.Z:
        return new Vector3(pos.length, pos.width, pos.height + dims.height);
    }
  }

  clone(): Vector3 {
    return new Vector3(this.length, this.width, this.height);
  }
}

// 物品类
export class Item {
  public pos: Vector3;
  public rot: Rotation;
  private _cachedDimensions: Vector3 | null = null;
  private _cachedRotation: Rotation | null = null;
  public productNetWeight: number; // 产品净重 (g)
  public productGrossWeight: number; // 产品毛重 (g)
  public boxNetWeight: number; // 盒子净重 (g)

  constructor(
    public id: string,
    public dim: Vector3,
    productNetWeight: number = 0,
    productGrossWeight: number = 0,
    boxNetWeight: number = 0
  ) {
    this.pos = Vector3.default();
    this.rot = Rotation.LWH;
    this.productNetWeight = productNetWeight;
    this.productGrossWeight = productGrossWeight;
    this.boxNetWeight = boxNetWeight;
  }

  static new(id: string, length: number, width: number, height: number, productNetWeight: number = 0, productGrossWeight: number = 0, boxNetWeight: number = 0): Item {
    return new Item(id, new Vector3(length, width, height), productNetWeight, productGrossWeight, boxNetWeight);
  }

  dimensions(): Vector3 {
    // 缓存机制：只有旋转改变时才重新计算
    if (this._cachedDimensions && this._cachedRotation === this.rot) {
      return this._cachedDimensions;
    }
    
    let result: Vector3;
    switch (this.rot) {
      case Rotation.LWH:
        result = new Vector3(this.dim.length, this.dim.width, this.dim.height);
        break;
      case Rotation.WLH:
        result = new Vector3(this.dim.width, this.dim.length, this.dim.height);
        break;
      case Rotation.WHL:
        result = new Vector3(this.dim.width, this.dim.height, this.dim.length);
        break;
      case Rotation.HLW:
        result = new Vector3(this.dim.height, this.dim.length, this.dim.width);
        break;
      case Rotation.HWL:
        result = new Vector3(this.dim.height, this.dim.width, this.dim.length);
        break;
      case Rotation.LHW:
        result = new Vector3(this.dim.length, this.dim.height, this.dim.width);
        break;
    }
    
    this._cachedDimensions = result;
    this._cachedRotation = this.rot;
    return result;
  }

  static collision(itemA: Item, itemB: Item, ax: Axis, ay: Axis): boolean {
    const dim1 = itemA.dimensions();
    const dim2 = itemB.dimensions();

    // 优化：直接使用边界检测，避免中心点计算
    const pos1X = itemA.pos.getByAxis(ax);
    const pos1Y = itemA.pos.getByAxis(ay);
    const size1X = dim1.getByAxis(ax);
    const size1Y = dim1.getByAxis(ay);
    
    const pos2X = itemB.pos.getByAxis(ax);
    const pos2Y = itemB.pos.getByAxis(ay);
    const size2X = dim2.getByAxis(ax);
    const size2Y = dim2.getByAxis(ay);

    // AABB碰撞检测：如果两个矩形不重叠，则返回false
    return !(pos1X + size1X <= pos2X || 
             pos2X + size2X <= pos1X || 
             pos1Y + size1Y <= pos2Y || 
             pos2Y + size2Y <= pos1Y);
  }

  collisions(itemB: Item): boolean {
    // 优化：3D碰撞检测，直接计算所有轴
    const dim1 = this.dimensions();
    const dim2 = itemB.dimensions();
    
    // 检查X轴重叠
    if (this.pos.length + dim1.length <= itemB.pos.length || 
        itemB.pos.length + dim2.length <= this.pos.length) {
      return false;
    }
    
    // 检查Y轴重叠
    if (this.pos.width + dim1.width <= itemB.pos.width || 
        itemB.pos.width + dim2.width <= this.pos.width) {
      return false;
    }
    
    // 检查Z轴重叠
    if (this.pos.height + dim1.height <= itemB.pos.height || 
        itemB.pos.height + dim2.height <= this.pos.height) {
      return false;
    }
    
    return true; // 所有轴都重叠，发生碰撞
  }

  clone(): Item {
    const cloned = new Item(this.id, this.dim.clone(), this.productNetWeight, this.productGrossWeight, this.boxNetWeight);
    cloned.pos = this.pos.clone();
    cloned.rot = this.rot;
    // 清除缓存，让新对象重新计算
    cloned._cachedDimensions = null;
    cloned._cachedRotation = null;
    return cloned;
  }
}

// 容器类
export class Container {
  public items: Item[];
  public labelOrientation: LabelOrientation;
  public packingMethod: string;
  public maxWeight: number; // 最大重量 (kg)
  public containerNetWeight: number; // 容器净重 (kg)

  constructor(
    public id: string,
    public dim: Vector3,
    labelOrientation: LabelOrientation = 'auto',
    packingMethod: string = 'space',
    maxWeight: number = 0,
    containerNetWeight: number = 0
  ) {
    this.items = [];
    this.labelOrientation = labelOrientation;
    this.packingMethod = packingMethod;
    this.maxWeight = maxWeight;
    this.containerNetWeight = containerNetWeight;
  }

  static new(id: string, dim: Vector3, labelOrientation: LabelOrientation = 'auto', packingMethod: string = 'space', maxWeight: number = 0, containerNetWeight: number = 0): Container {
    return new Container(id, dim, labelOrientation, packingMethod, maxWeight, containerNetWeight);
  }

  clone(): Container {
    const cloned = new Container(this.id, this.dim.clone(), this.labelOrientation, this.packingMethod, this.maxWeight, this.containerNetWeight);
    cloned.items = this.items.map(item => item.clone());
    return cloned;
  }

  // 计算容器当前重量 (g)
  getCurrentWeight(): number {
    if (this.packingMethod !== 'weight') {
      return 0; // 非重量装箱模式不检查重量
    }
    
    // 容器净重 (kg转g) + 所有物品的毛重 (产品净重+盒子净重)
    const itemsWeight = this.items.reduce((total, item) => {
      const itemGrossWeight = item.productNetWeight + item.boxNetWeight; // 直接计算毛重
      return total + itemGrossWeight;
    }, 0);
    
    return (this.containerNetWeight * 1000) + itemsWeight; // kg转g
  }

  // 检查添加新物品后是否超重
  canAddItem(item: Item): boolean {
    if (this.packingMethod !== 'weight' || this.maxWeight <= 0) {
      console.log(`容器${this.id}: 非重量装箱模式或未设置最大重量，跳过重量检查`);
      return true; // 非重量装箱模式或未设置最大重量，不检查重量
    }
    
    const currentWeight = this.getCurrentWeight(); // g单位
    const newItemWeight = item.productNetWeight + item.boxNetWeight; // 直接计算毛重
    const totalWeight = currentWeight + newItemWeight;
    const maxWeightInGrams = this.maxWeight * 1000; // kg转g
    
    console.log(`容器${this.id}重量检查: 当前${(currentWeight/1000).toFixed(3)}kg + 新物品${(newItemWeight/1000).toFixed(3)}kg = ${(totalWeight/1000).toFixed(3)}kg, 最大${this.maxWeight}kg, 结果: ${totalWeight <= maxWeightInGrams ? '通过' : '超重'}`);
    
    return totalWeight <= maxWeightInGrams;
  }
}

// 规格类
export class ItemSpec {
  constructor(
    public spec: Item,
    public qty: number
  ) {}
}

export class ContainerSpec {
  constructor(
    public spec: Container,
    public qty: number
  ) {}
}

// 标签面朝向类型
export type LabelOrientation = 'auto' | 'length_width_up' | 'length_height_up' | 'width_height_up';

// 根据标签面朝向获取允许的旋转
function getAllowedRotations(orientation: LabelOrientation): Rotation[] {
  switch (orientation) {
    case 'length_width_up':
      // 长×宽面朝上，高度方向不变
      return [Rotation.LWH, Rotation.WLH];
    case 'length_height_up':
      // 长×高面朝上，宽度方向不变
      return [Rotation.LHW, Rotation.HLW];
    case 'width_height_up':
      // 宽×高面朝上，长度方向不变
      return [Rotation.WHL, Rotation.HWL];
    case 'auto':
    default:
      // 自动选择，允许所有旋转
      return [Rotation.LWH, Rotation.WLH, Rotation.WHL, Rotation.HLW, Rotation.HWL, Rotation.LHW];
  }
}

// 输入数据结构
export interface AlgoItemInput {
  id: string;
  qty: number;
  dim: [number, number, number];
  productNetWeight?: number; // 产品净重 (g)
  productGrossWeight?: number; // 产品毛重 (g)
  boxNetWeight?: number; // 盒子净重 (g)
}

export interface AlgoContainerInput {
  id: string;
  qty: number;
  dim: [number, number, number];
  labelOrientation?: LabelOrientation;
  packingMethod?: string; // 装箱方式
  maxWeight?: number; // 最大重量 (kg)
  containerNetWeight?: number; // 容器净重 (kg)
}

export interface AlgoInput {
  items: AlgoItemInput[];
  containers: AlgoContainerInput[];
}

// 结果数据结构
export interface AlgoResult {
  unpacked_items: Item[];
  containers: Container[];
}

// 核心装箱算法类
export class PackingAlgorithm {
  public items: ItemSpec[];
  public containers: ContainerSpec[];

  constructor(items: ItemSpec[], containers: ContainerSpec[]) {
    this.items = items;
    this.containers = containers;
  }

  static fromInput(input: AlgoInput): PackingAlgorithm {
    const containers: ContainerSpec[] = input.containers.map(c => new ContainerSpec(
      Container.new(
        c.id, 
        Vector3.new(c.dim), 
        c.labelOrientation || 'auto',
        c.packingMethod || 'space',
        c.maxWeight || 0,
        c.containerNetWeight || 0
      ),
      c.qty
    ));

    const items: ItemSpec[] = input.items.map(i => new ItemSpec(
      Item.new(
        i.id, 
        i.dim[0], 
        i.dim[1], 
        i.dim[2],
        i.productNetWeight || 0,
        i.productGrossWeight || 0,
        i.boxNetWeight || 0
      ),
      i.qty
    ));

    return new PackingAlgorithm(items, containers);
  }

  pack(): AlgoResult {
    // 调试信息：打印输入数据
    console.log('装箱算法输入数据:');
    console.log('容器:', this.containers.map(c => ({
      id: c.spec.id,
      packingMethod: c.spec.packingMethod,
      maxWeight: c.spec.maxWeight,
      containerNetWeight: c.spec.containerNetWeight
    })));
    console.log('物品详细信息:', this.items.map(i => ({
      id: i.spec.id,
      qty: i.qty,
      productNetWeight: `${(i.spec.productNetWeight/1000).toFixed(3)}kg`,
      productGrossWeight: `${(i.spec.productGrossWeight/1000).toFixed(3)}kg`,
      boxNetWeight: `${(i.spec.boxNetWeight/1000).toFixed(3)}kg`,
      '完整Item对象': i.spec
    })));
    
    // 额外调试：检查第一个物品的重量
    if (this.items.length > 0) {
      const firstItem = this.items[0].spec;
      console.log('第一个物品重量详情:', {
        productNetWeight: `${(firstItem.productNetWeight/1000).toFixed(3)}kg`,
        productGrossWeight: `${(firstItem.productGrossWeight/1000).toFixed(3)}kg`,
        boxNetWeight: `${(firstItem.boxNetWeight/1000).toFixed(3)}kg`
      });
    }
    
    // 按体积排序容器（大到小，优先使用大容器）
    this.containers.sort((a, b) => {
      const volA = a.spec.dim.volume();
      const volB = b.spec.dim.volume();
      return volB - volA;
    });

    // 按体积排序物品（大到小，优先装大物品）
    this.items.sort((a, b) => {
      const volA = a.spec.dim.volume();
      const volB = b.spec.dim.volume();
      return volB - volA;
    });

    const containers: Container[] = [];
    const unpackedItems: Item[] = [];
    
    // 计算总物品数量，用于性能优化
    const totalItems = this.items.reduce((sum, spec) => sum + spec.qty, 0);
    const useSimpleAlgorithm = totalItems > 100; // 超过100个物品时使用简化算法

    // 遍历每个物品规格
    for (const itemSpec of this.items) {
      for (let i = 0; i < itemSpec.qty; i++) {
        const newItem = itemSpec.spec.clone();
        let isPacked = false;

        // 尝试放入已有容器
        for (const container of containers) {
          // 检查重量约束
          if (!container.canAddItem(newItem)) {
            continue; // 超重，跳过此容器
          }
          
          isPacked = useSimpleAlgorithm ? 
            this.packItemSimple(newItem, container) : 
            this.packItem(newItem, container);
          if (isPacked) {
            break;
          }
        }

        // 如果没有放入成功，尝试新容器
        if (!isPacked) {
          for (const containerSpec of this.containers) {
            if (containerSpec.qty > 0) {
              const newContainer = containerSpec.spec.clone();
              
              // 检查重量约束
              if (!newContainer.canAddItem(newItem)) {
                continue; // 超重，跳过此容器规格
              }
              
              isPacked = useSimpleAlgorithm ? 
                this.packItemSimple(newItem, newContainer) : 
                this.packItem(newItem, newContainer);
              if (isPacked) {
                containerSpec.qty--;
                containers.push(newContainer);
                break;
              }
            }
          }

          if (!isPacked) {
            unpackedItems.push(newItem);
          }
        }
      }
    }

    return {
      containers,
      unpacked_items: unpackedItems
    };
  }

  // 简化版装箱算法，用于大量物品时的快速处理
  private packItemSimple(item: Item, container: Container): boolean {
    if (container.items.length < 1) {
      return this.packToBox(item, container, Vector3.default());
    }

    // 只尝试最基本的位置：已有物品的右侧、后侧、上方
    const allowedRotations = getAllowedRotations(container.labelOrientation);
    
    for (const existingItem of container.items) {
      const itemPos = existingItem.pos;
      const itemDims = existingItem.dimensions();
      
      const positions = [
        new Vector3(itemPos.length + itemDims.length, itemPos.width, itemPos.height), // 右侧
        new Vector3(itemPos.length, itemPos.width + itemDims.width, itemPos.height), // 后侧
        new Vector3(itemPos.length, itemPos.width, itemPos.height + itemDims.height)  // 上方
      ];
      
      for (const pos of positions) {
        for (const rotation of allowedRotations) {
          const testItem = item.clone();
          testItem.rot = rotation;
          testItem.pos = pos;
          
          const testDims = testItem.dimensions();
          
          // 快速边界检查
          if (pos.length + testDims.length <= container.dim.length &&
              pos.width + testDims.width <= container.dim.width &&
              pos.height + testDims.height <= container.dim.height) {
            
            // 快速碰撞检查
            if (!this.hasCollision(testItem, container)) {
              return this.packToBox(item, container, pos);
            }
          }
        }
      }
    }
    
    return false;
  }

  private packItem(item: Item, container: Container): boolean {
    if (container.items.length < 1) {
      return this.packToBox(item, container, Vector3.default());
    }

    // 使用Bottom-Left-Fill策略寻找最优位置
    const bestPosition = this.findBestPosition(item, container);
    if (bestPosition) {
      return this.packToBox(item, container, bestPosition);
    }
    
    return false;
  }

  // Bottom-Left-Fill策略：寻找最优放置位置（优化版本）
  private findBestPosition(item: Item, container: Container): Vector3 | null {
    // 生成候选位置
    const positions = this.generateCandidatePositions(container);
    const allowedRotations = getAllowedRotations(container.labelOrientation);
    
    let bestPosition: Vector3 | null = null;
    let bestScore = -1;
    
    // 优先尝试简单位置，找到合适的就立即返回
    for (const pos of positions) {
      for (const rotation of allowedRotations) {
        const testItem = item.clone();
        testItem.rot = rotation;
        testItem.pos = pos;
        
        const itemDims = testItem.dimensions();
        
        // 快速边界检查
        if (pos.length + itemDims.length > container.dim.length ||
            pos.width + itemDims.width > container.dim.width ||
            pos.height + itemDims.height > container.dim.height) {
          continue;
        }
        
        // 快速碰撞检查
        if (this.hasCollision(testItem, container)) {
          continue;
        }
        
        // 简化的评分计算
        const score = this.calculateSimpleScore(pos, itemDims, container);
        
        if (score > bestScore) {
          bestScore = score;
          bestPosition = pos.clone();
          
          // 如果找到很好的位置（底部且靠角落），立即返回
          if (pos.height === 0 && (pos.length === 0 || pos.width === 0)) {
            return bestPosition;
          }
        }
      }
    }
    
    return bestPosition;
  }

  // 简化的评分计算
  private calculateSimpleScore(pos: Vector3, _itemDims: Vector3, container: Container): number {
    // 简单的距离评分：越靠近原点得分越高
    const distance = pos.length + pos.width + pos.height;
    const maxDistance = container.dim.length + container.dim.width + container.dim.height;
    const distanceScore = (maxDistance - distance) / maxDistance;
    
    // 底部接触奖励
    const bottomBonus = pos.height === 0 ? 0.5 : 0;
    
    // 角落奖励
    const cornerBonus = (pos.length === 0 || pos.width === 0) ? 0.3 : 0;
    
    return distanceScore + bottomBonus + cornerBonus;
  }

  // 生成候选位置（优化版本）
  private generateCandidatePositions(container: Container): Vector3[] {
    const positions: Vector3[] = [];
    
    // 添加原点
    positions.push(Vector3.default());
    
    // 基于已有物品生成候选位置（只生成关键位置）
    for (const existingItem of container.items) {
      const itemPos = existingItem.pos;
      const itemDims = existingItem.dimensions();
      
      // 在物品的3个主要面生成候选位置
      positions.push(new Vector3(itemPos.length + itemDims.length, itemPos.width, itemPos.height)); // 右侧
      positions.push(new Vector3(itemPos.length, itemPos.width + itemDims.width, itemPos.height)); // 后侧
      positions.push(new Vector3(itemPos.length, itemPos.width, itemPos.height + itemDims.height)); // 上方
    }
    
    // 简化的网格搜索（减少搜索密度）
    if (container.items.length < 5) { // 只在物品较少时进行网格搜索
      const stepX = Math.max(5, Math.floor(container.dim.length / 5));
      const stepY = Math.max(5, Math.floor(container.dim.width / 5));
      const stepZ = Math.max(5, Math.floor(container.dim.height / 5));
      
      for (let x = 0; x <= container.dim.length; x += stepX) {
        for (let y = 0; y <= container.dim.width; y += stepY) {
          for (let z = 0; z <= container.dim.height; z += stepZ) {
            positions.push(new Vector3(x, y, z));
          }
        }
      }
    }
    
    // 快速去重
    const positionSet = new Set<string>();
    const uniquePositions: Vector3[] = [];
    
    for (const pos of positions) {
      const key = `${pos.length},${pos.width},${pos.height}`;
      if (!positionSet.has(key)) {
        positionSet.add(key);
        uniquePositions.push(pos);
      }
    }
    
    return uniquePositions;
  }





  // 检测碰撞
  private hasCollision(item: Item, container: Container): boolean {
    const itemPos = item.pos;
    const itemDims = item.dimensions();
    
    for (const existingItem of container.items) {
      const existingPos = existingItem.pos;
      const existingDims = existingItem.dimensions();
      
      // 检查3D碰撞
      const overlapX = Math.max(0, Math.min(itemPos.length + itemDims.length, existingPos.length + existingDims.length) - Math.max(itemPos.length, existingPos.length));
      const overlapY = Math.max(0, Math.min(itemPos.width + itemDims.width, existingPos.width + existingDims.width) - Math.max(itemPos.width, existingPos.width));
      const overlapZ = Math.max(0, Math.min(itemPos.height + itemDims.height, existingPos.height + existingDims.height) - Math.max(itemPos.height, existingPos.height));
      
      // 如果三个维度都有重叠，则发生碰撞
      if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
        return true;
      }
    }
    
    return false;
  }

  private packToBox(item: Item, container: Container, pivot: Vector3): boolean {
    item.pos = pivot.clone();

    // 根据容器的标签朝向约束获取允许的旋转
    const allowedRotations = getAllowedRotations(container.labelOrientation);

    for (const rot of allowedRotations) {
      item.rot = rot;
      const idims = item.dimensions();

      // 快速边界检查
      if (pivot.length + idims.length > container.dim.length ||
          pivot.width + idims.width > container.dim.width ||
          pivot.height + idims.height > container.dim.height) {
        continue;
      }

      // 优化碰撞检测：使用早期退出
      let hasCollision = false;
      const containerItems = container.items;
      const itemsCount = containerItems.length;
      
      for (let i = 0; i < itemsCount; i++) {
        if (item.collisions(containerItems[i])) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        container.items.push(item.clone());
        return true;
      }
    }

    item.pos = Vector3.default();
    return false;
  }
}

// 导出主要的装箱函数
export function pack(input: AlgoInput): AlgoResult {
  const algo = PackingAlgorithm.fromInput(input);
  return algo.pack();
}