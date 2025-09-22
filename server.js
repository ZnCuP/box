import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'src/data/boxPresets.json');
const ITEM_BOX_DATA_FILE = path.join(__dirname, 'src/data/itemBoxPresets.json');

// 中间件
app.use(cors());
app.use(express.json());

// 确保数据文件存在
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // 如果文件不存在，创建默认数据
    const defaultData = [
      {
        "id": "small",
        "name": "小箱",
        "dimensions": [30, 20, 15],
        "thickness": 0.5,
        "netWeight": 0.2,
        "grossWeight": 0.3,
        "description": "适合小件物品"
      },
      {
        "id": "medium",
        "name": "中箱",
        "dimensions": [40, 30, 25],
        "thickness": 0.5,
        "netWeight": 0.4,
        "grossWeight": 0.6,
        "description": "适合中等大小物品"
      },
      {
        "id": "large",
        "name": "大箱",
        "dimensions": [60, 40, 35],
        "thickness": 0.5,
        "netWeight": 0.8,
        "grossWeight": 1.2,
        "description": "适合大件物品"
      },
      {
        "id": "extra-large",
        "name": "特大箱",
        "dimensions": [80, 60, 50],
        "thickness": 0.5,
        "netWeight": 1.5,
        "grossWeight": 2.0,
        "description": "适合超大件物品"
      }
    ];
    
    // 确保目录存在
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    console.log('✅ 创建默认数据文件:', DATA_FILE);
  }
}

// 读取数据
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 读取数据失败:', error);
    return [];
  }
}

// 写入数据
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ 数据已保存到:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('❌ 写入数据失败:', error);
    return false;
  }
}

// 读取盒子规格数据
async function readItemBoxData() {
  try {
    const data = await fs.readFile(ITEM_BOX_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 读取盒子规格数据失败:', error);
    return [];
  }
}

// 写入盒子规格数据
async function writeItemBoxData(data) {
  try {
    await fs.writeFile(ITEM_BOX_DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ 盒子规格数据已保存到:', ITEM_BOX_DATA_FILE);
    return true;
  } catch (error) {
    console.error('❌ 写入盒子规格数据失败:', error);
    return false;
  }
}

// API 路由

// 获取所有箱子规格
app.get('/api/box-presets', async (req, res) => {
  try {
    const data = await readData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存所有箱子规格
app.post('/api/box-presets', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, error: '数据格式错误' });
    }
    
    const success = await writeData(data);
    
    if (success) {
      res.json({ success: true, message: '数据保存成功' });
    } else {
      res.status(500).json({ success: false, error: '数据保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加单个箱子规格
app.post('/api/box-presets/add', async (req, res) => {
  try {
    const newPreset = req.body;
    const data = await readData();
    
    // 检查ID是否已存在
    if (data.find(item => item.id === newPreset.id)) {
      return res.status(400).json({ success: false, error: 'ID已存在' });
    }
    
    data.push(newPreset);
    const success = await writeData(data);
    
    if (success) {
      res.json({ success: true, data: newPreset });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新单个箱子规格
app.put('/api/box-presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPreset = req.body;
    const data = await readData();
    
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: '规格不存在' });
    }
    
    data[index] = { ...data[index], ...updatedPreset, id };
    const success = await writeData(data);
    
    if (success) {
      res.json({ success: true, data: data[index] });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除单个箱子规格
app.delete('/api/box-presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: '规格不存在' });
    }
    
    const deletedPreset = data.splice(index, 1)[0];
    const success = await writeData(data);
    
    if (success) {
      res.json({ success: true, data: deletedPreset });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 盒子规格 API ====================

// 获取所有盒子规格
app.get('/api/item-box-presets', async (req, res) => {
  try {
    const data = await readItemBoxData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存所有盒子规格
app.post('/api/item-box-presets', async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, error: '数据格式错误' });
    }
    
    const success = await writeItemBoxData(data);
    if (success) {
      res.json({ success: true, message: '盒子规格保存成功' });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务器运行正常', timestamp: new Date().toISOString() });
});

// 启动服务器
async function startServer() {
  await ensureDataFile();
  
  app.listen(PORT, () => {
    console.log(`🚀 后端服务器启动成功!`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📊 API文档:`);
    console.log(`   GET    /api/box-presets         - 获取所有箱子规格`);
    console.log(`   POST   /api/box-presets         - 保存所有箱子规格`);
    console.log(`   POST   /api/box-presets/add     - 添加单个箱子规格`);
    console.log(`   PUT    /api/box-presets/:id     - 更新单个箱子规格`);
    console.log(`   DELETE /api/box-presets/:id     - 删除单个箱子规格`);
    console.log(`   GET    /api/item-box-presets    - 获取所有盒子规格`);
    console.log(`   POST   /api/item-box-presets    - 保存所有盒子规格`);
    console.log(`   GET    /api/health              - 健康检查`);
    console.log(`💾 数据文件: ${DATA_FILE}`);
    console.log(`💾 盒子规格数据文件: ${ITEM_BOX_DATA_FILE}`);
  });
}

startServer().catch(console.error);