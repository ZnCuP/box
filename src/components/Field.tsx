// 通用表单字段组件
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useFormState,
} from "react-hook-form";
import get from "lodash/get";
import { Box, BoxProps, Input, InputProps, Text } from "@chakra-ui/react";

// 字段组件属性类型
type Props<T extends FieldValues> = BoxProps &
  Pick<InputProps, "type" | "placeholder"> & {
    control: Control<T, unknown, T>;
    name: Path<T>;
    label?: string;
    options?: RegisterOptions<T, Path<T>>;
  };

function Field<T extends FieldValues>(props: Props<T>) {
  const { control, label, options, name, type, placeholder, ...rest } = props;
  // 获取表单错误状态
  const { errors } = useFormState({ control });
  const error = get(errors, name as string);
  return (
    <Box {...rest}>
      {label ? (
        <Text fontSize="xs" mb="1">
          {label}
        </Text>
      ) : null}
      <Input
        type={type}
        placeholder={placeholder}
        isInvalid={!!error}
        size="xs"
        {...control.register(name, options)}
      />
    </Box>
  );
}

export default Field;
