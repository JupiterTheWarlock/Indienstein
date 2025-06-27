/**
 * UIManager - 界面交互管理器类
 * 处理界面元素的交互逻辑
 */

class UIManager {
    constructor() {
        // 缓存DOM元素
        this.elements = {};
        
        // 状态变量
        this.state = {
            isGenerating: false,
            isBatchGenerating: false,
            selectedDimensions: [],
            currentSelectedVectors: {},
            currentResult: null,
            batchResults: [],
            currentBatchIndex: -1
        };
        
        this.isInitialized = false;
    }
    
    /**
     * 初始化UI
     */
    async init() {
        if (this.isInitialized) {
            console.log('UIManager 已经初始化');
            return;
        }
        
        try {
            console.log('初始化 UIManager...');
            
            this.cacheElements();
            this.bindEvents();
            this.setupDimensionsList();
            this.updateGenerateButton();
            this.loadSettings();
            
            this.isInitialized = true;
            console.log('UIManager 初始化完成');
            
        } catch (error) {
            console.error('UIManager 初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 重新初始化（当Tab激活时）
     */
    async initialize() {
        if (!this.isInitialized) {
            await this.init();
        } else {
            // 刷新数据
            this.setupDimensionsList();
            this.updateGenerateButton();
        }
    }
    
    /**
     * 缓存DOM元素
     */
    cacheElements() {
        try {
            // 维度选择
            this.elements.dimensionsList = document.getElementById('dimensionsList');
            this.elements.selectAllBtn = document.getElementById('selectAllBtn');
            this.elements.deselectAllBtn = document.getElementById('deselectAllBtn');
            
            // 生成区域
            this.elements.randomBtn = document.getElementById('randomBtn');
            this.elements.generateBtn = document.getElementById('generateBtn');
            this.elements.userPrompt = document.getElementById('userPrompt');
            this.elements.vectorsContainer = document.getElementById('vectorsContainer');
            this.elements.resultContent = document.getElementById('resultContent');
            this.elements.exportBtn = document.getElementById('exportBtn');
            this.elements.copyBtn = document.getElementById('copyBtn');
            
            // 批量生成
            this.elements.batchCount = document.getElementById('batchCount');
            this.elements.batchDelay = document.getElementById('batchDelay');
            this.elements.batchGenerateBtn = document.getElementById('batchGenerateBtn');
            this.elements.batchProgress = document.getElementById('batchProgress');
            this.elements.batchResults = document.getElementById('batchResults');
            this.elements.exportBatchBtn = document.getElementById('exportBatchBtn');
            
            // 设置相关
            this.elements.providerSelect = document.getElementById('providerSelect');
            this.elements.modelSelect = document.getElementById('modelSelect');
            this.elements.apiKeyInput = document.getElementById('apiKeyInput');
            this.elements.saveQuickSettingsBtn = document.getElementById('saveQuickSettingsBtn');
            
            // 格式切换
            this.elements.formatToggle = document.getElementById('formatToggle');
            
            console.log('DOM元素缓存完成');
            
        } catch (error) {
            console.error('缓存DOM元素失败:', error);
            throw error;
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        try {
            // 维度选择事件
            if (this.elements.selectAllBtn) {
                this.elements.selectAllBtn.addEventListener('click', () => this.selectAllDimensions());
            }
            if (this.elements.deselectAllBtn) {
                this.elements.deselectAllBtn.addEventListener('click', () => this.deselectAllDimensions());
            }
            
            // 生成区域事件
            if (this.elements.randomBtn) {
                this.elements.randomBtn.addEventListener('click', () => this.randomSelectVectors());
            }
            if (this.elements.generateBtn) {
                this.elements.generateBtn.addEventListener('click', () => this.generateInspiration());
            }
            if (this.elements.exportBtn) {
                this.elements.exportBtn.addEventListener('click', () => this.exportInspiration());
            }
            if (this.elements.copyBtn) {
                this.elements.copyBtn.addEventListener('click', () => this.copyInspiration());
            }
            
            // 批量生成事件
            if (this.elements.batchGenerateBtn) {
                this.elements.batchGenerateBtn.addEventListener('click', () => this.startBatchGeneration());
            }
            if (this.elements.exportBatchBtn) {
                this.elements.exportBatchBtn.addEventListener('click', () => this.exportBatchInspirations());
            }
            
            // 设置相关事件
            if (this.elements.providerSelect) {
                this.elements.providerSelect.addEventListener('change', () => this.updateModelOptions());
            }
            
            // 格式切换事件
            if (this.elements.formatToggle) {
                this.elements.formatToggle.addEventListener('change', () => this.toggleFormat());
            }
            
            console.log('事件绑定完成');
            
        } catch (error) {
            console.error('绑定事件失败:', error);
            throw error;
        }
    }
    
    /**
     * 设置维度列表
     */
    setupDimensionsList() {
        try {
            if (!this.elements.dimensionsList) {
                console.warn('dimensionsList 元素未找到');
                return;
            }
            
            const dimensions = InfoSpace.getAllDimensions();
            const dimensionsList = this.elements.dimensionsList;
            dimensionsList.innerHTML = '';
            
            if (dimensions.length === 0) {
                dimensionsList.innerHTML = '<div class="text-muted text-center p-3">暂无可用维度</div>';
                return;
            }
            
            dimensions.forEach(dimension => {
                const item = document.createElement('div');
                item.className = 'list-group-item dimension-item';
                item.dataset.id = dimension.id;
                
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${dimension.name}</strong>
                            <div class="text-muted small">${dimension.vectors?.length || 0} 个词汇</div>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="check_${dimension.id}">
                        </div>
                    </div>
                `;
                
                // 点击事件
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        const checkbox = item.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            checkbox.checked = !checkbox.checked;
                            this.updateSelectedDimensions();
                        }
                    }
                });
                
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        this.updateSelectedDimensions();
                    });
                }
                
                dimensionsList.appendChild(item);
            });
            
            // 默认全选
            this.selectAllDimensions();
            
        } catch (error) {
            console.error('设置维度列表失败:', error);
        }
    }
    
    /**
     * 全选维度
     */
    selectAllDimensions() {
        if (!this.elements.dimensionsList) return;
        
        const checkboxes = this.elements.dimensionsList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedDimensions();
    }
    
    /**
     * 取消全选维度
     */
    deselectAllDimensions() {
        if (!this.elements.dimensionsList) return;
        
        const checkboxes = this.elements.dimensionsList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedDimensions();
    }
    
    /**
     * 更新选中的维度
     */
    updateSelectedDimensions() {
        if (!this.elements.dimensionsList) return;
        
        const checkboxes = this.elements.dimensionsList.querySelectorAll('input[type="checkbox"]');
        const selectedDimensions = [];
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const dimensionId = checkbox.id.replace('check_', '');
                selectedDimensions.push(dimensionId);
            }
        });
        
        this.state.selectedDimensions = selectedDimensions;
        this.updateGenerateButton();
    }
    
    /**
     * 更新生成按钮状态
     */
    updateGenerateButton() {
        const hasSelectedVectors = Object.keys(this.state.currentSelectedVectors).length > 0;
        const hasSelectedDimensions = this.state.selectedDimensions.length > 0;
        
        if (this.elements.generateBtn) {
            this.elements.generateBtn.disabled = this.state.isGenerating || !hasSelectedVectors;
        }
        if (this.elements.batchGenerateBtn) {
            this.elements.batchGenerateBtn.disabled = this.state.isBatchGenerating || !hasSelectedDimensions;
        }
    }
    
    /**
     * 随机选择向量
     */
    async randomSelectVectors() {
        try {
            if (this.state.selectedDimensions.length === 0) {
                this.showMessage('请先选择至少一个维度', 'warning');
                return;
            }
            
            // 调用IndiensteinService选择向量
            if (typeof IndiensteinService !== 'undefined') {
                this.state.currentSelectedVectors = await IndiensteinService.selectFromDimensionIds(this.state.selectedDimensions);
            } else {
                console.warn('IndiensteinService 未找到，使用备用方法');
                this.state.currentSelectedVectors = this.fallbackRandomSelect();
            }
            
            this.displaySelectedVectors();
            this.updateGenerateButton();
            
        } catch (error) {
            console.error('随机选择向量失败:', error);
            this.showMessage('随机选择失败', 'error');
        }
    }
    
    /**
     * 备用随机选择方法
     */
    fallbackRandomSelect() {
        const selectedVectors = {};
        
        this.state.selectedDimensions.forEach(dimensionId => {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension && dimension.vectors && dimension.vectors.length > 0) {
                const randomIndex = Math.floor(Math.random() * dimension.vectors.length);
                selectedVectors[dimensionId] = dimension.vectors[randomIndex];
            }
        });
        
        return selectedVectors;
    }
    
    /**
     * 显示选中的向量
     */
    displaySelectedVectors() {
        if (!this.elements.vectorsContainer) return;
        
        const container = this.elements.vectorsContainer;
        container.innerHTML = '';
        
        if (Object.keys(this.state.currentSelectedVectors).length === 0) {
            container.innerHTML = '<div class="text-muted">点击"随机选择"按钮开始...</div>';
            return;
        }
        
        Object.entries(this.state.currentSelectedVectors).forEach(([dimensionId, vector]) => {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension) {
                const tag = document.createElement('span');
                tag.className = 'vector-tag';
                tag.innerHTML = `
                    <span class="dimension-name">${dimension.name}:</span>
                    <span class="vector-name">${vector.name}</span>
                `;
                container.appendChild(tag);
            }
        });
    }
    
    /**
     * 生成灵感
     */
    async generateInspiration() {
        try {
            if (this.state.isGenerating) return;
            if (Object.keys(this.state.currentSelectedVectors).length === 0) {
                this.showMessage('请先随机选择向量', 'warning');
                return;
            }
            
            this.state.isGenerating = true;
            this.updateGenerateButton();
            
            const resultContent = this.elements.resultContent;
            if (resultContent) {
                resultContent.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">正在生成灵感...</p></div>';
            }
            
            // 获取用户提示
            const userPrompt = this.elements.userPrompt?.value || '';
            
            // 调用生成服务
            const result = await this.callGenerationService(userPrompt);
            
            if (result) {
                this.state.currentResult = result;
                this.displayResult(result.content);
                this.enableExportButtons();
                this.showMessage('灵感生成成功！', 'success');
            } else {
                throw new Error('生成服务返回空结果');
            }
            
        } catch (error) {
            console.error('生成灵感失败:', error);
            this.showMessage('生成失败: ' + error.message, 'error');
            
            if (this.elements.resultContent) {
                this.elements.resultContent.innerHTML = '<div class="text-center text-danger"><i class="bi bi-exclamation-triangle"></i><p class="mt-2">生成失败，请检查网络连接和API配置</p></div>';
            }
            
        } finally {
            this.state.isGenerating = false;
            this.updateGenerateButton();
        }
    }
    
    /**
     * 调用生成服务
     */
    async callGenerationService(userPrompt) {
        // 模拟API调用（实际应用中这里会调用真实的AI服务）
        return new Promise((resolve) => {
            setTimeout(() => {
                const inspiration = {
                    content: this.generateMockContent(),
                    sourceVectors: this.state.currentSelectedVectors,
                    userPrompt: userPrompt,
                    assistantId: 'mock-assistant',
                    createdTime: new Date().toISOString()
                };
                resolve(inspiration);
            }, 2000);
        });
    }
    
    /**
     * 生成模拟内容（用于测试）
     */
    generateMockContent() {
        const templates = [
            "一个融合了 {elements} 的创新游戏概念：玩家需要在充满挑战的环境中运用策略和技巧来达成目标。",
            "想象一个结合了 {elements} 的游戏世界，玩家将体验前所未有的冒险旅程。",
            "这是一个以 {elements} 为核心机制的独特游戏设计，为玩家带来全新的游戏体验。"
        ];
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        const elements = Object.values(this.state.currentSelectedVectors).map(v => v.name).join('、');
        
        return template.replace('{elements}', elements);
    }
    
    /**
     * 显示生成结果
     */
    displayResult(content) {
        if (!this.elements.resultContent) return;
        
        this.elements.resultContent.innerHTML = `
            <div class="result-text">
                ${content}
            </div>
        `;
    }
    
    /**
     * 启用导出按钮
     */
    enableExportButtons() {
        if (this.elements.exportBtn) {
            this.elements.exportBtn.disabled = false;
        }
        if (this.elements.copyBtn) {
            this.elements.copyBtn.disabled = false;
        }
    }
    
    /**
     * 复制灵感内容
     */
    async copyInspiration() {
        if (!this.state.currentResult) {
            this.showMessage('没有可复制的内容', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.state.currentResult.content);
            this.showMessage('内容已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showMessage('复制失败', 'error');
        }
    }
    
    /**
     * 导出灵感
     */
    exportInspiration() {
        if (!this.state.currentResult) {
            this.showMessage('没有可导出的内容', 'warning');
            return;
        }
        
        try {
            const storageService = new StorageService();
            storageService.exportInspirationAsText(this.state.currentResult);
            this.showMessage('导出成功', 'success');
        } catch (error) {
            console.error('导出失败:', error);
            this.showMessage('导出失败', 'error');
        }
    }
    
    /**
     * 开始批量生成
     */
    async startBatchGeneration() {
        try {
            if (this.state.isBatchGenerating) return;
            if (this.state.selectedDimensions.length === 0) {
                this.showMessage('请先选择至少一个维度', 'warning');
                return;
            }
            
            const count = parseInt(this.elements.batchCount?.value || '3');
            if (count < 1 || count > 10) {
                this.showMessage('批量生成数量必须在1-10之间', 'warning');
                return;
            }
            
            this.state.isBatchGenerating = true;
            this.state.batchResults = [];
            this.updateGenerateButton();
            
            // 显示进度条
            if (this.elements.batchProgress) {
                this.elements.batchProgress.classList.remove('d-none');
            }
            
            // 清空结果区域
            if (this.elements.batchResults) {
                this.elements.batchResults.innerHTML = '';
            }
            
            for (let i = 0; i < count; i++) {
                await this.generateBatchItem(i, count);
                
                // 更新进度
                const progress = ((i + 1) / count) * 100;
                if (this.elements.batchProgress) {
                    const progressBar = this.elements.batchProgress.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${progress}%`;
                    }
                }
                
                // 延迟
                const delay = parseInt(this.elements.batchDelay?.value || '1') * 1000;
                if (i < count - 1 && delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            // 完成
            this.showMessage(`批量生成完成！成功生成 ${this.state.batchResults.length} 个灵感`, 'success');
            
            if (this.elements.exportBatchBtn) {
                this.elements.exportBatchBtn.classList.remove('d-none');
            }
            
        } catch (error) {
            console.error('批量生成失败:', error);
            this.showMessage('批量生成失败: ' + error.message, 'error');
            
        } finally {
            this.state.isBatchGenerating = false;
            this.updateGenerateButton();
            
            // 隐藏进度条
            if (this.elements.batchProgress) {
                this.elements.batchProgress.classList.add('d-none');
            }
        }
    }
    
    /**
     * 生成批量项目
     */
    async generateBatchItem(index, total) {
        try {
            // 随机选择向量
            await this.randomSelectVectors();
            
            // 生成内容
            const userPrompt = this.elements.userPrompt?.value || '';
            const result = await this.callGenerationService(userPrompt);
            
            if (result) {
                this.state.batchResults.push(result);
                this.displayBatchItem(result, index);
            }
            
        } catch (error) {
            console.error(`批量生成第${index + 1}项失败:`, error);
        }
    }
    
    /**
     * 显示批量项目
     */
    displayBatchItem(result, index) {
        if (!this.elements.batchResults) return;
        
        const item = document.createElement('div');
        item.className = 'batch-result-item border rounded p-2 mb-2';
        item.innerHTML = `
            <div class="small text-muted">#${index + 1}</div>
            <div class="batch-content">${result.content.substring(0, 100)}...</div>
        `;
        
        item.addEventListener('click', () => {
            this.showBatchResultDetail(result, index);
        });
        
        this.elements.batchResults.appendChild(item);
    }
    
    /**
     * 显示批量结果详情
     */
    showBatchResultDetail(result, index) {
        // 更新主结果区域
        this.state.currentResult = result;
        this.displayResult(result.content);
        this.enableExportButtons();
        
        // 更新选中的向量显示
        this.state.currentSelectedVectors = result.sourceVectors;
        this.displaySelectedVectors();
        
        this.showMessage(`已选择第${index + 1}个批量生成结果`, 'info');
    }
    
    /**
     * 导出批量结果
     */
    exportBatchInspirations() {
        if (this.state.batchResults.length === 0) {
            this.showMessage('没有可导出的批量结果', 'warning');
            return;
        }
        
        try {
            const storageService = new StorageService();
            storageService.exportInspirations(this.state.batchResults, 'batch_inspirations.json');
            this.showMessage('批量导出成功', 'success');
        } catch (error) {
            console.error('批量导出失败:', error);
            this.showMessage('批量导出失败', 'error');
        }
    }
    
    /**
     * 更新模型选项
     */
    updateModelOptions() {
        // 这个方法由Tab管理器处理
        if (window.tabManager) {
            const provider = this.elements.providerSelect?.value;
            if (provider) {
                window.tabManager.updateModelOptions(provider);
            }
        }
    }
    
    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const storageService = new StorageService();
            const settings = storageService.getSettings();
            
            // 设置格式切换
            if (this.elements.formatToggle && settings.longFormat !== undefined) {
                this.elements.formatToggle.checked = settings.longFormat;
                this.toggleFormat();
            }
            
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }
    
    /**
     * 切换格式
     */
    toggleFormat() {
        if (!this.elements.formatToggle) return;
        
        const isLongFormat = this.elements.formatToggle.checked;
        
        if (isLongFormat) {
            document.body.classList.add('long-format');
        } else {
            document.body.classList.remove('long-format');
        }
        
        // 保存设置
        try {
            const storageService = new StorageService();
            const settings = storageService.getSettings();
            settings.longFormat = isLongFormat;
            storageService.saveSettings(settings);
        } catch (error) {
            console.error('保存格式设置失败:', error);
        }
    }
    
    /**
     * 重置界面
     */
    reset() {
        this.state.currentSelectedVectors = {};
        this.state.currentResult = null;
        this.state.batchResults = [];
        
        if (this.elements.vectorsContainer) {
            this.elements.vectorsContainer.innerHTML = '<div class="text-muted">点击"随机选择"按钮开始...</div>';
        }
        
        if (this.elements.resultContent) {
            this.elements.resultContent.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-lightbulb" style="font-size: 3rem;"></i>
                    <p class="mt-2">生成的灵感将显示在这里</p>
                </div>
            `;
        }
        
        if (this.elements.batchResults) {
            this.elements.batchResults.innerHTML = '';
        }
        
        if (this.elements.userPrompt) {
            this.elements.userPrompt.value = '';
        }
        
        this.updateGenerateButton();
        this.showMessage('界面已重置', 'info');
    }
    
    /**
     * 显示历史记录
     */
    showHistory() {
        try {
            const storageService = new StorageService();
            const recentInspirations = storageService.getRecentInspirations(10);
            
            if (recentInspirations.length === 0) {
                this.showMessage('暂无历史记录', 'info');
                return;
            }
            
            // 这里可以显示一个模态框来展示历史记录
            console.log('历史记录:', recentInspirations);
            this.showMessage(`找到 ${recentInspirations.length} 条历史记录`, 'info');
            
        } catch (error) {
            console.error('获取历史记录失败:', error);
            this.showMessage('获取历史记录失败', 'error');
        }
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 使用Tab管理器的通知系统
        if (window.tabManager) {
            window.tabManager.showNotification(message, type);
        } else {
            // 回退到console
            console.log(`[UI ${type.toUpperCase()}] ${message}`);
        }
    }
    
    /**
     * 获取当前状态
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * 刷新UI
     */
    refresh() {
        this.setupDimensionsList();
        this.updateGenerateButton();
    }
}

// 为了兼容性，保留UI对象的引用
const UI = UIManager;

// 导出到全局
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
    window.UI = UI;
} 