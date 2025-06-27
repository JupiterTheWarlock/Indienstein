# Dashboard模块使用说明

## 📊 概述

Dashboard模块是Indienstein Web版的核心管理面板，提供项目概览、API供应商管理和信息空间统计等功能。

## 🎯 功能特性

### 1. 项目信息展示
- **项目基本信息**：显示项目名称、版本号、描述
- **使用统计**：历史生成次数、最近使用时间
- **偏好设置**：当前默认API供应商

### 2. API供应商管理
- **三大供应商支持**：
  - 硅基流动 (SiliconFlow)
  - 深度求索 (DeepSeek)
  - 智谱 (Zhipu)
- **API Key管理**：
  - 安全存储和加密显示
  - 一键保存和清除
  - 连接测试功能
- **状态监控**：实时显示配置状态

### 3. 信息空间总览
- **维度统计**：显示各维度的向量数量
- **数据可视化**：进度条图表展示维度分布
- **实时更新**：支持数据刷新

## 🚀 快速开始

### 基本使用

```html
<!-- 引入必要的依赖 -->
<script src="js/storageService.js"></script>
<script src="js/aiService.js"></script>
<script src="js/infoSpace.js"></script>
<script src="js/dashboard.js"></script>

<!-- HTML容器 -->
<div id="projectInfo"></div>
<div id="apiProviders"></div>
<div id="infoSpaceOverview"></div>
```

```javascript
// 初始化Dashboard
async function initDashboard() {
    // 确保InfoSpace已初始化
    InfoSpace.init();
    
    // 初始化Dashboard模块
    await dashboard.initialize();
}

// 调用初始化
initDashboard();
```

### API Key管理

```javascript
// 保存API Key
dashboard.saveApiKey('siliconflow', 'your-api-key-here');

// 测试连接
dashboard.testConnection('siliconflow');

// 清除API Key
dashboard.clearApiKey('siliconflow');
```

### 数据刷新

```javascript
// 刷新所有Dashboard数据
dashboard.refresh();
```

## 🛠️ 开发指南

### 模块结构

```
DashboardModule
├── constructor()          # 初始化依赖服务
├── initialize()           # 模块初始化
├── renderProjectInfo()    # 渲染项目信息
├── renderAPIProviders()   # 渲染API供应商
├── renderInfoSpaceOverview() # 渲染信息空间总览
├── saveApiKey()          # 保存API密钥
├── testConnection()      # 测试连接
└── refresh()             # 刷新数据
```

### 事件处理

Dashboard模块支持以下事件：

```javascript
// API Key输入框回车键保存
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        dashboard.saveApiKey(provider);
    }
});
```

### 自定义通知

```javascript
// 显示通知
dashboard.showNotification('操作成功', 'success');
dashboard.showNotification('警告信息', 'warning');
dashboard.showNotification('错误信息', 'error');
```

## 📝 配置选项

### API供应商配置

```javascript
const providers = [
    { 
        id: 'siliconflow', 
        name: '硅基流动',
        icon: 'bi-cpu',
        color: 'success',
        models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct']
    },
    // ... 其他供应商
];
```

### 默认模型映射

```javascript
const defaultModels = {
    'siliconflow': 'deepseek-ai/DeepSeek-V3',
    'deepseek': 'deepseek-chat',
    'zhipu': 'glm-4'
};
```

## 🧪 测试

### 使用测试页面

1. 打开 `dashboard_test.html`
2. 点击"初始化Dashboard"
3. 使用控制面板测试各项功能

### 手动测试步骤

1. **测试项目信息显示**
   - 检查版本号、统计数据显示
   - 验证最近使用时间格式

2. **测试API Key管理**
   - 输入测试API Key
   - 验证保存、显示、清除功能
   - 测试连接功能

3. **测试信息空间统计**
   - 检查维度数量统计
   - 验证进度条显示
   - 测试数据刷新

## 🔧 故障排除

### 常见问题

1. **Dashboard未初始化**
   ```javascript
   // 确保按顺序加载依赖
   if (typeof dashboard === 'undefined') {
       console.error('Dashboard模块未加载');
   }
   ```

2. **API Key保存失败**
   ```javascript
   // 检查StorageService是否可用
   if (typeof StorageService === 'undefined') {
       console.error('StorageService未加载');
   }
   ```

3. **信息空间数据为空**
   ```javascript
   // 确保InfoSpace已初始化
   InfoSpace.init();
   ```

### 调试模式

```javascript
// 启用详细日志
console.log('Dashboard初始化状态:', dashboard.isInitialized);
console.log('存储统计:', dashboard.storageService.getStorageStats());
```

## 📋 API参考

### 主要方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `initialize()` | - | `Promise<void>` | 初始化Dashboard模块 |
| `renderProjectInfo()` | - | `void` | 渲染项目信息区域 |
| `renderAPIProviders()` | - | `Promise<void>` | 渲染API供应商区域 |
| `renderInfoSpaceOverview()` | - | `Promise<void>` | 渲染信息空间总览 |
| `saveApiKey(provider, apiKey)` | `string, string` | `Promise<void>` | 保存API密钥 |
| `testConnection(provider)` | `string` | `Promise<void>` | 测试API连接 |
| `refresh()` | - | `Promise<void>` | 刷新所有数据 |

### 事件回调

```javascript
// 监听API Key保存事件
document.addEventListener('apiKeySaved', (event) => {
    console.log('API Key已保存:', event.detail.provider);
});
```

## 🎨 样式定制

### CSS类名

```css
.provider-card {
    /* API供应商卡片样式 */
}

.stat-card {
    /* 统计卡片样式 */
}

.dimension-stats .progress {
    /* 维度统计进度条样式 */
}
```

### Bootstrap集成

Dashboard模块完全集成Bootstrap 5：
- 使用Bootstrap图标
- 响应式布局
- 标准组件样式

## 📄 更新日志

### v2.0.0 (当前版本)
- ✅ 完整的Dashboard功能实现
- ✅ 三家AI供应商支持
- ✅ 信息空间统计可视化
- ✅ API Key安全管理
- ✅ 连接测试功能
- ✅ 响应式设计

## 📞 支持

如果在使用过程中遇到问题：

1. 查看浏览器控制台错误信息
2. 确认所有依赖文件已正确加载
3. 参考测试页面的实现方式
4. 检查优化计划文档的最新状态

---

**作者**: JtheWL  
**更新时间**: 2025年1月  
**版本**: v2.0.0 