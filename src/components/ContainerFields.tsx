/* eslint-disable @typescript-eslint/no-explicit-any */
// 容器字段组件
import { AddIcon } from "@chakra-ui/icons";
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
import { useEffect } from "react";

type Props = {
  control: Control<ExtendedAlgoInput, any, ExtendedAlgoInput>;
};

// 容器字段监听组件，用于处理装箱方式变化时的字段清理
function ContainerFieldWatcher({ index }: { index: number }) {
  const { setValue } = useFormContext<ExtendedAlgoInput>();
  const packingMethod = useWatch({ name: `containers.${index}.packingMethod` });
  
  useEffect(() => {
    // 当装箱方式不是'weight'时，清除最大重量值
    if (packingMethod !== 'weight') {
      setValue(`containers.${index}.maxWeight`, 0);
    }
  }, [packingMethod, index, setValue]);
  
  return null;
}

function ContainerFields(props: Props) {
  const { control } = props;
  const containerFields = useFieldArray({ control, name: "containers" });
  const add = () => {
    containerFields.append({
      id: `容器 ${containerFields.fields.length + 1}`,
      dim: [0, 0, 0],
      qty: 1,
      thickness: 0,
      orderBoxNumber: "",
      containerNetWeight: 0,
      containerGrossWeight: 0,
      labelOrientation: "auto",
      packingMethod: "space",
      maxWeight: 100,
    });
  };
  const remove = (idx: number) => {
    containerFields.remove(idx);
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
          容器
        </Heading>
        <IconButton
          onClick={add}
          size="xs"
          aria-label="add"
          icon={<AddIcon />}
        />
      </Flex>
      <Stack px="3" divider={<Divider />} spacing="4">
        {containerFields.fields.map((field, idx) => (
          <Box key={field.id} borderRadius="md" p="1">
            <ContainerFieldWatcher index={idx} />
            <HStack>
              <Field
                label="标签"
                name={`containers.${idx}.id`}
                control={control}
              />
              <Field
                flex="1"
                label="数量"
                name={`containers.${idx}.qty`}
                control={control}
                options={{ valueAsNumber: true, min: 1, required: true }}
              />
            </HStack>
            <HStack mt="1">
              <Field
                flex="1"
                label="单号箱号"
                name={`containers.${idx}.orderBoxNumber`}
                control={control}
                placeholder="请输入单号箱号"
              />
            </HStack>
            <HStack mt="1">
              <SelectField
                flex="1"
                label="装箱方式"
                name={`containers.${idx}.packingMethod`}
                control={control}
                selectOptions={[
                  { value: "space", label: "按照空间装箱" },
                  { value: "weight", label: "按照重量装箱" },
                  { value: "quantity", label: "按照数量装箱" },
                ]}
              />
            </HStack>
            {/* 最大重量字段 - 仅在按重量装箱时显示 */}
            {useWatch({ control, name: `containers.${idx}.packingMethod` }) === "weight" && (
              <HStack mt="1">
                <Field
                  flex="1"
                  label="最大重量 (kg)"
                  name={`containers.${idx}.maxWeight`}
                  control={control}
                  options={{ valueAsNumber: true, min: 0 }}
                  placeholder="请输入最大重量"
                />
              </HStack>
            )}
            <HStack mt="1">
              <Field
                flex="1"
                label="外箱净重 (kg)"
                name={`containers.${idx}.containerNetWeight`}
                control={control}
                options={{ valueAsNumber: true, min: 0 }}
              />
              <Field
                flex="1"
                label="外箱毛重 (kg)"
                name={`containers.${idx}.containerGrossWeight`}
                control={control}
                options={{ valueAsNumber: true, min: 0 }}
              />
            </HStack>
            <Box mt="1">
              <HStack>
                <Field
                  flex="1"
                  label="长度"
                  name={`containers.${idx}.dim.0`}
                  control={control}
                  options={{ valueAsNumber: true, min: 1, required: true }}
                />
                <Field
                  flex="1"
                  label="宽度"
                  name={`containers.${idx}.dim.1`}
                  control={control}
                  options={{ valueAsNumber: true, min: 1, required: true }}
                />
                <Field
                  flex="1"
                  label="高度"
                  name={`containers.${idx}.dim.2`}
                  control={control}
                  options={{ valueAsNumber: true, min: 1, required: true }}
                />
              </HStack>
              <HStack mt="1">
                <Field
                  flex="1"
                  label="厚度"
                  name={`containers.${idx}.thickness`}
                  control={control}
                  options={{ valueAsNumber: true, min: 0 }}
                  placeholder="默认为0"
                />
                <SelectField
                  flex="1"
                  label="标签面朝向"
                  name={`containers.${idx}.labelOrientation`}
                  control={control}
                  selectOptions={[
                    { value: "auto", label: "自动选择" },
                    { value: "length_width_up", label: "长×宽朝上" },
                    { value: "length_height_up", label: "长×高朝上" },
                    { value: "width_height_up", label: "宽×高朝上" },
                  ]}
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
    </>
  );
}

export default ContainerFields;
