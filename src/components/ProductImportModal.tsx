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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { ProductData } from '../utils/excelUtils';
import { ItemBoxPreset } from './ItemBoxPresetEditor';

interface ProductImportItem extends ProductData {
  id: string;
  selected: boolean;
  editableQuantity: number;
  selectedBoxPreset?: string;
}

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductData[];
  itemBoxPresets: ItemBoxPreset[];
  onImport: (products: ProductImportItem[]) => void;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  products,
  itemBoxPresets,
  onImport,
}) => {
  const toast = useToast();
  
  console.log('🎭 ProductImportModal 渲染:', {
    isOpen,
    productsCount: products.length,
    products,
    itemBoxPresetsCount: itemBoxPresets.length
  });
  
  const [importItems, setImportItems] = useState<ProductImportItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 当products或itemBoxPresets变化时更新importItems
  useEffect(() => {
    console.log('🔄 更新importItems:', products.length, '个产品');
    const newImportItems = products.map((product, index) => ({
      ...product,
      id: `导入产品 ${index + 1}`,
      selected: true,
      editableQuantity: product.quantity,
      selectedBoxPreset: itemBoxPresets[0]?.id || '',
    }));
    setImportItems(newImportItems);
    console.log('✅ importItems已更新:', newImportItems);
  }, [products, itemBoxPresets]);

  const handleSelectAll = (checked: boolean) => {
    setImportItems(items =>
      items.map(item => ({ ...item, selected: checked }))
    );
  };

  const handleItemSelect = (index: number, checked: boolean) => {
    setImportItems(items =>
      items.map((item, i) => (i === index ? { ...item, selected: checked } : item))
    );
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setImportItems(items =>
      items.map((item, i) => (i === index ? { ...item, editableQuantity: quantity } : item))
    );
  };

  const handleBoxPresetChange = (index: number, presetId: string) => {
    setImportItems(items =>
      items.map((item, i) => (i === index ? { ...item, selectedBoxPreset: presetId } : item))
    );
  };

  // 搜索过滤逻辑
  const filteredItems = importItems.filter(item => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const customerNumberMatch = item.customerNumber?.toLowerCase().includes(searchLower);
    const oeNumberMatch = item.oeNumber?.toLowerCase().includes(searchLower);
    
    return customerNumberMatch || oeNumberMatch;
  });

  // 分页逻辑 - 基于过滤后的数据
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // 重置到第一页
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 搜索时重置到第一页
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 修改处理函数，需要找到过滤后项目在原始数组中的实际索引
  const handleItemSelectPaginated = (pageIndex: number, checked: boolean) => {
    const filteredItem = currentItems[pageIndex];
    const actualIndex = importItems.findIndex(item => item.id === filteredItem.id);
    handleItemSelect(actualIndex, checked);
  };

  // 修改handleQuantityChange函数，需要找到过滤后项目在原始数组中的实际索引
  const handleQuantityChangePaginated = (pageIndex: number, quantity: number) => {
    const filteredItem = currentItems[pageIndex];
    const actualIndex = importItems.findIndex(item => item.id === filteredItem.id);
    handleQuantityChange(actualIndex, quantity);
  };

  // 修改handleBoxPresetChange函数，需要找到过滤后项目在原始数组中的实际索引
  const handleBoxPresetChangePaginated = (pageIndex: number, presetId: string) => {
    const filteredItem = currentItems[pageIndex];
    const actualIndex = importItems.findIndex(item => item.id === filteredItem.id);
    handleBoxPresetChange(actualIndex, presetId);
  };

  const handleImport = () => {
    const selectedItems = importItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: '请选择要导入的产品',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    onImport(selectedItems);
    onClose();
    
    toast({
      title: '导入成功',
      description: `已导入 ${selectedItems.length} 个产品`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const selectedCount = importItems.filter(item => item.selected).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>产品导入预览</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 搜索框 */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="搜索产品标签或OE号..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                size="md"
              />
            </InputGroup>

            <HStack justify="space-between" align="center">
              <Text>
                {searchTerm ? (
                  <>
                    搜索到 {filteredItems.length} 个产品（共 {products.length} 个），已选择 {selectedCount} 个
                  </>
                ) : (
                  <>
                    共找到 {products.length} 个产品，已选择 {selectedCount} 个
                  </>
                )}
              </Text>
              <HStack spacing={2}>
                <Text fontSize="sm">每页显示：</Text>
                <Select
                  value={itemsPerPage}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  size="sm"
                  width="80px"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </Select>
                <Text fontSize="sm">条</Text>
              </HStack>
            </HStack>
            
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="60px">序号</Th>
                  <Th>
                    <Checkbox
                      isChecked={selectedCount === importItems.length && importItems.length > 0}
                      isIndeterminate={selectedCount > 0 && selectedCount < importItems.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    >
                      全选
                    </Checkbox>
                  </Th>
                  <Th>标签</Th>
                  <Th>OE号</Th>
                  <Th>数量</Th>
                  <Th>盒子规格</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentItems.map((item, pageIndex) => {
                  // 在原始数组中找到该项目的索引，用于显示正确的序号
                  const originalIndex = importItems.findIndex(originalItem => originalItem.id === item.id);
                  return (
                  <Tr key={originalIndex}>
                    <Td>{originalIndex + 1}</Td>
                    <Td>
                      <Checkbox
                        isChecked={item.selected}
                        onChange={(e) => handleItemSelectPaginated(pageIndex, e.target.checked)}
                      />
                    </Td>
                    <Td>{item.customerNumber}</Td>
                    <Td>{item.oeNumber}</Td>
                    <Td>
                      <NumberInput
                        value={item.editableQuantity}
                        onChange={(_, valueNumber) => handleQuantityChangePaginated(pageIndex, valueNumber || 0)}
                        size="sm"
                        min={0}
                        width="80px"
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td>
                      <Select
                        value={item.selectedBoxPreset}
                        onChange={(e) => handleBoxPresetChangePaginated(pageIndex, e.target.value)}
                        size="sm"
                        width="200px"
                      >
                        {itemBoxPresets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name} ({preset.dimensions.join('×')}mm)
                          </option>
                        ))}
                      </Select>
                    </Td>
                  </Tr>
                  );
                })}
              </Tbody>
            </Table>
            
            {/* 分页导航 */}
            {totalPages > 1 && (
              <HStack justify="center" spacing={2}>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  上一页
                </Button>
                
                {/* 页码按钮 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "solid" : "outline"}
                    colorScheme={page === currentPage ? "blue" : "gray"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                >
                  下一页
                </Button>
                
                <Text fontSize="sm" color="gray.600">
                  第 {currentPage} 页，共 {totalPages} 页
                </Text>
              </HStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button colorScheme="blue" onClick={handleImport}>
            导入选中的产品 ({selectedCount})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductImportModal;