import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Box,
  Text,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { saveItemBoxPresetsToDB } from '../utils/fileUtils';

export interface ItemBoxPreset {
  id: string;
  name: string;
  dimensions: [number, number, number];
  netWeight: number;
  description: string;
}

interface ItemBoxPresetEditorProps {
  isOpen: boolean;
  onClose: () => void;
  itemBoxPresets: ItemBoxPreset[];
  onSave: (presets: ItemBoxPreset[]) => void;
}

interface EditingItemBoxPreset extends Omit<ItemBoxPreset, 'dimensions'> {
  length: number;
  width: number;
  height: number;
  isNew?: boolean;
}

const ItemBoxPresetEditor: React.FC<ItemBoxPresetEditorProps> = ({
  isOpen,
  onClose,
  itemBoxPresets,
  onSave,
}) => {
  // 转换ItemBoxPreset到EditingItemBoxPreset格式
  const convertToEditingPresets = (presets: ItemBoxPreset[]): EditingItemBoxPreset[] => {
    return presets.map(preset => ({
      ...preset,
      length: preset.dimensions[0],
      width: preset.dimensions[1],
      height: preset.dimensions[2],
    }));
  };

  // 转换EditingItemBoxPreset到ItemBoxPreset格式
  const convertToItemBoxPresets = (editingPresets: EditingItemBoxPreset[]): ItemBoxPreset[] => {
    return editingPresets.map(preset => ({
      id: preset.id,
      name: preset.name,
      dimensions: [preset.length, preset.width, preset.height] as [number, number, number],
      netWeight: preset.netWeight,
      description: preset.description,
    }));
  };

  const [presets, setPresets] = useState<EditingItemBoxPreset[]>(convertToEditingPresets(itemBoxPresets));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<EditingItemBoxPreset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // 监听itemBoxPresets变化，同步更新内部状态
  useEffect(() => {
    console.log('🔄 ItemBoxPresetEditor: 检测到itemBoxPresets变化，更新内部状态');
    setPresets(convertToEditingPresets(itemBoxPresets));
    // 如果正在编辑，取消编辑状态
    setEditingId(null);
    setEditingPreset(null);
  }, [itemBoxPresets]);

  // 自动保存到API
  const autoSave = async (newPresets: ItemBoxPreset[]) => {
    try {
      await saveItemBoxPresetsToDB(newPresets);
    } catch (error) {
      console.error('❌ 盒子规格自动保存失败:', error);
      toast({
        title: '自动保存失败',
        description: '数据保存出现问题，请检查控制台',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleAddNew = () => {
    const newPreset: EditingItemBoxPreset = {
      id: `item-box-${Date.now()}`,
      name: '',
      length: 0,
      width: 0,
      height: 0,
      netWeight: 0,
      description: '',
      isNew: true,
    };
    setPresets([...presets, newPreset]);
    setEditingId(newPreset.id);
    setEditingPreset({ ...newPreset });
  };

  const handleEdit = (preset: EditingItemBoxPreset) => {
    setEditingId(preset.id);
    setEditingPreset({ ...preset });
  };

  const handleSave = async () => {
    if (!editingPreset) return;

    // 验证必填字段
    if (!editingPreset.name.trim()) {
      toast({
        title: '错误',
        description: '规格名称不能为空',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editingPreset.length <= 0 || editingPreset.width <= 0 || editingPreset.height <= 0) {
      toast({
        title: '错误',
        description: '尺寸必须大于0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedPresets = presets.map(preset =>
      preset.id === editingPreset.id ? { ...editingPreset, isNew: false } : preset
    );

    setPresets(updatedPresets);
    setEditingId(null);
    setEditingPreset(null);

    // 保存到父组件
    const finalPresets = convertToItemBoxPresets(updatedPresets);
    onSave(finalPresets);

    // 自动保存
    await autoSave(finalPresets);

    toast({
      title: '保存成功',
      description: editingPreset.isNew ? '新规格已添加并自动保存' : '规格已更新并自动保存',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCancel = () => {
    if (editingPreset?.isNew) {
      // 如果是新添加的项目，直接删除
      setPresets(presets.filter(preset => preset.id !== editingPreset.id));
    }
    setEditingId(null);
    setEditingPreset(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const updatedPresets = presets.filter(preset => preset.id !== deleteId);
      setPresets(updatedPresets);
      
      // 保存到父组件
      const finalPresets = convertToItemBoxPresets(updatedPresets);
      onSave(finalPresets);

      // 自动保存
      await autoSave(finalPresets);

      toast({
        title: '删除成功',
        description: '盒子规格已删除并自动保存',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    setDeleteId(null);
    onDeleteClose();
  };

  const handleInputChange = (field: keyof EditingItemBoxPreset, value: string | number) => {
    if (editingPreset) {
      // 对于数字字段，确保正确处理小数
      let processedValue = value;
      if (typeof value === 'string' && (field === 'length' || field === 'width' || field === 'height' || field === 'netWeight')) {
        // 将中文句号转换为英文小数点
        const stringValue = value.replace(/。/g, '.');
        
        // 如果字符串以小数点结尾或者是有效的数字格式，保持原字符串
        // 只有在完全无效的情况下才转换为0
        if (stringValue === '' || stringValue === '.' || /^\d*\.?\d*$/.test(stringValue)) {
          processedValue = stringValue === '' ? 0 : stringValue;
        } else {
          processedValue = parseFloat(stringValue) || 0;
        }
      }
      
      setEditingPreset({
        ...editingPreset,
        [field]: processedValue,
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>盒子规格管理</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="bold">
                  当前盒子规格 ({presets.length} 个)
                </Text>
                <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddNew}>
                  添加新规格
                </Button>
              </Box>

              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>规格名称</Th>
                    <Th>长度(cm)</Th>
                    <Th>宽度(cm)</Th>
                    <Th>高度(cm)</Th>
                    <Th>净重(g)</Th>
                    <Th>描述</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {presets.map((preset) => (
                    <Tr key={preset.id}>
                      <Td py={1}>
                        {editingId === preset.id ? (
                          <Input
                            value={editingPreset?.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            size="xs"
                            height="28px"
                          />
                        ) : (
                          preset.name
                        )}
                      </Td>
                      <Td py={1}>
                        {editingId === preset.id ? (
                          <NumberInput
                            value={editingPreset?.length || 0}
                            onChange={(valueString) => handleInputChange('length', valueString)}
                            size="xs"
                            min={0}
                            precision={2}
                            step={0.01}
                          >
                            <NumberInputField 
                              height="28px"
                              onKeyDown={(e) => {
                                // 只处理中文句号，让英文小数点正常通过
                                if (e.key === '。') {
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
                                  
                                  // 直接设置input的值并触发事件
                                  input.value = newValue;
                                  const newCursorPos = start + 1;
                                  input.setSelectionRange(newCursorPos, newCursorPos);
                                  
                                  // 触发input事件
                                  const inputEvent = new Event('input', { bubbles: true });
                                  input.dispatchEvent(inputEvent);
                                }
                                // 英文小数点不做任何处理，让NumberInput自己处理
                              }}
                            />
                          </NumberInput>
                        ) : (
                          preset.length
                        )}
                      </Td>
                      <Td py={1}>
                        {editingId === preset.id ? (
                          <NumberInput
                            value={editingPreset?.width || 0}
                            onChange={(valueString) => handleInputChange('width', valueString)}
                            size="xs"
                            min={0}
                            precision={2}
                            step={0.01}
                          >
                            <NumberInputField 
                              height="28px"
                              onKeyDown={(e) => {
                                if (e.key === '。') {
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
                                  
                                  // 直接设置input的值并触发事件
                                  input.value = newValue;
                                  const newCursorPos = start + 1;
                                  input.setSelectionRange(newCursorPos, newCursorPos);
                                  
                                  // 触发input事件
                                  const inputEvent = new Event('input', { bubbles: true });
                                  input.dispatchEvent(inputEvent);
                                }
                              }}
                            />
                          </NumberInput>
                        ) : (
                          preset.width
                        )}
                      </Td>
                      <Td py={1}>
                        {editingId === preset.id ? (
                          <NumberInput
                            value={editingPreset?.height || 0}
                            onChange={(valueString) => handleInputChange('height', valueString)}
                            size="xs"
                            min={0}
                            precision={2}
                            step={0.01}
                          >
                            <NumberInputField 
                              height="28px"
                              onKeyDown={(e) => {
                                if (e.key === '。') {
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
                                  
                                  // 直接设置input的值并触发事件
                                  input.value = newValue;
                                  const newCursorPos = start + 1;
                                  input.setSelectionRange(newCursorPos, newCursorPos);
                                  
                                  // 触发input事件
                                  const inputEvent = new Event('input', { bubbles: true });
                                  input.dispatchEvent(inputEvent);
                                }
                              }}
                            />
                          </NumberInput>
                        ) : (
                          preset.height
                        )}
                      </Td>
                      <Td py={1}>
                        {editingId === preset.id ? (
                          <NumberInput
                            value={editingPreset?.netWeight || 0}
                            onChange={(valueString) => handleInputChange('netWeight', valueString)}
                            size="xs"
                            min={0}
                            precision={2}
                            step={0.01}
                          >
                            <NumberInputField 
                              height="28px"
                              onKeyDown={(e) => {
                                // 只处理中文句号，让英文小数点正常通过
                                if (e.key === '。') {
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
                                  
                                  // 直接设置input的值并触发事件
                                  input.value = newValue;
                                  const newCursorPos = start + 1;
                                  input.setSelectionRange(newCursorPos, newCursorPos);
                                  
                                  // 触发input事件
                                  const inputEvent = new Event('input', { bubbles: true });
                                  input.dispatchEvent(inputEvent);
                                }
                                // 英文小数点不做任何处理，让NumberInput自己处理
                              }}
                            />
                          </NumberInput>
                        ) : (
                          preset.netWeight
                        )}
                      </Td>
                      <Td>
                        {editingId === preset.id ? (
                          <Textarea
                            value={editingPreset?.description || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                            size="xs"
                            height="28px"
                            resize="none"
                          />
                        ) : (
                          preset.description
                        )}
                      </Td>
                      <Td>
                        {editingId === preset.id ? (
                          <Box display="flex" gap={1}>
                            <IconButton
                              aria-label="保存"
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              onClick={handleSave}
                            />
                            <IconButton
                              aria-label="取消"
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="gray"
                              onClick={handleCancel}
                            />
                          </Box>
                        ) : (
                          <Box display="flex" gap={1}>
                            <IconButton
                              aria-label="编辑"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(preset)}
                            />
                            <IconButton
                              aria-label="删除"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(preset.id)}
                            />
                          </Box>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>关闭</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              删除盒子规格
            </AlertDialogHeader>
            <AlertDialogBody>
              确定要删除这个盒子规格吗？此操作无法撤销。
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                取消
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ItemBoxPresetEditor;