// TypeScript装箱算法Worker
import { pack, type AlgoInput } from "./algorithm/packingAlgorithm";

// 通知主线程Worker已准备就绪
self.postMessage("ready");

// 监听主线程消息
self.onmessage = (e) => {
  const data = e.data;
  if (data.type === "pack") {
    try {
      // 记录开始时间
      const start = performance.now();
      // 执行装箱计算
      const result = pack(data.input as AlgoInput);
      // 记录结束时间
      const end = performance.now();
      // 发送计算耗时
      self.postMessage({ type: "timing", data: end - start });
      // 发送计算结果
      self.postMessage({ type: "pack_result", data: result });
    } catch (error: any) {
      // 发送错误信息
      self.postMessage({ type: "error", data: error.message });
    }
  }
};
