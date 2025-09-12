// 示例装箱结果数据
// 注意：这是装箱算法的输出结果，不包含厚度字段
// 厚度字段仅在输入数据中使用，算法会自动计算调整后的尺寸
import { AlgoResult } from "packme-wasm";

export const SAMPLE_RESULT: AlgoResult = {
  unpacked_items: [
    {
      id: "物品 1",
      dim: {
        length: 10,
        width: 10,
        height: 30,
      },
      pos: {
        length: 0,
        width: 0,
        height: 0,
      },
      rot: "LHW",
    },
  ],
  containers: [
    {
      id: "容器 1",
      dim: {
        length: 20,
        width: 20,
        height: 30,
      },
      items: [
        {
          id: "物品 1",
          dim: {
            length: 10,
            width: 10,
            height: 30,
          },
          pos: {
            length: 0,
            width: 0,
            height: 0,
          },
          rot: "LWH",
        },
        {
          id: "物品 1",
          dim: {
            length: 10,
            width: 10,
            height: 30,
          },
          pos: {
            length: 10,
            width: 0,
            height: 0,
          },
          rot: "LWH",
        },
        {
          id: "物品 1",
          dim: {
            length: 10,
            width: 10,
            height: 30,
          },
          pos: {
            length: 0,
            width: 10,
            height: 0,
          },
          rot: "LWH",
        },
        {
          id: "物品 1",
          dim: {
            length: 10,
            width: 10,
            height: 30,
          },
          pos: {
            length: 10,
            width: 10,
            height: 0,
          },
          rot: "LWH",
        },
      ],
    },
  ],
};
