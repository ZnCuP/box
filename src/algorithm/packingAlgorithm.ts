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

  constructor(
    public id: string,
    public dim: Vector3
  ) {
    this.pos = Vector3.default();
    this.rot = Rotation.LWH;
  }

  static new(id: string, length: number, width: number, height: number): Item {
    return new Item(id, Vector3.new([length, width, height]));
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
    const cloned = new Item(this.id, this.dim.clone());
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

  constructor(
    public id: string,
    public dim: Vector3
  ) {
    this.items = [];
  }

  static new(id: string, dim: Vector3): Container {
    return new Container(id, dim);
  }

  clone(): Container {
    const cloned = new Container(this.id, this.dim.clone());
    cloned.items = this.items.map(item => item.clone());
    return cloned;
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

// 输入数据结构
export interface AlgoItemInput {
  id: string;
  qty: number;
  dim: [number, number, number];
}

export interface AlgoInput {
  items: AlgoItemInput[];
  containers: AlgoItemInput[];
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
      Container.new(c.id, Vector3.new(c.dim)),
      c.qty
    ));

    const items: ItemSpec[] = input.items.map(i => new ItemSpec(
      Item.new(i.id, i.dim[0], i.dim[1], i.dim[2]),
      i.qty
    ));

    return new PackingAlgorithm(items, containers);
  }

  pack(): AlgoResult {
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

    // 遍历每个物品规格
    for (const itemSpec of this.items) {
      for (let i = 0; i < itemSpec.qty; i++) {
        const newItem = itemSpec.spec.clone();
        let isPacked = false;

        // 尝试放入已有容器
        for (const container of containers) {
          isPacked = this.packItem(newItem, container);
          if (isPacked) {
            break;
          }
        }

        // 如果没有放入成功，尝试新容器
        if (!isPacked) {
          for (const containerSpec of this.containers) {
            if (containerSpec.qty > 0) {
              const newContainer = containerSpec.spec.clone();
              isPacked = this.packItem(newItem, newContainer);
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

  private packItem(item: Item, container: Container): boolean {
    if (container.items.length < 1) {
      return this.packToBox(item, container, Vector3.default());
    }

    // 优化：先尝试最简单的位置
    const axes = [Axis.X, Axis.Y, Axis.Z];
    const itemsLength = container.items.length;
    
    for (const axis of axes) {
      for (let x = 0; x < itemsLength; x++) {
        const existingItem = container.items[x];
        const pivot = Vector3.computePivot(
          axis,
          existingItem.pos,
          existingItem.dimensions()
        );
        
        // 提前检查边界，避免不必要的碰撞检测
        const itemDim = item.dim; // 使用原始尺寸进行快速检查
        if (pivot.length + itemDim.length <= container.dim.length &&
            pivot.width + itemDim.width <= container.dim.width &&
            pivot.height + itemDim.height <= container.dim.height) {
          if (this.packToBox(item, container, pivot)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private packToBox(item: Item, container: Container, pivot: Vector3): boolean {
    item.pos = pivot.clone();

    // 优化旋转顺序：先尝试原始方向，再尝试其他
    const rotations = [
      Rotation.LWH,  // 原始方向
      Rotation.WLH,  // 90度旋转
      Rotation.WHL,  // 其他旋转
      Rotation.HLW,
      Rotation.HWL,
      Rotation.LHW
    ];

    for (const rot of rotations) {
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