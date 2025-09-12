// 侧边栏组件
import { Box, Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ExtendedAlgoInput } from "../types/extended";
import ContainerFields from "./ContainerFields";
import BoxFields from "./BoxFields";

type Props = {
  isPackingReady?: boolean;
  isLoading?: boolean;
  onPack: (input: ExtendedAlgoInput) => void;
};

function Sidebar(props: Props) {
  const { isPackingReady, isLoading } = props;
  const { control, handleSubmit } = useForm<ExtendedAlgoInput>({
    defaultValues: {
      containers: [
        {
          id: "容器 1",
          qty: 1,
          dim: [100, 100, 100],
          orderBoxNumber: "",
          containerNetWeight: 0,
          containerGrossWeight: 0,
        },
      ],
      items: [
        {
          id: "",
          qty: 5,
          dim: [10, 10, 30],
          thickness: 0,
          oeNumber: "",
          productNetWeight: 0,
          productGrossWeight: 0,
          boxNetWeight: 0,
        },
      ],
    },
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
          <ContainerFields control={control} />
          <Box w="full" h="1" bg="purple.200" my="4"></Box>
          <BoxFields control={control} />
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
