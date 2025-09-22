import * as XLSX from 'xlsx';

export interface ProductData {
  oeNumber: string;
  quantity: number;
  customerNumber: string;
}

/**
 * 从Excel文件中读取产品数据
 * @param file Excel文件
 * @returns 产品数据数组
 */
export const readProductDataFromExcel = async (file: File): Promise<ProductData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        console.log('📊 Excel工作簿信息:', {
          sheetNames: workbook.SheetNames,
          totalSheets: workbook.SheetNames.length
        });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        console.log('📋 工作表范围:', worksheet['!ref']);
        
        // 读取第8行及以下的数据，8C列（OEM NO.）、8D列（数量）、8E列（客户号）
        const products: ProductData[] = [];
        let row = 8; // 从第8行开始读取数据
        
        // 先检查第8行的标题
        const headerOem = worksheet['C8'];
        const headerQty = worksheet['D8'];
        const headerCustomer = worksheet['E8'];
        
        console.log('📝 第8行标题检查:', {
          C8: headerOem?.v,
          D8: headerQty?.v,
          E8: headerCustomer?.v
        });
        
        // 从第9行开始读取实际数据
        row = 9;
        
        while (true) {
          // 读取C列（OEM NO.）、D列（数量）、E列（客户号）
          const oemCell = worksheet[`C${row}`];
          const qtyCell = worksheet[`D${row}`];
          const customerCell = worksheet[`E${row}`];
          
          console.log(`🔍 第${row}行数据:`, {
            C: oemCell?.v,
            D: qtyCell?.v,
            E: customerCell?.v
          });
          
          // 如果OEM NO.为空，说明数据读取完毕
          if (!oemCell || !oemCell.v) {
            console.log(`⏹️ 第${row}行OEM NO.为空，停止读取`);
            break;
          }
          
          const oeNumber = String(oemCell.v || '').trim();
          const quantity = Number(qtyCell?.v || 0);
          const customerNumber = String(customerCell?.v || '').trim();
          
          if (oeNumber) {
            const product = {
              oeNumber,
              quantity,
              customerNumber,
            };
            products.push(product);
            console.log(`✅ 添加产品:`, product);
          }
          
          row++;
          
          // 防止无限循环，最多读取1000行
          if (row > 1008) {
            console.log('⚠️ 达到最大行数限制，停止读取');
            break;
          }
        }
        
        console.log(`🎯 总共读取到 ${products.length} 个产品`);
        resolve(products);
      } catch (error) {
        console.error('❌ Excel读取错误:', error);
        reject(new Error(`读取Excel文件失败: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsBinaryString(file);
  });
};