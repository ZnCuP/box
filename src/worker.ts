// WebAssembly装箱算法Worker
import { init } from "packme-wasm";

(async () => {
  // 加载WASM文件
  const res = await fetch("/packme.wasm");
  const buffer = await res.arrayBuffer();
  // 初始化装箱器
  const packer = await init(buffer);
  // 通知主线程Worker已准备就绪
  self.postMessage("ready");

  // 监听主线程消息
  self.onmessage = (e) => {
    const data = e.data;
    if (data.type === "pack") {
      // 记录开始时间
      const start = performance.now();
      // 执行装箱计算
      const result = packer.pack(data.input);
      // 记录结束时间
      const end = performance.now();
      // 发送计算耗时
      self.postMessage({ type: "timing", data: end - start });
      // 发送计算结果
      self.postMessage({ type: "pack_result", data: result });
    }
  };
})();
