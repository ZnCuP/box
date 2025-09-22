// 下拉选择字段组件
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormState,
} from "react-hook-form";
import get from "lodash/get";
import { Box, BoxProps, Select, Text } from "@chakra-ui/react";

// 选项类型
type Option = {
  value: string;
  label: string;
};

// 字段组件属性类型
type Props<T extends FieldValues> = BoxProps & {
  control: Control<T, unknown, T>;
  name: Path<T>;
  label?: string;
  options?: RegisterOptions<T, Path<T>>;
  selectOptions: Option[];
  placeholder?: string;
};

function SelectField<T extends FieldValues>(props: Props<T>) {
  const { control, label, options, name, selectOptions, placeholder, ...rest } = props;
  
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
      <Controller
        control={control}
        name={name}
        rules={options}
        render={({ field }) => (
          <Select
            {...field}
            placeholder={placeholder}
            isInvalid={!!error}
            size="xs"
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      />
    </Box>
  );
}

export default SelectField;