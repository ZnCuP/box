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
import { BoxPreset } from '../constant/containerPresets';
import { saveBoxPresetsToDB } from '../utils/fileUtils';

interface BoxPresetEditorProps {
  isOpen: boolean;
  onClose: () => void;
  boxPresets: BoxPreset[];
  onSave: (presets: BoxPreset[]) => void;
}

interface EditingPreset extends Omit<BoxPreset, 'dimensions'> {
  length: number;
  width: number;
  height: number;
  isNew?: boolean;
}

const BoxPresetEditor: React.FC<BoxPresetEditorProps> = ({
  isOpen,
  onClose,
  boxPresets,
  onSave,
}) => {
  // 转换BoxPreset到EditingPreset格式
  const convertToEditingPresets = (presets: BoxPreset[]): EditingPreset[] => {
    return presets.map(preset => ({
      ...preset,
      length: preset.dimensions[0],
      width: preset.dimensions[1],
      height: preset.dimensions[2],
    }));
  };

  // 转换EditingPreset到BoxPreset格式
  const convertToBoxPresets = (editingPresets: EditingPreset[]): BoxPreset[] => {
    return editingPresets.map(preset => ({
      id: preset.id,
      name: preset.name,
      dimensions: [preset.length, preset.width, preset.height] as [number, number, number],
      thickness: preset.thickness,
      netWeight: preset.netWeight,
      grossWeight: 0, // 删除毛重编辑，设为默认值
      description: preset.description,
    }));
  };

  const [presets, setPresets] = useState<EditingPreset[]>(convertToEditingPresets(boxPresets));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<EditingPreset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // 当boxPresets prop更新时，同步更新内部状态
  useEffect(() => {
    setPresets(convertToEditingPresets(boxPresets));
  }, [boxPresets]);

  // 自动保存到API
   const autoSave = async (newPresets: BoxPreset[]) => {
     try {
       await saveBoxPresetsToDB(newPresets);
     } catch (error) {
       console.error('❌ 自动保存失败:', error);
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
    const newPreset: EditingPreset = {
      id: `custom-${Date.now()}`,
      name: '',
      length: 0,
      width: 0,
      height: 0,
      thickness: 0,
      netWeight: 0,
      grossWeight: 0,
      description: '',
      isNew: true,
    };
    setPresets([...presets, newPreset]);
    setEditingId(newPreset.id);
    setEditingPreset({ ...newPreset });
  };

  const handleEdit = (preset: EditingPreset) => {
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

    const updatedPresets = presets.map(p => 
      p.id === editingPreset.id 
        ? { ...editingPreset, isNew: undefined }
        : p
    );

    setPresets(updatedPresets);
    
    // 更新父组件状态
    const boxPresets = convertToBoxPresets(updatedPresets);
    onSave(boxPresets);
    
    // 自动保存
    await autoSave(boxPresets);
    
    setEditingId(null);
    setEditingPreset(null);

    toast({
      title: '成功',
      description: editingPreset.isNew ? '新规格已添加并自动保存' : '规格已更新并自动保存',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCancel = () => {
    if (editingPreset?.isNew) {
      // 如果是新添加的行，直接删除
      setPresets(presets.filter(p => p.id !== editingId));
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
      const updatedPresets = presets.filter(p => p.id !== deleteId);
      setPresets(updatedPresets);
      
      // 更新父组件状态
      const boxPresets = convertToBoxPresets(updatedPresets);
      onSave(boxPresets);
      
      // 自动保存
      await autoSave(boxPresets);
      
      toast({
        title: '成功',
        description: '规格已删除并自动保存',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setDeleteId(null);
      onDeleteClose();
    }
  };



  // 处理中文句号转换和数字输入
  const handleNumberInputChange = (field: keyof EditingPreset, value: string) => {
    // 将中文句号转换为英文小数点
    const processedValue = value.replace(/。/g, '.');
    
    // 如果字符串以小数点结尾或者是有效的数字格式，保持原字符串
    // 只有在完全无效的情况下才转换为0
    let finalValue;
    if (processedValue === '' || processedValue === '.' || /^\d*\.?\d*$/.test(processedValue)) {
      finalValue = processedValue === '' ? 0 : processedValue;
    } else {
      const numValue = parseFloat(processedValue);
      finalValue = isNaN(numValue) ? 0 : numValue;
    }
    
    setEditingPreset(prev => prev ? { 
      ...prev, 
      [field]: finalValue 
    } : null);
  };

  const renderTableCell = (preset: EditingPreset, field: keyof EditingPreset, type: 'text' | 'number' | 'textarea' = 'text') => {
    const isEditing = editingId === preset.id;
    
    if (!isEditing) {
      return <Td py={1} height="36px" verticalAlign="middle">{preset[field]}</Td>;
    }

    if (type === 'textarea') {
      return (
        <Td py={1} height="36px" verticalAlign="middle">
          <Input
            value={editingPreset?.[field] as string || ''}
            onChange={(e) => setEditingPreset(prev => prev ? { ...prev, [field]: e.target.value } : null)}
            size="xs"
            height="28px"
            placeholder="描述信息"
          />
        </Td>
      );
    }

    if (type === 'number') {
      // 判断是否为重量字段（需要小数支持）
      const isWeightField = field === 'netWeight' || field === 'thickness';
      
      return (
        <Td py={1} height="36px" verticalAlign="middle">
          <NumberInput
            value={editingPreset?.[field] as number || 0}
            onChange={(valueString) => handleNumberInputChange(field, valueString)}
            size="xs"
            min={0}
            precision={isWeightField ? 2 : 0}
            step={isWeightField ? 0.01 : 1}
          >
            <NumberInputField 
              height="28px"
              onKeyDown={(e) => {
                // 允许中文句号输入
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
        </Td>
      );
    }

    return (
      <Td py={1} height="36px" verticalAlign="middle">
        <Input
          value={editingPreset?.[field] as string || ''}
          onChange={(e) => setEditingPreset(prev => prev ? { ...prev, [field]: e.target.value } : null)}
          size="xs"
          height="28px"
        />
      </Td>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="6xl">
          <ModalHeader>箱子规格管理</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                onClick={handleAddNew}
                alignSelf="flex-start"
                isDisabled={editingId !== null}
              >
                添加新规格
              </Button>

              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>规格名称</Th>
                    <Th>长度 (cm)</Th>
                    <Th>宽度 (cm)</Th>
                    <Th>高度 (cm)</Th>
                    <Th>厚度 (cm)</Th>
                    <Th>净重 (kg)</Th>
                    <Th>描述</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {presets.map((preset) => (
                    <Tr key={preset.id}>
                      {renderTableCell(preset, 'name', 'text')}
                      {renderTableCell(preset, 'length', 'number')}
                      {renderTableCell(preset, 'width', 'number')}
                      {renderTableCell(preset, 'height', 'number')}
                      {renderTableCell(preset, 'thickness', 'number')}
                      {renderTableCell(preset, 'netWeight', 'number')}
                      {renderTableCell(preset, 'description', 'textarea')}
                      <Td minW="120px" py={2} height="48px" verticalAlign="middle">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {editingId === preset.id ? (
                            <>
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
                                colorScheme="red"
                                onClick={handleCancel}
                              />
                            </>
                          ) : (
                            <>
                              <IconButton
                                aria-label="编辑"
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEdit(preset)}
                                isDisabled={editingId !== null}
                              />
                              <IconButton
                                aria-label="删除"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDelete(preset.id)}
                                isDisabled={editingId !== null}
                              />
                            </>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Box flex={1}>
              <Text fontSize="sm" color="gray.600">
                💡 提示：所有更改会自动保存到API，修改后会自动同步到服务器
              </Text>
            </Box>
            <Button variant="ghost" onClick={onClose}>
              关闭
            </Button>
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
              删除规格
            </AlertDialogHeader>

            <AlertDialogBody>
              确定要删除这个箱子规格吗？此操作无法撤销。
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

export default BoxPresetEditor;