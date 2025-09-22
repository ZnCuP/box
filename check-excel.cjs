const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('沃德生产单stark 159-36750-G-GW250391Z.xls');
  console.log('工作表名称:', workbook.SheetNames);
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  console.log('工作表范围:', worksheet['!ref']);
  
  // 检查第8行的内容 - 扩展到更多列
  console.log('\n第8行内容:');
  for (let col = 'A'.charCodeAt(0); col <= 'Z'.charCodeAt(0); col++) {
    const colLetter = String.fromCharCode(col);
    const cell = worksheet[colLetter + '8'];
    if (cell) {
      console.log(`${colLetter}8:`, cell.v);
    }
  }
  
  // 检查第9行的内容
  console.log('\n第9行内容:');
  for (let col = 'A'.charCodeAt(0); col <= 'Z'.charCodeAt(0); col++) {
    const colLetter = String.fromCharCode(col);
    const cell = worksheet[colLetter + '9'];
    if (cell) {
      console.log(`${colLetter}9:`, cell.v);
    }
  }
  
  // 检查第10行的内容
  console.log('\n第10行内容:');
  for (let col = 'A'.charCodeAt(0); col <= 'Z'.charCodeAt(0); col++) {
    const colLetter = String.fromCharCode(col);
    const cell = worksheet[colLetter + '10'];
    if (cell) {
      console.log(`${colLetter}10:`, cell.v);
    }
  }
  
  // 检查第11行的内容
  console.log('\n第11行内容:');
  for (let col = 'A'.charCodeAt(0); col <= 'Z'.charCodeAt(0); col++) {
    const colLetter = String.fromCharCode(col);
    const cell = worksheet[colLetter + '11'];
    if (cell) {
      console.log(`${colLetter}11:`, cell.v);
    }
  }
} catch (error) {
  console.error('错误:', error.message);
}