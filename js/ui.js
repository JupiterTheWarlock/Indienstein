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
        this.setupOverviewPage();
        this.setupInfoSpacePage();
        this.loadIndiensteinSettings(); // 加载Indienstein页面的临时设置
        this.updateGenerateButton();
        
        // 确保默认配置正确
        AIService.resetTemperatureAndTokens();
        this.updateUIFromSettings();
    },
    
    /**
     * 缓存DOM元素
     */
    cacheElements() {
        // Tab 相关
        this.elements.overviewTab = document.getElementById('v-pills-overview-tab');
        this.elements.indiensteinTab = document.getElementById('v-pills-indienstein-tab');
        this.elements.infospaceTab = document.getElementById('v-pills-infospace-tab');
        this.elements.formatToggleContainer = document.getElementById('formatToggleContainer');
        
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
        
        // 总览页面
        this.elements.providersContainer = document.getElementById('providersContainer');
        this.elements.infoSpaceOverview = document.getElementById('infoSpaceOverview');
        
        // Indienstein页面AI配置
        this.elements.providerSelect = document.getElementById('providerSelect');
        this.elements.modelSelect = document.getElementById('modelSelect');
        this.elements.temperatureInput = document.getElementById('temperatureInput');
        this.elements.temperatureValue = document.getElementById('temperatureValue');
        this.elements.maxTokensInput = document.getElementById('maxTokensInput');
        
        // 信息空间页面
        this.elements.dimensionsListInfo = document.getElementById('dimensionsListInfo');
        this.elements.dimensionDetailContent = document.getElementById('dimensionDetailContent');
        
        // 格式切换
        this.elements.formatToggle = document.getElementById('formatToggle');
        
        // 调试信息
        this.elements.debugInfo = document.getElementById('debugInfo');
        this.elements.clearDebugBtn = document.getElementById('clearDebugBtn');
    },
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // Tab 切换
        this.elements.indiensteinTab.addEventListener('shown.bs.tab', () => {
            this.elements.formatToggleContainer.style.display = 'block';
            this.loadIndiensteinSettings(); // 每次切换到Indienstein页面时重新加载设置
        });
        
        this.elements.overviewTab.addEventListener('shown.bs.tab', () => {
            this.elements.formatToggleContainer.style.display = 'none';
        });
        
        this.elements.infospaceTab.addEventListener('shown.bs.tab', () => {
            this.elements.formatToggleContainer.style.display = 'none';
        });
        
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
        
        // Indienstein页面AI配置设置（临时的，不保存）
        this.elements.providerSelect.addEventListener('change', () => {
            this.updateModelOptions();
            // 临时更新设置但不保存
            AIService.currentSettings.provider = this.elements.providerSelect.value;
            // 保持温度和令牌数的默认值
            AIService.resetTemperatureAndTokens();
            this.updateUIFromSettings();
        });
        this.elements.modelSelect.addEventListener('change', () => {
            AIService.currentSettings.model = this.elements.modelSelect.value;
            // 保持温度和令牌数的默认值
            AIService.resetTemperatureAndTokens();
            this.updateUIFromSettings();
        });
        this.elements.temperatureInput.addEventListener('input', () => {
            this.elements.temperatureValue.textContent = this.elements.temperatureInput.value;
            AIService.currentSettings.temperature = parseFloat(this.elements.temperatureInput.value);
        });
        this.elements.maxTokensInput.addEventListener('input', () => {
            AIService.currentSettings.maxTokens = parseInt(this.elements.maxTokensInput.value);
        });
        
        // 格式切换
        this.elements.formatToggle.addEventListener('change', () => this.toggleFormat());
        
        // 调试信息
        this.elements.clearDebugBtn.addEventListener('click', () => this.clearDebugInfo());
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
        
        // 记录生成开始
        this.addDebugInfo('开始生成灵感', 'log');
        this.logApiRequest({
            provider: AIService.currentSettings.provider,
            model: AIService.currentSettings.model,
            messageCount: 1
        });
        
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
                    this.addDebugInfo('灵感生成完成', 'log');
                },
                (error) => {
                    // 错误回调
                    this.elements.resultContent.classList.remove('generating');
                    this.elements.resultContent.innerHTML = `<div class="text-danger">生成失败: ${error}</div>`;
                    this.logApiError(error);
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
            this.logApiError(`生成异常: ${error.message}`);
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
            const defaultModel = AIService.providers[provider].defaultModel;
            modelSelect.value = defaultModel;
            AIService.currentSettings.model = defaultModel;
        }
    },
    
    /**
     * 保存设置（废弃 - 已由总览页面取代）
     */
    saveSettings() {
        // 这个函数已被总览页面的saveAllSettings替代
        console.warn('saveSettings 已废弃，请使用 saveAllSettings');
    },
    
    /**
     * 检查API设置
     * @returns {boolean} 是否设置有效
     */
    checkApiSettings() {
        const currentApiKey = AIService.getCurrentApiKey();
        if (!currentApiKey) {
            this.showMessage(`请先在总览页面设置 ${AIService.providers[AIService.currentSettings.provider].name} 的 API Key`, 'warning');
            
            // 切换到总览标签页
            const overviewTab = new bootstrap.Tab(this.elements.overviewTab);
            overviewTab.show();
            
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
    },
    
    /**
     * 设置总览页面
     */
    setupOverviewPage() {
        this.generateProvidersContainer();
        this.generateInfoSpaceOverview();
    },
    
    /**
     * 生成供应商容器
     */
    generateProvidersContainer() {
        const container = this.elements.providersContainer;
        const apiKeysStatus = AIService.getApiKeysStatus();
        
        container.innerHTML = '';
        
        Object.keys(apiKeysStatus).forEach(providerId => {
            const provider = apiKeysStatus[providerId];
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-3';
            
            col.innerHTML = `
                <div class="card h-100 provider-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${provider.name}</h6>
                        <span class="badge ${provider.hasApiKey ? 'bg-success' : 'bg-secondary'}">
                            ${provider.hasApiKey ? '已配置' : '未配置'}
                        </span>
                    </div>
                    <div class="card-body">
                                                 <div class="mb-2">
                             <label for="apiKey_${providerId}" class="form-label">API Key：</label>
                             <input type="password" class="form-control api-key-input" id="apiKey_${providerId}" 
                                    value="${provider.apiKey}" 
                                    placeholder="请输入 ${provider.name} 的 API Key">
                        </div>
                        <button type="button" class="btn btn-sm btn-primary w-100" onclick="UI.saveProviderApiKey('${providerId}')">
                            <i class="bi bi-save"></i> 保存
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
    },
    
    /**
     * 保存供应商API Key
     * @param {string} providerId 供应商ID
     */
    saveProviderApiKey(providerId) {
        const input = document.getElementById(`apiKey_${providerId}`);
        const apiKey = input.value.trim();
        
        AIService.updateApiKey(providerId, apiKey);
        this.generateProvidersContainer(); // 重新生成以更新状态
        this.showMessage(`${AIService.providers[providerId].name} API Key 已保存`, 'success');
    },
    
    /**
     * 生成信息空间概览
     */
    generateInfoSpaceOverview() {
        const container = this.elements.infoSpaceOverview;
        const dimensions = InfoSpace.getAllDimensions();
        
        // 计算统计数据
        const totalVectors = dimensions.reduce((sum, d) => sum + d.vectors.length, 0);
        const avgVectors = (totalVectors / dimensions.length).toFixed(1);
        
        container.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="text-center p-3 bg-light rounded">
                        <h3 class="text-primary mb-1">${dimensions.length}</h3>
                        <p class="mb-0 text-muted">信息维度</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center p-3 bg-light rounded">
                        <h3 class="text-success mb-1">${totalVectors}</h3>
                        <p class="mb-0 text-muted">信息向量</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center p-3 bg-light rounded">
                        <h3 class="text-info mb-1">${avgVectors}</h3>
                        <p class="mb-0 text-muted">平均向量数</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center p-3 bg-light rounded">
                        <h3 class="text-warning mb-1">${Math.pow(10, dimensions.length).toLocaleString()}</h3>
                        <p class="mb-0 text-muted">组合可能性</p>
                    </div>
                </div>
            </div>
            
            <div class="row">
                ${dimensions.map(dimension => `
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h6 class="card-title text-primary">${dimension.name}</h6>
                                <p class="card-text text-muted small">${dimension.description}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-primary">${dimension.vectors.length} 个向量</span>
                                    <button class="btn btn-outline-primary btn-sm" onclick="UI.switchToInfoSpace('${dimension.id}')">
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * 切换到信息空间页面并显示指定维度
     * @param {string} dimensionId 维度ID
     */
    switchToInfoSpace(dimensionId) {
        // 切换到信息空间标签页
        const infospaceTab = new bootstrap.Tab(this.elements.infospaceTab);
        infospaceTab.show();
        
        // 延迟一下以确保页面切换完成
        setTimeout(() => {
            this.showDimensionDetail(dimensionId);
        }, 100);
    },
    
    /**
     * 加载Indienstein页面设置（不保存的临时设置）
     */
    loadIndiensteinSettings() {
        const settings = AIService.currentSettings;
        
        this.elements.providerSelect.value = settings.provider;
        this.elements.temperatureInput.value = settings.temperature;
        this.elements.temperatureValue.textContent = settings.temperature;
        this.elements.maxTokensInput.value = settings.maxTokens;
        
        this.updateModelOptions();
    },
    
    /**
     * 从AIService设置更新UI界面
     */
    updateUIFromSettings() {
        const settings = AIService.currentSettings;
        
        this.elements.temperatureInput.value = settings.temperature;
        this.elements.temperatureValue.textContent = settings.temperature;
        this.elements.maxTokensInput.value = settings.maxTokens;
    },
    
    /**
     * 设置信息空间页面
     */
    setupInfoSpacePage() {
        this.generateDimensionsListInfo();
    },
    
    /**
     * 生成信息空间维度列表
     */
    generateDimensionsListInfo() {
        const container = this.elements.dimensionsListInfo;
        const dimensions = InfoSpace.getAllDimensions();
        
        container.innerHTML = '';
        
        dimensions.forEach(dimension => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action dimension-list-item';
            item.href = '#';
            item.dataset.dimensionId = dimension.id;
            
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${dimension.name}</h6>
                        <small class="text-muted">${dimension.description}</small>
                    </div>
                    <span class="badge bg-primary rounded-pill">${dimension.vectors.length}</span>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDimensionDetail(dimension.id);
            });
            
            container.appendChild(item);
        });
    },
    
    /**
     * 显示维度详情
     * @param {string} dimensionId 维度ID
     */
    showDimensionDetail(dimensionId) {
        const dimension = InfoSpace.getDimension(dimensionId);
        if (!dimension) return;
        
        // 更新选中状态
        const items = this.elements.dimensionsListInfo.querySelectorAll('.dimension-list-item');
        items.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.dimensionId === dimensionId) {
                item.classList.add('active');
            }
        });
        
        // 生成向量详情内容
        const content = this.elements.dimensionDetailContent;
        
        const vectorsHtml = dimension.vectors.map(vector => `
            <div class="vector-item">
                <div class="vector-name">${vector.name}</div>
                <div class="vector-description">${vector.description}</div>
            </div>
        `).join('');
        
        content.innerHTML = `
            <div class="mb-4">
                <h5 class="text-primary">${dimension.name}</h5>
                <p class="text-muted">${dimension.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${dimension.vectors.length} 个信息向量</span>
                    <small class="text-muted">权重: ${dimension.vectors[0]?.weight || 1}</small>
                </div>
            </div>
            
            <div class="vector-grid">
                ${vectorsHtml}
            </div>
        `;
    },
    
    /**
     * 添加调试信息
     * @param {string} message 调试信息
     * @param {string} type 信息类型 (log, warn, error)
     */
    addDebugInfo(message, type = 'log') {
        const timestamp = new Date().toLocaleTimeString();
        const colorClass = {
            'log': 'text-primary',
            'warn': 'text-warning', 
            'error': 'text-danger'
        }[type] || 'text-muted';
        
        const debugDiv = document.createElement('div');
        debugDiv.className = `debug-entry ${colorClass} mb-1`;
        debugDiv.innerHTML = `[${timestamp}] ${message}`;
        
        // 如果是第一条记录，清空默认文本
        if (this.elements.debugInfo.children.length === 1 && 
            this.elements.debugInfo.children[0].classList.contains('text-muted')) {
            this.elements.debugInfo.innerHTML = '';
        }
        
        this.elements.debugInfo.appendChild(debugDiv);
        
        // 自动滚动到底部
        this.elements.debugInfo.scrollTop = this.elements.debugInfo.scrollHeight;
        
        // 限制最大条目数
        while (this.elements.debugInfo.children.length > 100) {
            this.elements.debugInfo.removeChild(this.elements.debugInfo.firstChild);
        }
    },
    
    /**
     * 清空调试信息
     */
    clearDebugInfo() {
        this.elements.debugInfo.innerHTML = '<div class="text-muted">调试信息和错误日志会显示在这里...</div>';
    },
    
    /**
     * 记录API请求信息
     * @param {Object} requestInfo 请求信息
     */
    logApiRequest(requestInfo) {
        const message = `API请求 - ${requestInfo.provider} (${requestInfo.model}): ${requestInfo.messageCount}条消息`;
        this.addDebugInfo(message, 'log');
    },
    
    /**
     * 记录API错误
     * @param {string} error 错误信息
     */
    logApiError(error) {
        this.addDebugInfo(`API错误: ${error}`, 'error');
    }
}; 