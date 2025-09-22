import { BoxPreset } from '../constant/containerPresets';
import { ItemBoxPreset } from '../components/ItemBoxPresetEditor';

const API_BASE_URL = 'http://localhost:3001/api';

// API 响应类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 从后端API加载箱子规格
export async function loadBoxPresetsFromDB(): Promise<BoxPreset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/box-presets`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<BoxPreset[]> = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ 从后端API加载箱子规格成功:', result.data.length, '个');
      return result.data;
    } else {
      throw new Error(result.error || '加载失败');
    }
  } catch (error) {
    console.error('❌ 从后端API加载箱子规格失败:', error);
    
    // 如果后端不可用，返回默认数据
    return getDefaultPresets();
  }
}

// 保存箱子规格到后端API
export async function saveBoxPresetsToDB(presets: BoxPreset[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/box-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: presets }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse = await response.json();
    
    if (result.success) {
      console.log('✅ 保存箱子规格到后端API成功');
      return true;
    } else {
      throw new Error(result.error || '保存失败');
    }
  } catch (error) {
    console.error('❌ 保存箱子规格到后端API失败:', error);
    return false;
  }
}

// 添加单个箱子规格
export async function addBoxPreset(preset: BoxPreset): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/box-presets/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preset),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<BoxPreset> = await response.json();
    
    if (result.success) {
      console.log('✅ 添加箱子规格成功:', result.data?.name);
      return true;
    } else {
      throw new Error(result.error || '添加失败');
    }
  } catch (error) {
    console.error('❌ 添加箱子规格失败:', error);
    return false;
  }
}

// 更新单个箱子规格
export async function updateBoxPreset(id: string, preset: Partial<BoxPreset>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/box-presets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preset),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<BoxPreset> = await response.json();
    
    if (result.success) {
      console.log('✅ 更新箱子规格成功:', result.data?.name);
      return true;
    } else {
      throw new Error(result.error || '更新失败');
    }
  } catch (error) {
    console.error('❌ 更新箱子规格失败:', error);
    return false;
  }
}

// 删除单个箱子规格
export async function deleteBoxPreset(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/box-presets/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<BoxPreset> = await response.json();
    
    if (result.success) {
      console.log('✅ 删除箱子规格成功:', result.data?.name);
      return true;
    } else {
      throw new Error(result.error || '删除失败');
    }
  } catch (error) {
    console.error('❌ 删除箱子规格失败:', error);
    return false;
  }
}

// 检查后端API健康状态
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      return false;
    }
    
    const result: ApiResponse = await response.json();
    return result.success;
  } catch (error) {
    console.error('❌ 后端API不可用:', error);
    return false;
  }
}

// 获取默认箱子规格（后端不可用时的备用数据）
function getDefaultPresets(): BoxPreset[] {
  return [
    {
      id: 'small',
      name: '小箱',
      dimensions: [30, 20, 15],
      thickness: 0.5,
      netWeight: 0.2,
      grossWeight: 0.3,
      description: '适合小件物品'
    },
    {
      id: 'medium',
      name: '中箱',
      dimensions: [40, 30, 25],
      thickness: 0.5,
      netWeight: 0.4,
      grossWeight: 0.6,
      description: '适合中等大小物品'
    },
    {
      id: 'large',
      name: '大箱',
      dimensions: [60, 40, 35],
      thickness: 0.5,
      netWeight: 0.8,
      grossWeight: 1.2,
      description: '适合大件物品'
    },
    {
      id: 'extra-large',
      name: '特大箱',
      dimensions: [80, 60, 50],
      thickness: 0.5,
      netWeight: 1.5,
      grossWeight: 2.0,
      description: '适合超大件物品'
    }
  ];
}

// 导出JSON文件（用于备份）
export function downloadJSONFile(data: BoxPreset[], filename: string = 'boxPresets.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  console.log('✅ JSON文件下载成功:', filename);
}

// ==================== 盒子规格相关API ====================

// 从后端API加载盒子规格
export async function loadItemBoxPresetsFromDB(): Promise<ItemBoxPreset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/item-box-presets`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<ItemBoxPreset[]> = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ 从后端API加载盒子规格成功:', result.data.length, '个');
      return result.data;
    } else {
      throw new Error(result.error || '加载失败');
    }
  } catch (error) {
    console.error('❌ 从后端API加载盒子规格失败:', error);
    
    // 如果后端不可用，返回默认数据
    return getDefaultItemBoxPresets();
  }
}

// 保存盒子规格到后端API
export async function saveItemBoxPresetsToDB(presets: ItemBoxPreset[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/item-box-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: presets }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse = await response.json();
    
    if (result.success) {
      console.log('✅ 保存盒子规格到后端API成功');
      return true;
    } else {
      throw new Error(result.error || '保存失败');
    }
  } catch (error) {
    console.error('❌ 保存盒子规格到后端API失败:', error);
    return false;
  }
}

// 获取默认盒子规格数据
function getDefaultItemBoxPresets(): ItemBoxPreset[] {
  return [
    {
      id: 'small-box',
      name: '小盒',
      dimensions: [10, 8, 6],
      netWeight: 0.05,
      description: '适合小件物品'
    },
    {
      id: 'medium-box',
      name: '中盒',
      dimensions: [15, 12, 10],
      netWeight: 0.08,
      description: '适合中等物品'
    },
    {
      id: 'large-box',
      name: '大盒',
      dimensions: [20, 16, 12],
      netWeight: 0.12,
      description: '适合大件物品'
    }
  ];
}