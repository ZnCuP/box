// 主应用组件 - 3D装箱可视化
import { Box, Button, VStack } from "@chakra-ui/react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, Edges } from "@react-three/drei";
import {
  AlgoResult,
  ContainerResult,
  ItemResult,
} from "packme-wasm";
import { ExtendedAlgoInput, ExtendedAlgoResult, convertToAlgoInput, convertToExtendedResult } from "./types/extended";
import { useMount } from "./hooks/useMount";
import { useContext, useMemo, useRef, useState } from "react";
import { SAMPLE_RESULT } from "./constant/sample";
import { AppContext } from "./components/AppProvider";
import Sidebar from "./components/Sidebar";
import * as XLSX from 'xlsx';

export default function App() {
  // Worker准备状态
  const [isWorkerReady, setWorkerReady] = useState(false);
  // 装箱计算状态
  const [isPacking, setPacking] = useState(false);
  // 装箱结果
  const [result, setResult] = useState<AlgoResult | undefined>(SAMPLE_RESULT);
  // 扩展装箱结果（用于PDF导出）
  const [extendedResult, setExtendedResult] = useState<ExtendedAlgoResult | undefined>();
  // 原始输入数据（用于PDF导出）
  const [originalInput, setOriginalInput] = useState<ExtendedAlgoInput | undefined>();
  const originalInputRef = useRef<ExtendedAlgoInput | undefined>();
  // Worker引用
  const workerRef = useRef<Worker>();

  // 执行装箱计算
  const workerPack = (input: ExtendedAlgoInput) => {
    setResult(undefined);
    setExtendedResult(undefined);
    setPacking(true);
    setOriginalInput(input);
    originalInputRef.current = input;
    // 将扩展类型转换为packme-wasm所需的标准类型
    const convertedInput = convertToAlgoInput(input);
    workerRef.current?.postMessage({ type: "pack", input: convertedInput });
  };

  // 导出Excel功能
  const exportToExcel = () => {
    if (!extendedResult || !extendedResult.containers || !originalInput) {
      alert("请先进行装箱计算");
      return;
    }

    // 只处理实际有物品的容器
    const containersWithItems = extendedResult.containers.filter(container => container.items && container.items.length > 0);
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    containersWithItems.forEach((container, containerIndex) => {
      // 计算容器中物品的总数量（每个item代表一个实际放置的物品）
      const totalQty = container.items.length;
      
      // 获取第一个物品的信息作为代表（假设同一容器中的物品类型相同）
      const firstItem = container.items[0];
      
      // 获取原始容器输入数据（显示原始尺寸，不是减去厚度后的尺寸）
      const originalContainer = originalInput.containers[containerIndex];
      
      // 表格数据 - 每个容器只有一行
      const tableData = [{
        "单号箱号": container.orderBoxNumber || "",
        "标签": firstItem?.id || "",
        "OE号": firstItem?.oeNumber || "",
        "产品净重/g": firstItem?.productNetWeight || 0,
        "产品毛重/g": firstItem?.productGrossWeight || 0,
        "盒子净重/g": firstItem?.boxNetWeight || 0,
        "盒子规格/cm": firstItem ? `${firstItem.dim.length}×${firstItem.dim.width}×${firstItem.dim.height}` : "",
        "数量/个": totalQty,
        "外箱净重/kg": container.containerNetWeight || 0,
        "外箱毛重/kg": container.containerGrossWeight || 0,
        "外箱规格/cm": originalContainer ? `${originalContainer.dim[0]}×${originalContainer.dim[1]}×${originalContainer.dim[2]}` : `${container.dim.length}×${container.dim.width}×${container.dim.height}`
      }];

      // 创建工作表
      const worksheet = XLSX.utils.json_to_sheet(tableData);
      
      // 添加工作表到工作簿
      const sheetName = `容器${containerIndex + 1}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // 保存文件
    XLSX.writeFile(workbook, "装箱结果.xlsx");
  };

  // 初始化装箱Worker
  useMount(() => {
    const setupPacker = async () => {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e) => {
        if (e.data === "ready") {
          setWorkerReady(true);
        }

        if (e.data.type === "pack_result") {
          const algoResult = e.data.data;
          setResult(algoResult);
          // 使用ref中的originalInput来转换结果
          if (originalInputRef.current) {
            setExtendedResult(convertToExtendedResult(algoResult, originalInputRef.current));
          }
          setPacking(false);
        }

        if (e.data.type === "timing") {
          console.log("done in", e.data.data, "ms");
        }
      };

      workerRef.current = worker;
    };

    setupPacker();
  });

  // 计算最大高度用于相机定位
  const maxZ =
    result?.containers?.reduce((acc, container) => {
      return Math.max(acc, container.dim.height);
    }, 0) || 0;

  return (
    <>
      <VStack spacing={0} align="stretch">
        <Sidebar
          isPackingReady={isWorkerReady}
          isLoading={isPacking}
          onPack={workerPack}
        />
        <Box p={4} bg="gray.50" borderTop="1px" borderColor="gray.200">
          <Button
             colorScheme="green"
             onClick={exportToExcel}
             isDisabled={!extendedResult || !extendedResult.containers}
             size="sm"
           >
             导出PDF
           </Button>
        </Box>
      </VStack>
      <Box w="100svw" h="100svh" position="absolute" top={0} left={0} zIndex={-1}>
        <Canvas shadows camera={{ position: [0, 0, maxZ + 80], fov: 50 }}>
          {maxZ === 0 ? null : (
            <Center>
              <group position={[0, -20, 0]}>
                {result?.containers?.map((container, idx, arrs) => {
                  let offset = 0;
                  for (let i = 0; i < idx; i++) {
                    offset += arrs[i].dim.length + 10;
                  }
                  return (
                    <group key={idx} position={[offset, 0, 0]}>
                      <Container data={container} />
                    </group>
                  );
                })}
              </group>
            </Center>
          )}
          <Env />
          <OrbitControls enablePan={true} enableZoom={true} />
        </Canvas>
      </Box>
    </>
  );
}

function Container(props: { data: ContainerResult }) {
  const { data } = props;

  return (
    <>
      <mesh
        castShadow
        position={[
          data.dim.width / 2,
          data.dim.height / 2,
          data.dim.length / 2,
        ]}
      >
        <boxGeometry
          args={[
            data.dim.width + 0.2,
            data.dim.height + 0.2,
            data.dim.length + 0.2,
          ]}
        />
        <meshStandardMaterial
          metalness={1}
          roughness={1}
          transparent
          opacity={0.1}
        />
        <Edges castShadow />
      </mesh>
      {data.items.map((item, idx) => (
        <BoxItem key={idx} data={item} />
      ))}
    </>
  );
}

function BoxItem(props: { data: ItemResult }) {
  const { data } = props;
  const { colorMap } = useContext(AppContext);
  const dim = useMemo(() => {
    let result = [data.dim.length, data.dim.width, data.dim.height];
    switch (data.rot) {
      case "HLW":
        result = [data.dim.height, data.dim.length, data.dim.width];
        break;
      case "LHW":
        result = [data.dim.length, data.dim.height, data.dim.width];
        break;
      case "LWH":
        result = [data.dim.length, data.dim.width, data.dim.height];
        break;
      case "WLH":
        result = [data.dim.width, data.dim.length, data.dim.height];
        break;
      case "WHL":
        result = [data.dim.width, data.dim.height, data.dim.length];
        break;
      default:
    }
    return result;
  }, [data]);
  return (
    <mesh
      position={[
        data.pos.width + dim[1] / 2,
        data.pos.height + dim[2] / 2,
        data.pos.length + dim[0] / 2,
      ]}
      castShadow
    >
      <boxGeometry args={[dim[1], dim[2], dim[0]]} />
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={colorMap.get(data.id) || "#3182ce"}
      />
      <Edges castShadow />
    </mesh>
  );
}

function Env() {
  return <Environment preset="warehouse" background blur={0.65} />;
}
