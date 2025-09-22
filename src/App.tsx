// 主应用组件 - 3D装箱可视化
import { Box, Button, Flex } from "@chakra-ui/react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, Edges, Environment } from "@react-three/drei";
import {
  AlgoResult,
  Container as AlgoContainer,
  Item as AlgoItem,
} from "./algorithm/packingAlgorithm";
import { ExtendedAlgoInput, ExtendedAlgoResult, convertToAlgoInput, convertToExtendedResult } from "./types/extended";
import { useMount } from "./hooks/useMount";
import { useContext, useMemo, useRef, useState, useEffect } from "react";
import { SAMPLE_RESULT } from "./constant/sample";
import { AppContext } from "./components/AppProvider";
import ContainerFields from "./components/ContainerFields";
import BoxFields from "./components/BoxFields";
import { useForm, FormProvider } from "react-hook-form";
import * as XLSX from 'xlsx';
import { boxPresets, BoxPreset } from "./constant/containerPresets";
import BoxPresetEditor from "./components/BoxPresetEditor";
import ItemBoxPresetEditor, { ItemBoxPreset } from "./components/ItemBoxPresetEditor";
import { useDisclosure } from "@chakra-ui/react";
import { loadBoxPresetsFromDB, loadItemBoxPresetsFromDB } from './utils/fileUtils';
import itemBoxPresetsData from "./data/itemBoxPresets.json";

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
  
  // 侧边栏显示状态
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);
  
  // 箱子规格管理
  const [currentBoxPresets, setCurrentBoxPresets] = useState<BoxPreset[]>(boxPresets);
  const { isOpen: isPresetEditorOpen, onOpen: onPresetEditorOpen, onClose: onPresetEditorClose } = useDisclosure();

  // 盒子规格管理
  const [currentItemBoxPresets, setCurrentItemBoxPresets] = useState<ItemBoxPreset[]>(itemBoxPresetsData as ItemBoxPreset[]);
  const { isOpen: isItemBoxPresetEditorOpen, onOpen: onItemBoxPresetEditorOpen, onClose: onItemBoxPresetEditorClose } = useDisclosure();

  // 从API加载箱子规格
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const presets = await loadBoxPresetsFromDB();
        if (presets.length > 0) {
          setCurrentBoxPresets(presets);
        }
      } catch (error) {
        console.error('加载箱子规格失败:', error);
      }
    };
    loadPresets();
  }, []);

  // 从API加载盒子规格
  useEffect(() => {
    const loadItemBoxPresets = async () => {
      try {
        const presets = await loadItemBoxPresetsFromDB();
        if (presets.length > 0) {
          setCurrentItemBoxPresets(presets);
        }
      } catch (error) {
        console.error('加载盒子规格失败:', error);
      }
    };
    loadItemBoxPresets();
  }, []);

  // 保存箱子规格（现在直接更新状态，实际保存通过文件操作完成）
  const handlePresetsChange = (newPresets: BoxPreset[]) => {
    setCurrentBoxPresets(newPresets);
  };

  // 保存盒子规格
  const handleItemBoxPresetsChange = (newPresets: ItemBoxPreset[]) => {
    setCurrentItemBoxPresets(newPresets);
  };
  
  // 表单控制
  const formMethods = useForm<ExtendedAlgoInput>({
    mode: "onChange",
    defaultValues: {
      containers: [
        {
          id: "容器 1",
          qty: 1,
          dim: [100, 100, 100] as [number, number, number],
          orderBoxNumber: "BOX001",
          containerNetWeight: 1.0,
          containerGrossWeight: 0,
          labelOrientation: "auto" as const,
          packingMethod: "space" as const,
          maxWeight: 1.5,
          maxQuantity: 20,
        },
      ],
      items: [
        {
          id: "测试产品",
          qty: 5,
          dim: [10, 10, 30] as [number, number, number],
          oeNumber: "TEST001",
          productNetWeight: 100,
          productGrossWeight: 0,
          boxNetWeight: 50,
        },
      ],
    },
  });
  
  const { control, handleSubmit } = formMethods;
  
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
  
  const onSubmit = handleSubmit(workerPack);

  // 导出Excel功能
  const exportToExcel = () => {
    if (!extendedResult || !extendedResult.containers || !originalInput) {
      alert("请先进行装箱计算");
      return;
    }
    


    // 只处理实际有产品的容器
    const containersWithItems = extendedResult.containers.filter(container => container.items && container.items.length > 0);
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    containersWithItems.forEach((container, containerIndex) => {
      // 获取原始容器输入数据（显示原始尺寸，不是减去厚度后的尺寸）
      const originalContainer = originalInput.containers[0];
      
      // 按产品类型分组统计
      const itemGroups = new Map<string, {
        item: any;
        count: number;
      }>();
      
      container.items.forEach(item => {
        const key = item.id;
        if (itemGroups.has(key)) {
          itemGroups.get(key)!.count++;
        } else {
          itemGroups.set(key, {
            item: item,
            count: 1
          });
        }
      });
      
      // 为每种产品类型创建一行数据
      const tableData = Array.from(itemGroups.values()).map((group, index) => ({
        "单号箱号": index === 0 ? (container.orderBoxNumber || "") : "",
        "标签": group.item?.id || "",
        "OE号": group.item?.oeNumber || "",
        "产品净重/g": group.item?.productNetWeight || 0,
        "产品毛重/g": group.item?.productGrossWeight || 0,
        "盒子净重/g": group.item?.boxNetWeight || 0,
        "盒子规格/cm": group.item ? `${group.item.dim.length}×${group.item.dim.width}×${group.item.dim.height}` : "",
        "数量/个": group.count,
        "外箱净重/kg": index === 0 ? (container.containerNetWeight || 0) : "",
        "外箱毛重/kg": index === 0 ? (container.containerGrossWeight || 0) : "",
        "外箱规格/cm": index === 0 ? (originalContainer ? `${originalContainer.dim[0]}×${originalContainer.dim[1]}×${originalContainer.dim[2]}` : `${container.dim.length}×${container.dim.width}×${container.dim.height}`) : ""
      }));

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
    <Flex h="100svh">
      {/* 左侧容器面板 */}
      <Flex
        flexDir="column"
        w="320px"
        h="100%"
        bg="rgb(42 45 56 / 100%)"
        p="2"
        borderRadius="lg"
        position="fixed"
        top="0"
        left={leftSidebarVisible ? "0" : "-300px"}
        zIndex={9}
        transition="left 0.3s ease-in-out"
      >
        <Box flex="1" overflowY="scroll">
          <FormProvider {...formMethods}>
            <ContainerFields control={control} boxPresets={currentBoxPresets} />
          </FormProvider>
        </Box>
        <Box w="full" p="2">
          <Button
            size="xs"
            w="full"
            colorScheme="purple"
            onClick={onSubmit}
            isLoading={isPacking}
            isDisabled={!isWorkerReady}
          >
            开始装箱
          </Button>
        </Box>
      </Flex>
      
      {/* 左侧展开/收缩按钮 */}
       <Button
         position="fixed"
         top="50%"
         left={leftSidebarVisible ? "320px" : "0px"}
         transform="translateY(-50%)"
         zIndex={10}
         size="sm"
         colorScheme="blue"
         variant="solid"
         borderRadius="0 md md 0"
         onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
         transition="left 0.3s ease-in-out"
         px="2"
         py="4"
         bg="blue.500"
         _hover={{ bg: "blue.600" }}
         color="white"
         boxShadow="lg"
       >
         {leftSidebarVisible ? "◀" : "▶"}
       </Button>
      
      {/* 右侧产品面板 */}
       <Flex
         flexDir="column"
         w="320px"
         h="100%"
         bg="rgb(42 45 56 / 100%)"
         p="2"
         borderRadius="lg"
         position="fixed"
         top="0"
         right={rightSidebarVisible ? "0" : "-300px"}
         zIndex={9}
         transition="right 0.3s ease-in-out"
       >
         <Box flex="1" overflowY="scroll">
           <FormProvider {...formMethods}>
             <BoxFields control={control} itemBoxPresets={currentItemBoxPresets} />
           </FormProvider>
         </Box>
       </Flex>
       
       {/* 右侧展开/收缩按钮 */}
        <Button
          position="fixed"
          top="50%"
          right={rightSidebarVisible ? "320px" : "0px"}
          transform="translateY(-50%)"
          zIndex={10}
          size="sm"
          colorScheme="orange"
          variant="solid"
          borderRadius="md 0 0 md"
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          transition="right 0.3s ease-in-out"
          px="2"
          py="4"
          bg="orange.500"
          _hover={{ bg: "orange.600" }}
          color="white"
          boxShadow="lg"
        >
          {rightSidebarVisible ? "▶" : "◀"}
        </Button>
      
      <Flex
        position="fixed"
        top="2"
        left="50%"
        transform="translateX(-50%)"
        gap={2}
        zIndex={10}
      >
        <Button
          size="xs"
          colorScheme="blue"
          onClick={exportToExcel}
        >
          导出Excel
        </Button>
        <Button
          size="xs"
          colorScheme="green"
          onClick={onPresetEditorOpen}
        >
          箱子规格管理
        </Button>
        <Button
          size="xs"
          colorScheme="purple"
          onClick={onItemBoxPresetEditorOpen}
        >
          盒子规格管理
        </Button>
      </Flex>
      
      {/* 中间3D画布 */}
        <Box 
          w="100%" 
          h="100%" 
          ml={leftSidebarVisible ? "320px" : "0px"}
          mr={rightSidebarVisible ? "320px" : "0px"}
          transition="margin 0.3s ease-in-out"
        >
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

      {/* 箱子规格编辑弹窗 */}
      <BoxPresetEditor
        isOpen={isPresetEditorOpen}
        onClose={onPresetEditorClose}
        boxPresets={currentBoxPresets}
        onSave={handlePresetsChange}
      />

      {/* 盒子规格编辑弹窗 */}
      <ItemBoxPresetEditor
        isOpen={isItemBoxPresetEditorOpen}
        onClose={onItemBoxPresetEditorClose}
        itemBoxPresets={currentItemBoxPresets}
        onSave={handleItemBoxPresetsChange}
      />
    </Flex>
  );
}

function Container(props: { data: AlgoContainer }) {
  const { data } = props;

  return (
    <>
      <mesh
        castShadow
        position={[
          data.dim.length / 2,
          data.dim.height / 2,
          data.dim.width / 2,
        ]}
      >
        <boxGeometry
          args={[
            data.dim.length + 0.2,
            data.dim.height + 0.2,
            data.dim.width + 0.2,
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
      {data.items.map((item: AlgoItem, idx: number) => (
        <BoxItem key={idx} data={item} />
      ))}
    </>
  );
}

function BoxItem(props: { data: AlgoItem }) {
  const { data } = props;
  const { colorMap } = useContext(AppContext);
  
  // 调试日志：打印颜色映射信息
  const itemColor = colorMap.get(data.id) || "#3182ce";
  console.log(`BoxItem渲染 - ID: ${data.id}, 颜色: ${itemColor}`);
  
  const dim = useMemo(() => {
    // 根据旋转计算实际尺寸
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
      case "HWL":
        result = [data.dim.height, data.dim.width, data.dim.length];
        break;
      default:
    }
    return result;
  }, [data]);
  return (
    <mesh
      position={[
        data.pos.length + dim[0] / 2,
        data.pos.height + dim[2] / 2,
        data.pos.width + dim[1] / 2,
      ]}
      castShadow
    >
      <boxGeometry args={[dim[0], dim[2], dim[1]]} />
      <meshStandardMaterial
        metalness={1}
        roughness={1}
        color={itemColor}
      />
      <Edges castShadow />
    </mesh>
  );
}

function Env() {
  return (
    <Environment preset="warehouse" background blur={0.65} />
  );
}
