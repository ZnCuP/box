// 侧边栏组件
import { Box, Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ExtendedAlgoInput } from "../types/extended";
import ContainerFields from "./ContainerFields";
import BoxFields from "./BoxFields";
import { BoxPreset } from "../constant/containerPresets";
import { ItemBoxPreset } from "./ItemBoxPresetEditor";

type Props = {
  isPackingReady?: boolean;
  isLoading?: boolean;
  onPack: (input: ExtendedAlgoInput) => void;
  boxPresets?: BoxPreset[];
  itemBoxPresets?: ItemBoxPreset[];
};

function Sidebar(props: Props) {
  const { isPackingReady, isLoading, boxPresets, itemBoxPresets } = props;
  
  const defaultValues: ExtendedAlgoInput = {
    containers: [
      {
        id: "箱子 1",
        qty: 1,
        dim: [100, 100, 100] as [number, number, number],
        orderBoxNumber: "",
        containerNetWeight: 0,
        containerGrossWeight: 0,
        packingMethod: "space" as "space" | "quantity",
        maxWeight: 100,
        maxQuantity: 20,
      },
    ],
    items: [
      {
        id: "",
        qty: 5,
        dim: [10, 10, 30] as [number, number, number],
        oeNumber: "",
        productNetWeight: 0,
        productGrossWeight: 0,
        boxNetWeight: 0,
      },
    ],
  };
  

  
  const { control, handleSubmit } = useForm<ExtendedAlgoInput>({
    defaultValues,
  });

  const onSubmit = handleSubmit(props.onPack);

  return (
    <Flex
      flexDir="column"
      p="2"
      h="100svh"
      position="fixed"
      top="0"
      right="0"
      zIndex={9}
    >
      <Flex
        flexDir="column"
        flex="1"
        w="320px"
        h="100%"
        bg="rgb(42 45 56 / 100%)"
        overflow="hidden"
        borderRadius="lg"
      >
        <Box flex="1" overflowY="scroll">
          <ContainerFields control={control} boxPresets={boxPresets} />
          <Box w="full" h="1" bg="purple.200" my="4"></Box>
          <BoxFields control={control} itemBoxPresets={itemBoxPresets} />
        </Box>
        <Box w="full" p="2">
          <Button
            size="xs"
            w="full"
            colorScheme="purple"
            onClick={onSubmit}
            isLoading={isLoading}
            isDisabled={!isPackingReady}
          >
            开始装箱
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
