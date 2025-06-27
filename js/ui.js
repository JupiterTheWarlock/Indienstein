/**
 * UI - 界面交互模块
 * 处理界面元素的交互逻辑
 */

const UI = {
    // 缓存DOM元素
    elements: {},
    
    // 状态变量
    state: {
        isGenerating: false,
        isBatchGenerating: false,
        selectedDimensions: [],
        currentSelectedVectors: {},
        currentResult: null,
        batchResults: [],
        currentBatchIndex: -1
    },
    
    /**
     * 初始化UI
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupDimensionsList();
        this.updateGenerateButton();
    },
    
    /**
     * 缓存DOM元素
     */
    cacheElements() {
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
        
        // 批量生成
        this.elements.batchCount = document.getElementById('batchCount');
        this.elements.batchDelay = document.getElementById('batchDelay');
        this.elements.batchGenerateBtn = document.getElementById('batchGenerateBtn');
        this.elements.batchProgress = document.getElementById('batchProgress');
        this.elements.batchResults = document.getElementById('batchResults');
        this.elements.exportBatchBtn = document.getElementById('exportBatchBtn');
        
        // 模态框
        this.elements.settingsModal = document.getElementById('settingsModal');
        this.elements.providerSelect = document.getElementById('providerSelect');
        this.elements.modelSelect = document.getElementById('modelSelect');
        this.elements.apiKeyInput = document.getElementById('apiKeyInput');
        this.elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        // 格式切换
        this.elements.formatToggle = document.getElementById('formatToggle');
    },
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 维度选择
        this.elements.selectAllBtn.addEventListener('click', () => this.selectAllDimensions());
        this.elements.deselectAllBtn.addEventListener('click', () => this.deselectAllDimensions());
        
        // 生成区域
        this.elements.randomBtn.addEventListener('click', () => this.randomSelectVectors());
        this.elements.generateBtn.addEventListener('click', () => this.generateInspiration());
        this.elements.exportBtn.addEventListener('click', () => this.exportInspiration());
        
        // 批量生成
        this.elements.batchGenerateBtn.addEventListener('click', () => this.startBatchGeneration());
        this.elements.exportBatchBtn.addEventListener('click', () => this.exportBatchInspirations());
        
        // 设置
        this.elements.providerSelect.addEventListener('change', () => this.updateModelOptions());
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // 格式切换
        this.elements.formatToggle.addEventListener('change', () => this.toggleFormat());
    },
    
    /**
     * 设置维度列表
     */
    setupDimensionsList() {
        const dimensions = InfoSpace.getAllDimensions();
        const dimensionsList = this.elements.dimensionsList;
        dimensionsList.innerHTML = '';
        
        dimensions.forEach(dimension => {
            const item = document.createElement('div');
            item.className = 'list-group-item dimension-item';
            item.dataset.id = dimension.id;
            
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${dimension.name}</strong>
                        <div class="text-muted small">${dimension.vectors.length} 个词汇</div>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="check_${dimension.id}">
                    </div>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.updateSelectedDimensions();
                }
            });
            
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                this.updateSelectedDimensions();
            });
            
            dimensionsList.appendChild(item);
        });
        
        // 默认全选
        this.selectAllDimensions();
    },
    
    /**
     * 全选维度
     */
    selectAllDimensions() {
        const checkboxes = this.elements.dimensionsList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedDimensions();
    },
    
    /**
     * 取消全选维度
     */
    deselectAllDimensions() {
        const checkboxes = this.elements.dimensionsList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedDimensions();
    },
    
    /**
     * 更新选中的维度
     */
    updateSelectedDimensions() {
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
    },
    
    /**
     * 更新生成按钮状态
     */
    updateGenerateButton() {
        const hasSelectedVectors = Object.keys(this.state.currentSelectedVectors).length > 0;
        const hasSelectedDimensions = this.state.selectedDimensions.length > 0;
        
        this.elements.generateBtn.disabled = this.state.isGenerating || !hasSelectedVectors;
        this.elements.batchGenerateBtn.disabled = this.state.isBatchGenerating || !hasSelectedDimensions;
    },
    
    /**
     * 随机选择向量
     */
    randomSelectVectors() {
        if (this.state.selectedDimensions.length === 0) {
            this.showMessage('请先选择至少一个维度', 'warning');
            return;
        }
        
        this.state.currentSelectedVectors = IndiensteinService.selectFromDimensionIds(this.state.selectedDimensions);
        this.displaySelectedVectors();
        this.updateGenerateButton();
    },
    
    /**
     * 显示选中的向量
     */
    displaySelectedVectors() {
        const container = this.elements.vectorsContainer;
        container.innerHTML = '';
        
        const selectedVectors = this.state.currentSelectedVectors;
        if (Object.keys(selectedVectors).length === 0) {
            container.innerHTML = '<div class="text-muted">点击"随机选择"按钮开始...</div>';
            return;
        }
        
        for (const [dimensionId, vector] of Object.entries(selectedVectors)) {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension) {
                const tag = document.createElement('div');
                tag.className = 'vector-tag';
                tag.innerHTML = `
                    <span class="dimension-name">${dimension.name}:</span>
                    <span class="vector-name">${vector.name}</span>
                `;
                container.appendChild(tag);
            }
        }
    },
    
    /**
     * 生成灵感
     */
    async generateInspiration() {
        if (this.state.isGenerating) return;
        
        const selectedVectors = this.state.currentSelectedVectors;
        if (Object.keys(selectedVectors).length === 0) {
            this.showMessage('请先随机选择向量', 'warning');
            return;
        }
        
        // 检查API设置
        if (!this.checkApiSettings()) {
            return;
        }
        
        this.state.isGenerating = true;
        this.elements.generateBtn.disabled = true;
        this.elements.generateBtn.innerHTML = '<span class="loading-spinner me-1"></span> 生成中...';
        
        this.elements.resultContent.innerHTML = '<div class="typing-animation"></div>';
        this.elements.resultContent.classList.add('generating');
        
        const userPrompt = this.elements.userPrompt.value;
        
        try {
            const result = await IndiensteinService.generateInspirationStream(
                selectedVectors,
                userPrompt,
                (content) => {
                    // 实时更新内容
                    if (this.elements.resultContent.classList.contains('generating')) {
                        this.elements.resultContent.innerHTML = content;
                        this.elements.resultContent.innerHTML += '<span class="typing-animation"></span>';
                    } else {
                        this.elements.resultContent.innerHTML += content;
                    }
                },
                (finalContent) => {
                    // 完成回调
                    this.elements.resultContent.classList.remove('generating');
                    this.elements.exportBtn.disabled = false;
                },
                (error) => {
                    // 错误回调
                    this.elements.resultContent.classList.remove('generating');
                    this.elements.resultContent.innerHTML = `<div class="text-danger">生成失败: ${error}</div>`;
                }
            );
            
            if (result) {
                this.state.currentResult = result;
                
                // 保存到本地存储
                StorageService.saveInspiration(result);
            }
        } catch (error) {
            console.error('生成灵感失败:', error);
            this.elements.resultContent.innerHTML = `<div class="text-danger">生成失败: ${error.message}</div>`;
        } finally {
            this.state.isGenerating = false;
            this.elements.generateBtn.disabled = false;
            this.elements.generateBtn.innerHTML = '<i class="bi bi-stars"></i> 生成灵感';
        }
    },
    
    /**
     * 导出当前灵感
     */
    exportInspiration() {
        if (!this.state.currentResult) return;
        
        StorageService.exportInspirationAsText(
            this.state.currentResult,
            `游戏灵感_${new Date().toISOString().slice(0, 10)}.txt`
        );
    },
    
    /**
     * 开始批量生成
     */
    async startBatchGeneration() {
        if (this.state.isBatchGenerating) return;
        
        if (this.state.selectedDimensions.length === 0) {
            this.showMessage('请先选择至少一个维度', 'warning');
            return;
        }
        
        // 检查API设置
        if (!this.checkApiSettings()) {
            return;
        }
        
        const count = parseInt(this.elements.batchCount.value) || 3;
        const delay = parseFloat(this.elements.batchDelay.value) || 1;
        const userPrompt = this.elements.userPrompt.value;
        
        this.state.isBatchGenerating = true;
        this.elements.batchGenerateBtn.disabled = true;
        this.elements.batchGenerateBtn.innerHTML = '<span class="loading-spinner me-1"></span> 生成中...';
        
        // 显示进度条
        this.elements.batchProgress.classList.remove('d-none');
        this.elements.batchProgress.querySelector('.progress-bar').style.width = '0%';
        
        // 清空结果区域
        this.elements.batchResults.innerHTML = '';
        this.state.batchResults = [];
        
        const config = {
            count: count,
            dimensionIds: this.state.selectedDimensions,
            userPrompt: userPrompt,
            delayBetweenRequests: delay
        };
        
        try {
            // 创建结果占位符
            for (let i = 0; i < count; i++) {
                const resultItem = document.createElement('div');
                resultItem.className = 'card mb-2 batch-result-item';
                resultItem.dataset.index = i;
                resultItem.innerHTML = `
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between">
                            <div>
                                <strong>灵感 #${i+1}</strong>
                            </div>
                            <div class="text-muted small">
                                <span class="status">等待中...</span>
                            </div>
                        </div>
                        <div class="content mt-1 small text-truncate">...</div>
                    </div>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.showBatchResult(i);
                });
                
                this.elements.batchResults.appendChild(resultItem);
            }
            
            // 开始批量生成
            const results = await IndiensteinService.generateBatchInspiration(
                config,
                (index, content) => {
                    // 单项更新回调
                    const item = this.elements.batchResults.querySelector(`[data-index="${index}"]`);
                    if (item) {
                        const statusEl = item.querySelector('.status');
                        const contentEl = item.querySelector('.content');
                        
                        statusEl.textContent = '生成中...';
                        if (contentEl.textContent === '...') {
                            contentEl.textContent = content;
                        } else {
                            contentEl.textContent += content;
                        }
                    }
                },
                (index, result) => {
                    // 单项完成回调
                    const item = this.elements.batchResults.querySelector(`[data-index="${index}"]`);
                    if (item) {
                        const statusEl = item.querySelector('.status');
                        const contentEl = item.querySelector('.content');
                        
                        statusEl.textContent = '已完成';
                        statusEl.classList.add('text-success');
                        contentEl.textContent = result.content.substring(0, 50) + '...';
                    }
                    
                    // 保存结果
                    this.state.batchResults[index] = result;
                },
                (index, error) => {
                    // 单项错误回调
                    const item = this.elements.batchResults.querySelector(`[data-index="${index}"]`);
                    if (item) {
                        const statusEl = item.querySelector('.status');
                        const contentEl = item.querySelector('.content');
                        
                        statusEl.textContent = '失败';
                        statusEl.classList.add('text-danger');
                        contentEl.textContent = `错误: ${error}`;
                    }
                },
                (current, total) => {
                    // 进度回调
                    const progress = Math.round((current + 1) / total * 100);
                    this.elements.batchProgress.querySelector('.progress-bar').style.width = `${progress}%`;
                }
            );
            
            // 保存批量结果到本地存储
            if (results && results.length > 0) {
                StorageService.saveBatchInspirations(results);
                this.elements.exportBatchBtn.classList.remove('d-none');
            }
            
        } catch (error) {
            console.error('批量生成失败:', error);
            this.showMessage('批量生成失败: ' + error.message, 'danger');
        } finally {
            this.state.isBatchGenerating = false;
            this.elements.batchGenerateBtn.disabled = false;
            this.elements.batchGenerateBtn.innerHTML = '<i class="bi bi-lightning"></i> 开始批量生成';
        }
    },
    
    /**
     * 显示批量生成结果
     * @param {number} index 结果索引
     */
    showBatchResult(index) {
        const result = this.state.batchResults[index];
        if (!result) return;
        
        this.state.currentBatchIndex = index;
        
        // 高亮选中项
        const items = this.elements.batchResults.querySelectorAll('.batch-result-item');
        items.forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = this.elements.batchResults.querySelector(`[data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // 显示详细结果
        const modal = new bootstrap.Modal(document.getElementById('batchResultModal'));
        const contentEl = document.getElementById('batchResultContent');
        
        // 构建结果内容
        let content = '';
        
        // 向量信息
        content += '<div class="mb-3">';
        content += '<h6>选择的元素：</h6>';
        content += '<div class="d-flex flex-wrap gap-2 mb-2">';
        
        for (const [dimensionId, vector] of Object.entries(result.sourceVectors)) {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension) {
                content += `
                    <div class="vector-tag">
                        <span class="dimension-name">${dimension.name}:</span>
                        <span class="vector-name">${vector.name}</span>
                    </div>
                `;
            }
        }
        
        content += '</div>';
        content += '</div>';
        
        // 用户提示
        if (result.userPrompt) {
            content += `
                <div class="mb-3">
                    <h6>用户提示：</h6>
                    <div class="border rounded p-2">${result.userPrompt}</div>
                </div>
            `;
        }
        
        // 生成内容
        content += `
            <div>
                <h6>生成内容：</h6>
                <div class="border rounded p-3">${result.content}</div>
            </div>
        `;
        
        contentEl.innerHTML = content;
        
        // 导出按钮事件
        const exportBtn = document.getElementById('exportCurrentBatchBtn');
        exportBtn.onclick = () => {
            StorageService.exportInspirationAsText(
                result,
                `游戏灵感_${new Date().toISOString().slice(0, 10)}_${index+1}.txt`
            );
        };
        
        modal.show();
    },
    
    /**
     * 导出所有批量生成结果
     */
    exportBatchInspirations() {
        if (!this.state.batchResults || this.state.batchResults.length === 0) return;
        
        StorageService.exportInspirations(
            this.state.batchResults,
            `游戏灵感_批量_${new Date().toISOString().slice(0, 10)}.json`
        );
    },
    
    /**
     * 更新模型选项
     */
    updateModelOptions() {
        const provider = this.elements.providerSelect.value;
        AIService.currentSettings.provider = provider;
        
        const models = AIService.getModelsForCurrentProvider();
        const modelSelect = this.elements.modelSelect;
        modelSelect.innerHTML = '';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        
        // 设置默认模型
        if (models.length > 0) {
            modelSelect.value = AIService.providers[provider].defaultModel;
        }
    },
    
    /**
     * 保存设置
     */
    saveSettings() {
        const provider = this.elements.providerSelect.value;
        const model = this.elements.modelSelect.value;
        const apiKey = this.elements.apiKeyInput.value;
        
        AIService.updateSettings({
            provider: provider,
            model: model,
            apiKey: apiKey
        });
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(this.elements.settingsModal);
        modal.hide();
        
        this.showMessage('设置已保存', 'success');
    },
    
    /**
     * 检查API设置
     * @returns {boolean} 是否设置有效
     */
    checkApiSettings() {
        if (!AIService.currentSettings.apiKey) {
            this.showMessage('请先设置API Key', 'warning');
            
            // 打开设置模态框
            const modal = new bootstrap.Modal(this.elements.settingsModal);
            modal.show();
            
            return false;
        }
        
        return true;
    },
    
    /**
     * 切换格式
     */
    toggleFormat() {
        const isLongFormat = this.elements.formatToggle.checked;
        document.body.classList.toggle('long-format', isLongFormat);
    },
    
    /**
     * 显示消息
     * @param {string} message 消息内容
     * @param {string} type 消息类型
     */
    showMessage(message, type = 'info') {
        // 创建消息元素
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // 添加到页面
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // 显示消息
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // 自动移除
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}; 