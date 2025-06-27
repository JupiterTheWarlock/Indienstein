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
        selectedDimensions: [], // 存储选中的维度ID数组，可重复
        allGeneratedResults: [], // 存储所有生成的结果
        currentBatchIndex: -1
    },
    
    /**
     * 初始化UI
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupDimensionSelect();
        this.setupOverviewPage();
        this.loadIndiensteinSettings(); // 加载Indienstein页面的临时设置
        this.updateModelOptions(); // 初始化模型选项
        
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
        this.elements.formatToggleContainer = document.getElementById('formatToggleContainer');
        
        // 新的维度选择
        this.elements.dimensionSelect = document.getElementById('dimensionSelect');
        this.elements.addDimensionBtn = document.getElementById('addDimensionBtn');
        this.elements.selectedDimensionsContainer = document.getElementById('selectedDimensionsContainer');
        
        // 生成区域
        this.elements.generateBtn = document.getElementById('generateBtn');
        this.elements.userPrompt = document.getElementById('userPrompt');
        this.elements.resultContent = document.getElementById('resultContent');
        this.elements.exportBtn = document.getElementById('exportBtn');
        this.elements.clearResultBtn = document.getElementById('clearResultBtn');
        
        // 生成配置
        this.elements.batchCount = document.getElementById('batchCount');
        this.elements.batchDelay = document.getElementById('batchDelay');
        this.elements.batchProgress = document.getElementById('batchProgress');
        
        // 总览页面
        this.elements.providersContainer = document.getElementById('providersContainer');
        this.elements.infoSpaceOverview = document.getElementById('infoSpaceOverview');
        
        // Indienstein页面AI配置
        this.elements.providerSelect = document.getElementById('providerSelect');
        this.elements.modelSelect = document.getElementById('modelSelect');
        this.elements.temperatureInput = document.getElementById('temperatureInput');
        this.elements.temperatureValue = document.getElementById('temperatureValue');
        this.elements.maxTokensInput = document.getElementById('maxTokensInput');
        
        // 格式切换
        this.elements.formatToggle = document.getElementById('formatToggle');
        
        // 维度详情模态框
        this.elements.dimensionDetailModal = document.getElementById('dimensionDetailModal');
        this.elements.dimensionDetailModalContent = document.getElementById('dimensionDetailModalContent');
        
        // 检查关键元素是否存在
        const requiredElements = [
            'dimensionSelect', 'addDimensionBtn', 'selectedDimensionsContainer', 'generateBtn', 'resultContent', 'batchProgress',
            'providerSelect', 'modelSelect', 'temperatureInput', 'maxTokensInput'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                console.error(`关键DOM元素缺失: ${elementName}`);
                throw new Error(`缺少必需的DOM元素: ${elementName}`);
            }
        }
        
        console.log('UI: DOM元素缓存完成');
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
        
        // 维度选择
        this.elements.dimensionSelect.addEventListener('change', () => this.updateAddDimensionButton());
        this.elements.addDimensionBtn.addEventListener('click', () => this.addDimension());
        
        // 生成区域
        this.elements.generateBtn.addEventListener('click', () => this.generateInspiration());
        this.elements.exportBtn.addEventListener('click', () => this.exportAllResults());
        this.elements.clearResultBtn.addEventListener('click', () => this.clearResult());
        
        // 批量生成配置（现在作为生成参数）
        // 移除批量生成按钮事件，因为现在统一使用生成按钮
        
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
    },
    
    /**
     * 设置维度选择下拉框
     */
    setupDimensionSelect() {
        const dimensions = InfoSpace.getAllDimensions();
        const dimensionSelect = this.elements.dimensionSelect;
        
        // 清空并添加默认选项
        dimensionSelect.innerHTML = '<option value="">请选择维度...</option>';
        
        // 添加维度选项
        dimensions.forEach(dimension => {
            const option = document.createElement('option');
            option.value = dimension.id;
            option.textContent = `${dimension.name} (${dimension.vectors.length}个元素)`;
            dimensionSelect.appendChild(option);
        });
        
        console.log('UI: 维度选择下拉框设置完成');
    },
    
    /**
     * 更新添加维度按钮状态
     */
    updateAddDimensionButton() {
        const selectedValue = this.elements.dimensionSelect.value;
        this.elements.addDimensionBtn.disabled = !selectedValue;
    },
    
    /**
     * 添加维度
     */
    addDimension() {
        const selectedValue = this.elements.dimensionSelect.value;
        if (!selectedValue) return;
        
        const dimension = InfoSpace.getDimension(selectedValue);
        if (!dimension) return;
        
        // 添加到状态数组（允许重复）
        this.state.selectedDimensions.push(selectedValue);
        
        // 更新显示
        this.updateSelectedDimensionsDisplay();
        
        // 重置选择框
        this.elements.dimensionSelect.value = '';
        this.updateAddDimensionButton();
        
        console.log('已添加维度:', dimension.name, '当前选中维度:', this.state.selectedDimensions);
    },
    
    /**
     * 更新已选择维度的显示
     */
    updateSelectedDimensionsDisplay() {
        const container = this.elements.selectedDimensionsContainer;
        container.innerHTML = '';
        
        if (this.state.selectedDimensions.length === 0) {
            return;
        }
        
        // 统计每个维度的数量
        const dimensionCounts = {};
        this.state.selectedDimensions.forEach(dimensionId => {
            dimensionCounts[dimensionId] = (dimensionCounts[dimensionId] || 0) + 1;
        });
        
        // 显示维度标签
        Object.entries(dimensionCounts).forEach(([dimensionId, count]) => {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension) {
                const tag = document.createElement('div');
                tag.className = 'badge bg-primary me-2 mb-2 d-flex align-items-center';
                tag.style.fontSize = '0.9em';
                
                const countText = count > 1 ? ` (×${count})` : '';
                tag.innerHTML = `
                    ${dimension.name}${countText}
                    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" style="font-size: 0.7em;"></button>
                `;
                
                // 点击删除按钮时移除一个该维度
                const closeBtn = tag.querySelector('.btn-close');
                closeBtn.addEventListener('click', () => {
                    this.removeDimension(dimensionId);
                });
                
                container.appendChild(tag);
            }
        });
    },
    
    /**
     * 移除维度（移除一个实例）
     */
    removeDimension(dimensionId) {
        const index = this.state.selectedDimensions.indexOf(dimensionId);
        if (index > -1) {
            this.state.selectedDimensions.splice(index, 1);
            this.updateSelectedDimensionsDisplay();
            console.log('已移除维度:', dimensionId, '当前选中维度:', this.state.selectedDimensions);
        }
    },
    
    /**
     * 生成灵感（现在统一使用批量生成逻辑）
     */
    async generateInspiration() {
        if (this.state.isGenerating) return;
        
        // 检查API设置
        if (!this.checkApiSettings()) {
            return;
        }
        
        // 获取批量生成数量（默认为1）
        const count = parseInt(this.elements.batchCount.value) || 1;
        const delay = parseFloat(this.elements.batchDelay.value) || 1;
        const userPrompt = this.elements.userPrompt.value;
        
        this.state.isGenerating = true;
        this.elements.generateBtn.disabled = true;
        this.elements.generateBtn.innerHTML = '<span class="loading-spinner me-1"></span> 生成中...';
        
        // 显示进度条
        this.elements.batchProgress.classList.remove('d-none');
        this.elements.batchProgress.querySelector('.progress-bar').style.width = '0%';
        
        const config = {
            count: count,
            dimensionIds: this.state.selectedDimensions,
            userPrompt: userPrompt,
            delayBetweenRequests: delay
        };
        
        try {
            // 检查是否是第一次生成
            const isFirstGeneration = this.elements.resultContent.innerHTML.includes('生成的内容将显示在这里');
            if (isFirstGeneration) {
                this.elements.resultContent.innerHTML = '';
            }
            
            // 开始批量生成
            const results = await IndiensteinService.generateBatchInspiration(
                config,
                (index, content) => {
                    // 单项更新回调 - 实时显示在文本框中
                    if (index === 0 && this.elements.resultContent.innerHTML === '') {
                        // 第一个生成项的第一次内容
                        this.elements.resultContent.innerHTML = content;
                    } else {
                        this.elements.resultContent.innerHTML += content;
                    }
                    
                    // 自动滚动到底部
                    this.elements.resultContent.scrollTop = this.elements.resultContent.scrollHeight;
                },
                (index, result) => {
                    // 单项完成回调
                    console.log(`保存结果 ${index + 1}:`, result); // 调试信息
                    console.log(`内容长度: ${result.content?.length || 0}, 内容预览: ${result.content?.substring(0, 50) || '无内容'}...`); // 调试信息
                    this.state.allGeneratedResults.push(result);
                    
                    // 如果不是最后一个，添加分隔线
                    if (index < count - 1) {
                        this.elements.resultContent.innerHTML += '\n\n--- 下一个灵感 ---\n\n';
                    }
                    
                    this.elements.exportBtn.disabled = false;
                    this.addDebugInfo(`灵感 ${index + 1} 生成完成，内容长度: ${result.content?.length || 0}`, 'log');
                },
                (index, error) => {
                    // 单项错误回调
                    this.elements.resultContent.innerHTML += `\n\n❌ 生成失败: ${error}\n\n`;
                    this.logApiError(error);
                },
                (current, total) => {
                    // 进度回调
                    const progress = Math.round((current + 1) / total * 100);
                    this.elements.batchProgress.querySelector('.progress-bar').style.width = `${progress}%`;
                }
            );
            
            // 保存结果到本地存储
            if (results && results.length > 0) {
                StorageService.saveBatchInspirations(results);
            }
            
        } catch (error) {
            console.error('生成灵感失败:', error);
            this.elements.resultContent.innerHTML += `\n\n❌ 生成失败: ${error.message}\n\n`;
            this.logApiError(`生成异常: ${error.message}`);
        } finally {
            this.state.isGenerating = false;
            this.elements.generateBtn.disabled = false;
            this.elements.generateBtn.innerHTML = '<i class="bi bi-stars"></i> 生成灵感';
            this.updateGenerateButton();
            
            // 隐藏进度条
            setTimeout(() => {
                this.elements.batchProgress.classList.add('d-none');
            }, 1000);
        }
    },
    
    /**
     * 导出所有生成的结果
     */
    exportAllResults() {
        console.log('导出时的allGeneratedResults:', this.state.allGeneratedResults); // 调试信息
        
        if (!this.state.allGeneratedResults || this.state.allGeneratedResults.length === 0) {
            this.showMessage('没有可导出的内容', 'warning');
            return;
        }
        
        // 获取导出详情设置
        const exportDetail = document.getElementById('exportDetailCheckbox').checked;
        
        // 创建包含所有结果的导出内容
        let content = '';
        
        if (exportDetail) {
            // 导出详情模式 - 包含完整信息
            content = `# 游戏灵感集合\n\n`;
            content += `## 导出时间\n${new Date().toLocaleString()}\n\n`;
            content += `## 总共生成了 ${this.state.allGeneratedResults.length} 个灵感\n\n`;
            
            this.state.allGeneratedResults.forEach((result, index) => {
                console.log(`导出第 ${index + 1} 个结果:`, result); // 调试信息
                
                content += `---\n\n`;
                content += `### 灵感 ${index + 1}\n\n`;
                content += `**生成时间**: ${new Date(result.createdTime).toLocaleString()}\n\n`;
                
                content += `**选择的元素**:\n`;
                for (const [key, vector] of Object.entries(result.sourceVectors)) {
                    // 处理可能包含索引的维度键（如：theme_1）
                    const dimensionId = key.includes('_') ? key.split('_')[0] : key;
                    const dimension = InfoSpace.getDimension(dimensionId);
                    if (dimension) {
                        content += `- ${dimension.name}: ${vector.name}\n`;
                        if (vector.description) {
                            content += `  ${vector.description}\n`;
                        }
                    }
                }
                content += '\n';
                
                if (result.userPrompt) {
                    content += `**用户提示**: ${result.userPrompt}\n\n`;
                }
                
                content += `**灵感内容**:\n${result.content || '内容为空'}\n\n`;
            });
        } else {
            // 仅导出灵感模式 - 只包含灵感内容
            content = `# 游戏灵感集合\n\n`;
            
            this.state.allGeneratedResults.forEach((result, index) => {
                content += `## 灵感 ${index + 1}\n\n`;
                content += `${result.content || '内容为空'}\n\n`;
                if (index < this.state.allGeneratedResults.length - 1) {
                    content += `---\n\n`;
                }
            });
        }
        
        console.log('最终导出内容:', content); // 调试信息
        
        // 导出文件
        const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        const fileName = exportDetail ? 
            `游戏灵感集合_详情_${new Date().toISOString().slice(0, 10)}.txt` : 
            `游戏灵感集合_${new Date().toISOString().slice(0, 10)}.txt`;
        exportLink.setAttribute('download', fileName);
        exportLink.click();
        
        const exportType = exportDetail ? '详细' : '简化';
        this.showMessage(`已导出 ${this.state.allGeneratedResults.length} 个灵感（${exportType}模式）`, 'success');
    },
    
    /**
     * 清空生成结果
     */
    clearResult() {
        this.elements.resultContent.innerHTML = '<div class="text-center text-muted">生成的内容将显示在这里</div>';
        this.elements.exportBtn.disabled = true;
        this.state.allGeneratedResults = []; // 清空所有结果
        this.showMessage('已清空生成历史', 'success');
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
        
        // 供应商网页链接映射
        const providerWebsites = {
            'siliconflow': 'https://account.siliconflow.cn/',
            'deepseek': 'https://www.deepseek.com/',
            'zhipu': 'https://chatglm.cn/'
        };
        
        container.innerHTML = '';
        
        Object.keys(apiKeysStatus).forEach(providerId => {
            const provider = apiKeysStatus[providerId];
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-3';
            
            // 获取供应商网站链接
            const websiteUrl = providerWebsites[providerId];
            const providerNameElement = websiteUrl ? 
                `<a href="${websiteUrl}" target="_blank" class="text-decoration-none text-primary fw-bold" title="点击访问 ${provider.name} 官网">
                    ${provider.name} <i class="bi bi-box-arrow-up-right small"></i>
                </a>` : 
                `<span class="fw-bold">${provider.name}</span>`;
            
            col.innerHTML = `
                <div class="card h-100 provider-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${providerNameElement}</h6>
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
     * 生成信息空间概览
     */
    generateInfoSpaceOverview() {
        const container = this.elements.infoSpaceOverview;
        const dimensions = InfoSpace.getAllDimensions();
        
        if (!container) return;
        
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
                        <div class="card h-100 dimension-card" style="cursor: pointer;" onclick="UI.showDimensionDetailModal('${dimension.id}')">
                            <div class="card-body">
                                <h6 class="card-title text-primary">${dimension.name}</h6>
                                <p class="card-text text-muted small">${dimension.description}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-primary">${dimension.vectors.length} 个向量</span>
                                    <span class="text-muted small">点击查看详情</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * 显示维度详情模态框
     * @param {string} dimensionId 维度ID
     */
    showDimensionDetailModal(dimensionId) {
        const dimension = InfoSpace.getDimension(dimensionId);
        if (!dimension) return;
        
        // 设置模态框标题
        document.getElementById('dimensionDetailModalLabel').textContent = `维度详情 - ${dimension.name}`;
        
        // 生成向量详情内容
        const vectorsHtml = dimension.vectors.map((vector, index) => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title text-primary mb-1">${vector.name}</h6>
                            <p class="card-text text-muted small mb-0">${vector.description}</p>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-secondary">权重: ${vector.weight || 1}</span>
                            <small class="text-muted d-block mt-1">#${index + 1}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.elements.dimensionDetailModalContent.innerHTML = `
            <div class="mb-4">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="text-primary mb-2">${dimension.name}</h5>
                        <p class="text-muted mb-3">${dimension.description}</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="bg-light p-3 rounded">
                            <h4 class="text-success mb-1">${dimension.vectors.length}</h4>
                            <small class="text-muted">个信息向量</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <h6 class="text-secondary mb-3">
                    <i class="bi bi-list-ul"></i> 所有信息向量
                </h6>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${vectorsHtml}
                </div>
            </div>
        `;
        
        // 显示模态框
        const modal = new bootstrap.Modal(this.elements.dimensionDetailModal);
        modal.show();
    },
    
    /**
     * 添加调试信息
     * @param {string} message 调试信息
     * @param {string} type 信息类型 (log, warn, error)
     */
    addDebugInfo(message, type = 'log') {
        // 调试信息已移除，保留方法签名避免错误
        console.log(`[${type.toUpperCase()}] ${message}`);
    },
    
    /**
     * 清空调试信息
     */
    clearDebugInfo() {
        // 调试信息已移除，保留方法签名避免错误
        console.clear();
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
    }
}; 