/* eslint-disable @typescript-eslint/no-explicit-any */
// 物品字段组件
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
import { ExtendedAlgoInput } from "../types/extended";
import Field from "./Field";
import { useContext } from "react";
import { AppContext } from "./AppProvider";
import uniqolor from "uniqolor";

type Props = {
  control: Control<ExtendedAlgoInput, any, ExtendedAlgoInput>;
};

function BoxFields(props: Props) {
  const { setColorMap } = useContext(AppContext);
  const { control } = props;
  const boxFields = useFieldArray({ control, name: "items" });
  const add = () => {
    const id = `物品 ${boxFields.fields.length + 1}`;
    boxFields.append({
      id,
      dim: [0, 0, 0],
      qty: 1,
      thickness: 0,
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
          物品
        </Heading>
        <IconButton
          onClick={add}
          size="xs"
          aria-label="add"
          icon={<AddIcon />}
        />
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
                options={{ valueAsNumber: true, min: 1, required: true }}
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
                options={{ valueAsNumber: true, min: 0 }}
              />
              <Field
                flex="1"
                label="产品毛重 (g)"
                name={`items.${idx}.productGrossWeight`}
                control={control}
                options={{ valueAsNumber: true, min: 0 }}
              />
            </HStack>
            <HStack mt="1">
              <Field
                flex="1"
                label="盒子净重 (g)"
                name={`items.${idx}.boxNetWeight`}
                control={control}
                options={{ valueAsNumber: true, min: 0 }}
              />
            </HStack>
            <Box mt="1">
              <HStack>
                <Field
                  flex="1"
                  label="长度"
                  name={`items.${idx}.dim.0`}
                  control={control}
                  options={{ valueAsNumber: true, min: 1, required: true }}
                />
                <Field
                  flex="1"
                  label="宽度"
                  name={`items.${idx}.dim.1`}
                  control={control}
                  options={{ valueAsNumber: true, min: 1, required: true }}
                />
                <Field
                  flex="1"
                  label="高度"
                  name={`items.${idx}.dim.2`}
                  control={control}
                  options={{ valueAsNumber: true, min: 1, required: true }}
                />
              </HStack>
              <HStack mt="1">
                <Field
                  flex="1"
                  label="厚度"
                  name={`items.${idx}.thickness`}
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

export default BoxFields;
