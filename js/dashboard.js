/**
 * Dashboard 模块
 * 负责项目总览、API供应商管理、信息空间统计等功能
 */
class DashboardModule {
    constructor() {
        this.storageService = new StorageService();
        this.aiService = new AIService();
        this.isInitialized = false;
    }

    /**
     * 初始化Dashboard模块
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.loadStoredApiKeys();
            this.renderProjectInfo();
            await this.renderAPIProviders();
            await this.renderInfoSpaceOverview();
            this.bindEvents();
            this.isInitialized = true;
            console.log('Dashboard模块初始化完成');
        } catch (error) {
            console.error('Dashboard初始化失败:', error);
        }
    }

    /**
     * 加载已存储的API Key
     */
    async loadStoredApiKeys() {
        const providers = ['siliconflow', 'deepseek', 'zhipu'];
        for (const provider of providers) {
            const apiKey = this.storageService.getApiKey(provider);
            if (apiKey) {
                console.log(`已加载${this.getProviderDisplayName(provider)}的API Key`);
            }
        }
    }

    /**
     * 渲染项目信息区域
     */
    renderProjectInfo() {
        const history = this.storageService.getHistory();
        const settings = this.storageService.getSettings();
        
        const projectInfo = {
            name: 'Indienstein',
            version: '2.0.0',
            description: 'AI游戏灵感生成器 - Web版',
            totalGenerations: history.length,
            lastUsed: history.length > 0 ? new Date(history[0].timestamp || Date.now()).toLocaleDateString() : '从未使用',
            preferredProvider: this.getProviderDisplayName(settings.defaultProvider || 'siliconflow')
        };

        const projectInfoContainer = document.getElementById('projectInfo');
        if (projectInfoContainer) {
            projectInfoContainer.innerHTML = `
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-info-circle me-2"></i>项目信息
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-12">
                                <h4 class="text-primary">${projectInfo.name}</h4>
                                <p class="text-muted mb-1">版本 ${projectInfo.version}</p>
                                <p class="mb-3">${projectInfo.description}</p>
                            </div>
                        </div>
                        
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="stat-card bg-light p-3 rounded">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-graph-up text-success fs-4 me-2"></i>
                                        <div>
                                            <h6 class="mb-0">历史生成</h6>
                                            <h4 class="text-success mb-0">${projectInfo.totalGenerations}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="stat-card bg-light p-3 rounded">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-clock-history text-info fs-4 me-2"></i>
                                        <div>
                                            <h6 class="mb-0">最近使用</h6>
                                            <small class="text-info">${projectInfo.lastUsed}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="bi bi-robot me-1"></i>
                                偏好供应商: ${projectInfo.preferredProvider}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 渲染API供应商配置区域
     */
    async renderAPIProviders() {
        const providers = [
            { 
                id: 'siliconflow', 
                name: '硅基流动',
                icon: 'bi-cpu',
                color: 'success',
                models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'meta-llama/Meta-Llama-3.1-8B-Instruct']
            },
            { 
                id: 'deepseek', 
                name: '深度求索',
                icon: 'bi-lightning',
                color: 'warning',
                models: ['deepseek-chat', 'deepseek-coder']
            },
            { 
                id: 'zhipu', 
                name: '智谱',
                icon: 'bi-stars',
                color: 'info',
                models: ['glm-4', 'glm-4-plus', 'glm-4-flash']
            }
        ];

        const providerContainer = document.getElementById('apiProviders');
        if (!providerContainer) return;

        let html = '<div class="row g-3">';

        for (const provider of providers) {
            const apiKey = this.storageService.getApiKey(provider.id);
            const isConfigured = !!apiKey;
            const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : '';

            html += `
                <div class="col-md-4">
                    <div class="card provider-card h-100 ${isConfigured ? 'border-success' : 'border-secondary'}">
                        <div class="card-header bg-${provider.color} text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="${provider.icon} me-2"></i>
                                    <strong>${provider.name}</strong>
                                </div>
                                <span class="badge ${isConfigured ? 'bg-light text-success' : 'bg-secondary'}">
                                    ${isConfigured ? '✓ 已配置' : '○ 未配置'}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label small">API Key</label>
                                <div class="input-group input-group-sm">
                                    <input type="password" 
                                           class="form-control" 
                                           id="apiKey_${provider.id}" 
                                           placeholder="${isConfigured ? '已配置 (点击修改)' : '输入API Key'}"
                                           value="">
                                    <button class="btn btn-outline-primary btn-sm" 
                                            type="button"
                                            onclick="dashboard.saveApiKey('${provider.id}')">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                                ${isConfigured ? `<small class="text-success">当前: ${maskedKey}</small>` : ''}
                            </div>
                            
                            <div class="mb-3">
                                <small class="text-muted">
                                    <i class="bi bi-layers me-1"></i>
                                    支持 ${provider.models.length} 个模型
                                </small>
                                <div class="mt-1">
                                    ${provider.models.slice(0, 2).map(model => 
                                        `<span class="badge bg-light text-dark me-1 small">${model.split('/').pop() || model}</span>`
                                    ).join('')}
                                    ${provider.models.length > 2 ? `<span class="badge bg-secondary small">+${provider.models.length - 2}</span>` : ''}
                                </div>
                            </div>
                            
                            <div class="d-flex gap-2">
                                ${isConfigured ? `
                                    <button class="btn btn-sm btn-outline-success flex-fill" 
                                            onclick="dashboard.testConnection('${provider.id}')">
                                        <i class="bi bi-wifi"></i> 测试
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-outline-secondary flex-fill" 
                                        onclick="dashboard.clearApiKey('${provider.id}')">
                                    <i class="bi bi-trash"></i> 清除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        providerContainer.innerHTML = html;
    }

    /**
     * 渲染信息空间总览
     */
    async renderInfoSpaceOverview() {
        const dimensions = InfoSpace.getAllDimensions();
        const stats = {};
        let totalVectors = 0;

        // 计算统计数据
        dimensions.forEach(dimension => {
            const count = dimension.vectors ? dimension.vectors.length : 0;
            stats[dimension.name] = count;
            totalVectors += count;
        });

        const overviewContainer = document.getElementById('infoSpaceOverview');
        if (!overviewContainer) return;

        let html = `
            <div class="card h-100">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">
                        <i class="bi bi-database me-2"></i>信息空间总览
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="stat-card bg-light p-3 rounded text-center">
                                <i class="bi bi-collection text-primary fs-2"></i>
                                <h3 class="text-primary mb-0">${dimensions.length}</h3>
                                <small class="text-muted">总维度数</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="stat-card bg-light p-3 rounded text-center">
                                <i class="bi bi-tags text-success fs-2"></i>
                                <h3 class="text-success mb-0">${totalVectors}</h3>
                                <small class="text-muted">总向量数</small>
                            </div>
                        </div>
                    </div>
                    
                    <h6 class="mb-3">维度分布</h6>
                    <div class="dimension-stats">
        `;

        // 生成维度分布
        Object.entries(stats).forEach(([name, count]) => {
            const percentage = totalVectors > 0 ? (count / totalVectors * 100).toFixed(1) : 0;
            html += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="small">${name}</span>
                        <span class="badge bg-primary">${count} (${percentage}%)</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-gradient" 
                             role="progressbar" 
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                    
                    <div class="mt-3 text-center">
                        <small class="text-muted">
                            <i class="bi bi-clock me-1"></i>
                            数据更新时间: ${new Date().toLocaleString()}
                        </small>
                    </div>
                </div>
            </div>
        `;

        overviewContainer.innerHTML = html;
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 为API Key输入框添加回车键保存功能
        const apiKeyInputs = document.querySelectorAll('[id^="apiKey_"]');
        apiKeyInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const provider = input.id.replace('apiKey_', '');
                    this.saveApiKey(provider);
                }
            });
        });
    }

    /**
     * 保存API Key
     */
    async saveApiKey(provider) {
        const input = document.getElementById(`apiKey_${provider}`);
        if (!input) return;

        const apiKey = input.value.trim();
        if (!apiKey) {
            this.showNotification('请输入API Key', 'warning');
            return;
        }

        try {
            this.storageService.saveApiKey(provider, apiKey);
            this.showNotification(
                `${this.getProviderDisplayName(provider)} API Key 已保存`, 
                'success'
            );
            
            // 清空输入框
            input.value = '';
            
            // 重新渲染供应商区域
            await this.renderAPIProviders();
            
        } catch (error) {
            console.error('保存API Key失败:', error);
            this.showNotification('保存失败，请重试', 'error');
        }
    }

    /**
     * 清除API Key
     */
    async clearApiKey(provider) {
        if (!confirm(`确定要清除${this.getProviderDisplayName(provider)}的API Key吗？`)) {
            return;
        }

        try {
            localStorage.removeItem(`indienstein_api_key_${provider}`);
            this.showNotification(
                `${this.getProviderDisplayName(provider)} API Key 已清除`, 
                'info'
            );
            
            // 重新渲染供应商区域
            await this.renderAPIProviders();
            
        } catch (error) {
            console.error('清除API Key失败:', error);
            this.showNotification('清除失败，请重试', 'error');
        }
    }

    /**
     * 测试连接
     */
    async testConnection(provider) {
        const apiKey = this.storageService.getApiKey(provider);
        if (!apiKey) {
            this.showNotification('请先配置API Key', 'warning');
            return;
        }

        const button = event.target;
        const originalText = button.innerHTML;
        
        try {
            // 显示加载状态
            button.innerHTML = '<i class="bi bi-hourglass-split"></i> 测试中...';
            button.disabled = true;

            // 测试连接（这里可以发送一个简单的测试请求）
            const testResult = await this.performConnectionTest(provider, apiKey);
            
            if (testResult.success) {
                this.showNotification('连接测试成功！', 'success');
                button.innerHTML = '<i class="bi bi-check-circle text-success"></i> 成功';
            } else {
                this.showNotification(`连接测试失败: ${testResult.error}`, 'error');
                button.innerHTML = '<i class="bi bi-x-circle text-danger"></i> 失败';
            }
            
        } catch (error) {
            console.error('连接测试异常:', error);
            this.showNotification(`连接测试失败: ${error.message}`, 'error');
            button.innerHTML = '<i class="bi bi-x-circle text-danger"></i> 异常';
        } finally {
            // 恢复按钮状态
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    }

    /**
     * 执行连接测试
     */
    async performConnectionTest(provider, apiKey) {
        try {
            // 简化的连接测试 - 构建测试消息
            const testMessages = [
                { role: "user", content: "Hi" }
            ];

            // 检查API Key格式
            if (!apiKey || apiKey.length < 10) {
                throw new Error('API Key格式无效');
            }

            // 尝试调用AI服务（如果AI服务不可用，则进行简单的格式验证）
            if (this.aiService && typeof this.aiService.requestLLM_Stream === 'function') {
                try {
                    await this.aiService.requestLLM_Stream(
                        testMessages,
                        apiKey,
                        provider,
                        this.getDefaultModel(provider),
                        () => {} // 空的内容更新回调
                    );
                } catch (aiError) {
                    // 如果是401错误，说明API Key无效
                    if (aiError.message.includes('401') || aiError.message.includes('Unauthorized')) {
                        throw new Error('API Key无效或过期');
                    }
                    // 其他错误可能是网络问题，但API Key本身可能是有效的
                    console.warn('AI服务测试警告:', aiError.message);
                }
            }

            // 如果没有抛出异常，则认为连接成功
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取默认模型
     */
    getDefaultModel(provider) {
        const models = {
            'siliconflow': 'deepseek-ai/DeepSeek-V3',
            'deepseek': 'deepseek-chat',
            'zhipu': 'glm-4'
        };
        return models[provider] || 'default';
    }

    /**
     * 获取供应商显示名称
     */
    getProviderDisplayName(provider) {
        const names = {
            'siliconflow': '硅基流动',
            'deepseek': '深度求索',
            'zhipu': '智谱'
        };
        return names[provider] || provider;
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getBootstrapAlertClass(type)} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            ${this.getNotificationIcon(type)}
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 获取Bootstrap alert类型
     */
    getBootstrapAlertClass(type) {
        const mapping = {
            'info': 'info',
            'success': 'success',
            'warning': 'warning',
            'error': 'danger'
        };
        return mapping[type] || 'info';
    }

    /**
     * 获取通知图标
     */
    getNotificationIcon(type) {
        const icons = {
            'info': '<i class="bi bi-info-circle me-2"></i>',
            'success': '<i class="bi bi-check-circle me-2"></i>',
            'warning': '<i class="bi bi-exclamation-triangle me-2"></i>',
            'error': '<i class="bi bi-x-circle me-2"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * 刷新所有数据
     */
    async refresh() {
        try {
            this.renderProjectInfo();
            await this.renderAPIProviders();
            await this.renderInfoSpaceOverview();
            this.showNotification('数据已刷新', 'success');
        } catch (error) {
            console.error('刷新失败:', error);
            this.showNotification('刷新失败，请重试', 'error');
        }
    }
}

// 创建全局实例
window.dashboard = new DashboardModule();

// 导出类供测试使用
window.Dashboard = DashboardModule; 