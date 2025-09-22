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
  Pick<InputProps, "type" | "placeholder" | "step"> & {
    control: Control<T, unknown, T>;
    name: Path<T>;
    label?: string;
    options?: RegisterOptions<T, Path<T>>;
  };

function Field<T extends FieldValues>(props: Props<T>) {
  const { control, label, options, name, type, placeholder, step, ...rest } = props;
  // 获取表单错误状态
  const { errors } = useFormState({ control });
  const error = get(errors, name as string);
  
  // 为数字类型的输入处理，移除valueAsNumber以避免小数点输入问题
  const registerOptions = options ? {
    ...options,
    // 移除valueAsNumber，让输入保持为字符串
    valueAsNumber: undefined
  } : undefined;
  
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
        step={step}
        isInvalid={!!error}
        size="xs"
        {...control.register(name, registerOptions)}
        onKeyDown={(e) => {
          // 为数字类型输入框添加中文句号转换功能
          if (type === 'number' && e.key === '。') {
            e.preventDefault();
            
            const input = e.target as HTMLInputElement;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const value = input.value;
            
            // 检查是否已经有小数点
            if (value.includes('.')) {
              return;
            }
            
            // 在光标位置插入小数点
            const newValue = value.slice(0, start) + '.' + value.slice(end);
            input.value = newValue;
            
            // 设置光标位置
            const newCursorPos = start + 1;
            input.setSelectionRange(newCursorPos, newCursorPos);
            
            // 触发input事件以更新React状态
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
          }
        }}
      />
    </Box>
  );
}

export default Field;
