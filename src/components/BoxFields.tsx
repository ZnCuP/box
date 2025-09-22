/* eslint-disable @typescript-eslint/no-explicit-any */
// 物品字段组件
import { AddIcon, DownloadIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Stack,
  Divider,
  Button,
} from "@chakra-ui/react";
import { Control, useFieldArray, useWatch, useFormContext } from "react-hook-form";
import { ExtendedAlgoInput } from "../types/extended";
import Field from "./Field";
import SelectField from "./SelectField";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppProvider";
import uniqolor from "uniqolor";
import { ItemBoxPreset } from "./ItemBoxPresetEditor";
import { readProductDataFromExcel, ProductData } from "../utils/excelUtils";
import ProductImportModal from "./ProductImportModal";
import { useToast } from "@chakra-ui/react";

type Props = {
  control: Control<ExtendedAlgoInput, any, ExtendedAlgoInput>;
  itemBoxPresets?: ItemBoxPreset[];
};

function BoxFields(props: Props) {
  const { setColorMap } = useContext(AppContext);
  const { control, itemBoxPresets = [] } = props;
  const { setValue } = useFormContext<ExtendedAlgoInput>();
  const boxFields = useFieldArray({ control, name: "items" });
  const toast = useToast();
  
  // 导入相关状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importProducts, setImportProducts] = useState<ProductData[]>([]);
  
  // 监听所有物品的净重和盒子净重变化
  const watchedItems = useWatch({ control, name: "items" });
  
  // 自动计算产品毛重
  useEffect(() => {
    if (watchedItems) {
      watchedItems.forEach((item, idx) => {
        if (item && typeof item.productNetWeight === 'number' && typeof item.boxNetWeight === 'number') {
          const grossWeight = item.productNetWeight + item.boxNetWeight;
          const currentGrossWeight = item.productGrossWeight;
          // 只有当计算出的毛重与当前值不同时才更新
          if (grossWeight !== currentGrossWeight) {
            setValue(`items.${idx}.productGrossWeight`, grossWeight);
          }
        }
      });
    }
  }, [watchedItems, setValue]);

  // 监听盒子规格选择变化
  useEffect(() => {
    if (watchedItems) {
      watchedItems.forEach((item: any, idx) => {
        if (item && item.boxPreset) {
          const preset = itemBoxPresets.find(p => p.id === item.boxPreset);
          if (preset) {
            // 检查是否需要更新尺寸和净重
            const needsUpdate = 
              item.dim[0] !== preset.dimensions[0] ||
              item.dim[1] !== preset.dimensions[1] ||
              item.dim[2] !== preset.dimensions[2] ||
              item.boxNetWeight !== preset.netWeight;
            
            if (needsUpdate) {
              setValue(`items.${idx}.dim.0`, preset.dimensions[0]);
              setValue(`items.${idx}.dim.1`, preset.dimensions[1]);
              setValue(`items.${idx}.dim.2`, preset.dimensions[2]);
              setValue(`items.${idx}.boxNetWeight`, preset.netWeight);
            }
          }
        }
      });
    }
  }, [watchedItems, setValue, itemBoxPresets]);
  // 处理文件导入
  const handleFileImport = async (file: File) => {
    console.log('🚀 开始处理文件导入:', file.name, file.size, 'bytes');
    
    try {
      const products = await readProductDataFromExcel(file);
      console.log('📦 读取到的产品数据:', products);
      
      if (products.length === 0) {
        console.log('⚠️ 未找到产品数据');
        toast({
          title: '未找到产品数据',
          description: '请检查Excel文件格式是否正确',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      console.log('✅ 设置导入产品数据并打开弹窗');
      setImportProducts(products);
      setIsImportModalOpen(true);
    } catch (error) {
      console.error('❌ 文件导入失败:', error);
      toast({
        title: '文件读取失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 处理导入确认
  const handleImport = (selectedProducts: any[]) => {
    console.log('导入的产品:', selectedProducts);
    
    selectedProducts.forEach((product, index) => {
      const selectedPreset = itemBoxPresets.find(preset => preset.id === product.selectedBoxPreset);
      
      // 生成唯一的产品ID，确保每个产品都有不同的颜色
      const uniqueId = product.customerNumber || `${product.oeNumber}_${Date.now()}_${index}`;
      
      // 调试日志：打印产品信息和生成的ID
      console.log(`产品 ${index + 1}:`, {
        customerNumber: product.customerNumber,
        oeNumber: product.oeNumber,
        uniqueId: uniqueId,
        timestamp: Date.now(),
        index: index
      });
      
      boxFields.append({
        id: uniqueId,
        dim: selectedPreset ? selectedPreset.dimensions : [0, 0, 0],
        qty: product.editableQuantity,
        oeNumber: product.oeNumber,
        productNetWeight: 0,
        productGrossWeight: selectedPreset ? selectedPreset.netWeight : 0,
        boxNetWeight: selectedPreset ? selectedPreset.netWeight : 0,
      });
      
      // 使用预定义的高对比度颜色数组，确保每个产品都有明显不同的颜色
      const highContrastColors = [
        '#FF6B6B', // 红色
        '#4ECDC4', // 青色
        '#45B7D1', // 蓝色
        '#96CEB4', // 绿色
        '#FFEAA7', // 黄色
        '#DDA0DD', // 紫色
        '#98D8C8', // 薄荷绿
        '#F7DC6F', // 金黄色
        '#BB8FCE', // 淡紫色
        '#85C1E9', // 天蓝色
        '#F8C471', // 橙色
        '#82E0AA', // 浅绿色
        '#F1948A', // 粉红色
        '#85C1E9', // 浅蓝色
        '#D7BDE2'  // 淡紫色
      ];
      
      // 使用产品索引来选择颜色，确保不同产品有不同颜色
      const colorIndex = index % highContrastColors.length;
      const generatedColor = highContrastColors[colorIndex];
      console.log(`🎨 为产品 ${uniqueId} (索引${index}) 分配颜色: ${generatedColor}`);
      
      setColorMap(uniqueId, generatedColor);
      console.log(`✅ 颜色映射已设置: ${uniqueId} -> ${generatedColor}`);
    });
  };

  const add = () => {
    const id = `产品 ${boxFields.fields.length + 1}`;
    boxFields.append({
      id,
      dim: [0, 0, 0],
      qty: 1,
      oeNumber: "",
        productNetWeight: 0,
      productGrossWeight: 0,
      boxNetWeight: 0,
    });
    setColorMap(id, uniqolor(id).color);
  };
  const remove = (idx: number) => {
    boxFields.remove(idx);
  };
  return (
    <>
      <Flex
        zIndex={99}
        px="3"
        py="2"
        bg="rgb(42 45 56 / 100%)"
        position="sticky"
        top="0"
        align="start"
        justify="space-between"
      >
        <Heading size="sm" color="white">
          产品
        </Heading>
        <HStack spacing={1}>
          <IconButton
            onClick={() => {
              // 创建文件输入元素
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xls,.xlsx';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleFileImport(file);
                }
              };
              input.click();
            }}
            size="xs"
            aria-label="import"
            icon={<DownloadIcon />}
            title="导入产品数据"
          />
          <IconButton
            onClick={add}
            size="xs"
            aria-label="add"
            icon={<AddIcon />}
          />
        </HStack>
      </Flex>
      <Stack px="3" divider={<Divider />} spacing="4">
        {boxFields.fields.map((field, idx) => (
          <Box key={field.id} borderRadius="md" p="1">
            <HStack>
              <Field label="标签" name={`items.${idx}.id`} control={control} />
              <Field
                flex="1"
                label="数量"
                name={`items.${idx}.qty`}
                control={control}
                type="number"
                options={{ min: 1, required: true }}
              />
            </HStack>
            <HStack mt="1">
              <Field
                flex="1"
                label="OE号"
                name={`items.${idx}.oeNumber`}
                control={control}
                placeholder="请输入OE号"
              />
            </HStack>
            <HStack mt="1">
              <Field
                flex="1"
                label="产品净重 (g)"
                name={`items.${idx}.productNetWeight`}
                control={control}
                type="number"
                step="0.01"
                options={{ min: 0 }}
              />
              <Field
                flex="1"
                label="产品毛重 (g)"
                name={`items.${idx}.productGrossWeight`}
                control={control}
                type="number"
                step="0.01"
                options={{ 
                  min: 0,
                  disabled: true // 不允许手动编辑
                }}
                placeholder="自动计算：产品净重 + 盒子净重"
              />
            </HStack>
            <HStack mt="1">
              <Box flex="2">
                <SelectField
                  label="盒子规格"
                  name={`items.${idx}.boxPreset` as any}
                  control={control as any}
                  placeholder="选择盒子规格"
                  selectOptions={itemBoxPresets.map(preset => ({
                    value: preset.id,
                    label: preset.name
                  }))}
                />
              </Box>
              <Field
                flex="1"
                label="盒子净重 (g)"
                name={`items.${idx}.boxNetWeight`}
                control={control}
                type="number"
                step="0.01"
                options={{ min: 0 }}
              />
            </HStack>
            <Box mt="1">
              <HStack>
                <Field
                  flex="1"
                  label="长度"
                  name={`items.${idx}.dim.0`}
                  control={control}
                  type="number"
                  step="0.01"
                  options={{ min: 1, required: true }}
                />
                <Field
                  flex="1"
                  label="宽度"
                  name={`items.${idx}.dim.1`}
                  control={control}
                  type="number"
                  step="0.01"
                  options={{ min: 1, required: true }}
                />
                <Field
                  flex="1"
                  label="高度"
                  name={`items.${idx}.dim.2`}
                  control={control}
                  type="number"
                  step="0.01"
                  options={{ min: 1, required: true }}
                />
              </HStack>

            </Box>
            <Button
              size="xs"
              w="full"
              colorScheme="red"
              variant="link"
              onClick={() => remove(idx)}
            >
              删除
            </Button>
          </Box>
        ))}
      </Stack>
      
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        products={importProducts}
        onImport={handleImport}
        itemBoxPresets={itemBoxPresets}
      />
    </>
  );
}

export default BoxFields;
