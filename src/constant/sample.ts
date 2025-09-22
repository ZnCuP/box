// 示例装箱结果数据
// 注意：这是装箱算法的输出结果，不包含厚度字段
// 厚度字段仅在输入数据中使用，算法会自动计算调整后的尺寸
import { AlgoResult, Vector3, Rotation, Item, Container } from "../algorithm/packingAlgorithm";

// 创建示例产品
const sampleItem1 = new Item(
  "产品 1",
  new Vector3(10, 10, 30)
);
sampleItem1.pos = new Vector3(0, 0, 0);
sampleItem1.rot = Rotation.LWH;

const sampleItem2 = new Item(
  "产品 2",
  new Vector3(10, 10, 30)
);
sampleItem2.pos = new Vector3(10, 0, 0);
sampleItem2.rot = Rotation.LWH;

const sampleItem3 = new Item(
  "产品 3",
  new Vector3(10, 10, 30)
);
sampleItem3.pos = new Vector3(0, 10, 0);
sampleItem3.rot = Rotation.LWH;

const sampleItem4 = new Item(
  "产品 4",
  new Vector3(10, 10, 30)
);
sampleItem4.pos = new Vector3(10, 10, 0);
sampleItem4.rot = Rotation.LWH;

// 创建示例容器
const sampleContainer = new Container(
  "容器 1",
  new Vector3(20, 20, 30)
);

// 为容器添加产品
sampleContainer.items = [sampleItem1, sampleItem2, sampleItem3, sampleItem4];

export const SAMPLE_RESULT: AlgoResult = {
  unpacked_items: [],
  containers: [sampleContainer]
};
