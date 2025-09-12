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
import { Control, useFieldArray } from "react-hook-form";
import { ExtendedAlgoInput, ExtendedContainerInput } from "../types/extended";
import Field from "./Field";

type Props = {
  control: Control<ExtendedAlgoInput, any, ExtendedAlgoInput>;
};

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
