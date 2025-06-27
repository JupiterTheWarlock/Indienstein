# Indienstein - AI游戏灵感生成器 (Web版)

> 🎮 基于多维度向量组合的AI游戏创意生成工具

## 📋 项目概述

Indienstein是一个基于人工智能的游戏灵感生成器，通过将不同维度（主题、机制、风格等）的信息向量随机组合，构建提示词输入给AI模型，从而生成创新的游戏创意。

本项目是Unity版本Indienstein的Web静态版本，采用现代化的Tab布局设计，提供更直观的用户体验。

## ✨ 主要特色

- 🎯 **三合一Tab界面**：Dashboard总览、Indienstein核心功能、信息空间管理
- 🤖 **三大AI供应商支持**：硅基流动、深度求索、智谱
- 🎲 **智能随机选择**：从多个维度中智能组合元素
- ⚡ **实时流式生成**：支持AI内容的实时流式显示
- 💾 **本地数据持久化**：API Key和历史记录本地安全存储
- 📊 **数据可视化**：信息空间统计和维度分布展示

## 🏗️ 系统架构

### Tab布局设计
```
┌─────────────────────────────────────────────────────────┐
│                 Indienstein - AI游戏灵感生成器            │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│ 📊 Dashboard │                                           │
│             │                                           │
│ 🎯 Indienstein│           内容区域                         │
│             │                                           │
│ 🗃️ 信息空间   │                                           │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
```

### 模块说明

#### 📊 Dashboard
- **项目信息**：版本信息、使用统计
- **API配置**：三家供应商的API Key管理
- **数据总览**：信息空间统计和可视化

#### 🎯 Indienstein
- **维度选择**：从可用维度中选择参与生成的元素
- **随机组合**：智能随机选择向量
- **灵感生成**：AI实时生成游戏创意
- **批量处理**：支持批量生成多个创意

#### 🗃️ 信息空间
- **维度管理**：查看和管理所有维度
- **向量浏览**：浏览各维度下的向量数据
- **数据统计**：维度分布和使用频率统计

## 🚀 快速开始

### 环境要求
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 无需安装任何软件，纯静态网页应用

### 安装步骤

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd Indienstein
   ```

2. **启动服务**
   ```bash
   # 使用Python启动本地服务器
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve .
   
   # 或直接用浏览器打开 index.html
   ```

3. **访问应用**
   ```
   http://localhost:8000
   ```

### 初始配置

1. **配置API Key**
   - 进入Dashboard页面
   - 在"API供应商配置"区域输入你的API Key
   - 支持的供应商：
     - 硅基流动：`https://api.siliconflow.cn`
     - 深度求索：`https://api.deepseek.com`
     - 智谱：`https://open.bigmodel.cn`

2. **测试连接**
   - 点击"测试连接"按钮验证API Key有效性
   - 确保至少配置一个可用的供应商

## 📖 使用指南

### Dashboard使用

1. **查看项目信息**
   - 应用版本和功能介绍
   - 历史生成数量统计

2. **管理API供应商**
   - 输入和保存API Key
   - 查看支持的模型列表
   - 测试连接状态

3. **浏览信息空间总览**
   - 维度数量统计
   - 向量分布图表

### Indienstein使用

1. **选择维度**
   - 在左侧维度列表中选择要参与生成的维度
   - 可使用"全选"/"取消全选"快速操作

2. **随机选择向量**
   - 点击"随机选择"按钮
   - 系统会从选中维度中随机挑选向量

3. **生成灵感**
   - 输入自定义提示词（可选）
   - 选择生成模式（短/长文本）
   - 点击"生成灵感"开始AI生成

4. **批量生成**
   - 在右侧设置批量生成数量
   - 设置请求间隔避免API限制
   - 查看生成进度

### 信息空间使用

1. **浏览维度**
   - 左侧列表显示所有可用维度
   - 点击维度查看详细信息

2. **查看向量**
   - 选择维度后右侧显示该维度的所有向量
   - 每个向量包含名称、描述和标签

3. **数据统计**
   - 查看维度分布统计图表
   - 了解数据结构和使用情况

## 🔧 技术栈

- **前端框架**：原生JavaScript (ES6+)
- **UI框架**：Bootstrap 5
- **图标库**：Bootstrap Icons
- **存储**：localStorage
- **网络**：Fetch API + ReadableStream

## 📁 项目结构

```
Indienstein/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式表
├── js/
│   ├── main.js            # 应用入口
│   ├── dashboard.js       # Dashboard模块
│   ├── infoSpace.js       # 信息空间数据
│   ├── infoSpaceModule.js # 信息空间模块
│   ├── aiService.js       # AI服务
│   ├── indiensteinService.js # 核心功能
│   ├── storageService.js  # 存储服务
│   └── ui.js             # UI交互
└── README.md             # 项目说明
```

## 🛠️ 开发指南

### 本地开发

1. **修改信息空间数据**
   ```javascript
   // 编辑 js/infoSpace.js
   const InfoSpace = {
     dimensions: {
       "theme": {
         // 添加新的主题向量
       }
     }
   };
   ```

2. **添加新的AI供应商**
   ```javascript
   // 编辑 js/aiService.js
   const AI_PROVIDERS = {
     "new_provider": {
       name: "新供应商",
       apiUrl: "https://api.example.com/v1/chat/completions"
     }
   };
   ```

3. **自定义样式**
   ```css
   /* 编辑 css/style.css */
   .custom-style {
     /* 你的样式 */
   }
   ```

### 调试技巧

1. **开启控制台日志**
   ```javascript
   // 在浏览器控制台中
   localStorage.setItem('debug', 'true');
   ```

2. **查看存储数据**
   ```javascript
   // 查看API Key
   Object.keys(localStorage).filter(key => key.includes('api_key'));
   
   // 查看历史记录
   JSON.parse(localStorage.getItem('indienstein_history'));
   ```

## 🔒 安全说明

- **API Key安全**：所有API Key仅存储在浏览器本地，不会上传到任何服务器
- **数据隐私**：生成的内容和历史记录仅保存在本地浏览器中
- **HTTPS要求**：建议在HTTPS环境下使用以确保数据传输安全

## 🐛 常见问题

### Q: API Key保存后仍显示"未配置"？
A: 检查API Key格式是否正确，确保没有多余的空格或特殊字符。

### Q: 生成时提示"连接失败"？
A: 
1. 检查网络连接
2. 验证API Key是否有效
3. 确认供应商服务是否正常

### Q: 批量生成中断？
A: 可能是API调用频率限制，建议增加请求间隔时间。

### Q: 移动端显示异常？
A: 清除浏览器缓存，刷新页面。应用支持响应式设计。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`) 
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- Unity AIGCToolBox项目提供了核心灵感
- Bootstrap团队提供了优秀的UI框架
- 各AI供应商提供了强大的语言模型支持

---

**享受创意生成的乐趣吧！** 🎉