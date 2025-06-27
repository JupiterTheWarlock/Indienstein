/**
 * Tab管理器
 * 负责Tab切换、模块初始化和模块间通信
 */
class TabManager {
    constructor() {
        this.activeTab = 'dashboard';
        this.modules = {};
        this.eventBus = new EventBus();
        this.isInitialized = false;
        
        // 配置Tab信息
        this.tabConfig = {
            dashboard: {
                id: 'dashboard',
                name: 'Dashboard',
                icon: 'bi-speedometer2',
                module: null, // 将在初始化时设置
                contentId: 'dashboard-content',
                tabId: 'dashboard-tab'
            },
            indienstein: {
                id: 'indienstein',
                name: 'Indienstein',
                icon: 'bi-stars',
                module: null,
                contentId: 'indienstein-content',
                tabId: 'indienstein-tab'
            },
            infospace: {
                id: 'infospace',
                name: '信息空间',
                icon: 'bi-database',
                module: null,
                contentId: 'infospace-content',
                tabId: 'infospace-tab'
            }
        };
    }

    /**
     * 初始化Tab管理器
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('初始化Tab管理器...');
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // 初始化模块
            await this.initializeModules();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化当前活动Tab
            await this.initializeActiveTab();
            
            // 加载用户偏好设置
            this.loadUserPreferences();
            
            this.isInitialized = true;
            console.log('Tab管理器初始化完成');
            
            // 发送初始化完成事件
            this.eventBus.emit('tabManager:initialized');

        } catch (error) {
            console.error('Tab管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化所有模块
     */
    async initializeModules() {
        try {
            // 初始化Dashboard模块
            if (typeof DashboardModule !== 'undefined') {
                this.modules.dashboard = new DashboardModule();
                this.tabConfig.dashboard.module = this.modules.dashboard;
                console.log('Dashboard模块已创建');
            }

            // 初始化信息空间模块
            if (typeof InfoSpaceModule !== 'undefined') {
                this.modules.infospace = new InfoSpaceModule();
                this.tabConfig.infospace.module = this.modules.infospace;
                console.log('信息空间模块已创建');
            }

            // 初始化Indienstein模块（使用现有的UI模块）
            if (typeof UIManager !== 'undefined') {
                this.modules.indienstein = window.ui; // 使用全局UI实例
                this.tabConfig.indienstein.module = this.modules.indienstein;
                console.log('Indienstein模块已关联');
            }

            console.log('所有模块创建完成');
        } catch (error) {
            console.error('模块初始化失败:', error);
            throw error;
        }
    }

    /**
     * 切换Tab
     */
    async switchTab(tabName) {
        if (!this.tabConfig[tabName]) {
            console.error(`未知的Tab: ${tabName}`);
            return;
        }

        if (this.activeTab === tabName) {
            console.log(`Tab ${tabName} 已经是活动状态`);
            return;
        }

        try {
            console.log(`切换到Tab: ${tabName}`);
            
            // 发送Tab切换前事件
            this.eventBus.emit('tabManager:beforeTabSwitch', {
                from: this.activeTab,
                to: tabName
            });

            // 停用当前Tab
            await this.deactivateTab(this.activeTab);

            // 激活新Tab
            await this.activateTab(tabName);

            // 更新活动Tab
            this.activeTab = tabName;

            // 保存用户偏好
            this.saveUserPreferences();

            // 发送Tab切换后事件
            this.eventBus.emit('tabManager:afterTabSwitch', {
                from: this.activeTab,
                to: tabName,
                activeTab: this.activeTab
            });

            console.log(`Tab切换完成: ${tabName}`);

        } catch (error) {
            console.error(`Tab切换失败: ${tabName}`, error);
        }
    }

    /**
     * 激活Tab
     */
    async activateTab(tabName) {
        const config = this.tabConfig[tabName];
        if (!config) return;

        try {
            // 更新Tab按钮状态
            this.updateTabButtonState(tabName);

            // 显示对应内容
            this.showTabContent(tabName);

            // 初始化模块（如果需要）
            if (config.module && typeof config.module.initialize === 'function') {
                await config.module.initialize();
            }

            // 发送Tab激活事件
            this.eventBus.emit('tab:activated', { tabName, config });

        } catch (error) {
            console.error(`激活Tab失败: ${tabName}`, error);
        }
    }

    /**
     * 停用Tab
     */
    async deactivateTab(tabName) {
        const config = this.tabConfig[tabName];
        if (!config) return;

        try {
            // 发送Tab停用事件
            this.eventBus.emit('tab:deactivated', { tabName, config });

            // 可以在这里添加清理逻辑

        } catch (error) {
            console.error(`停用Tab失败: ${tabName}`, error);
        }
    }

    /**
     * 初始化当前活动Tab
     */
    async initializeActiveTab() {
        // 激活默认Tab（Dashboard）
        await this.activateTab(this.activeTab);
    }

    /**
     * 更新Tab按钮状态
     */
    updateTabButtonState(activeTabName) {
        Object.keys(this.tabConfig).forEach(tabName => {
            const tabButton = document.getElementById(this.tabConfig[tabName].tabId);
            if (tabButton) {
                if (tabName === activeTabName) {
                    tabButton.classList.add('active');
                    tabButton.setAttribute('aria-selected', 'true');
                } else {
                    tabButton.classList.remove('active');
                    tabButton.setAttribute('aria-selected', 'false');
                }
            }
        });
    }

    /**
     * 显示Tab内容
     */
    showTabContent(activeTabName) {
        Object.keys(this.tabConfig).forEach(tabName => {
            const tabContent = document.getElementById(this.tabConfig[tabName].contentId);
            if (tabContent) {
                if (tabName === activeTabName) {
                    tabContent.classList.add('show', 'active');
                } else {
                    tabContent.classList.remove('show', 'active');
                }
            }
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 绑定键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl + 1/2/3 切换Tab
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('indienstein');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('infospace');
                        break;
                }
            }
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            const hash = window.location.hash.substring(1);
            if (hash && this.tabConfig[hash]) {
                this.switchTab(hash);
            }
        });

        console.log('Tab管理器事件已绑定');
    }

    /**
     * 显示快速设置
     */
    showQuickSettings() {
        const modal = document.getElementById('quickSettingsModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // 加载当前设置
            this.loadQuickSettings();
        }
    }

    /**
     * 加载快速设置
     */
    loadQuickSettings() {
        try {
            const storageService = new StorageService();
            const settings = storageService.getSettings();

            // 设置供应商选择
            const providerSelect = document.getElementById('providerSelect');
            if (providerSelect && settings.defaultProvider) {
                providerSelect.value = settings.defaultProvider;
            }

            // 设置模型选择
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect && settings.defaultModel) {
                this.updateModelOptions(settings.defaultProvider);
                modelSelect.value = settings.defaultModel;
            }

            // 不显示API Key（安全考虑）
            
        } catch (error) {
            console.error('加载快速设置失败:', error);
        }
    }

    /**
     * 更新模型选项
     */
    updateModelOptions(provider) {
        const modelSelect = document.getElementById('modelSelect');
        if (!modelSelect) return;

        const models = {
            'siliconflow': [
                { value: 'deepseek-ai/DeepSeek-V3', text: 'DeepSeek-V3' },
                { value: 'Qwen/Qwen2.5-72B-Instruct', text: 'Qwen2.5-72B' },
                { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct', text: 'Llama-3.1-8B' }
            ],
            'deepseek': [
                { value: 'deepseek-chat', text: 'DeepSeek Chat' },
                { value: 'deepseek-coder', text: 'DeepSeek Coder' }
            ],
            'zhipu': [
                { value: 'glm-4', text: 'GLM-4' },
                { value: 'glm-4-plus', text: 'GLM-4 Plus' },
                { value: 'glm-4-flash', text: 'GLM-4 Flash' }
            ]
        };

        modelSelect.innerHTML = '';
        
        if (models[provider]) {
            models[provider].forEach(model => {
                const option = document.createElement('option');
                option.value = model.value;
                option.textContent = model.text;
                modelSelect.appendChild(option);
            });
        }
    }

    /**
     * 保存快速设置
     */
    saveQuickSettings() {
        try {
            const providerSelect = document.getElementById('providerSelect');
            const modelSelect = document.getElementById('modelSelect');
            const apiKeyInput = document.getElementById('apiKeyInput');

            if (!providerSelect || !modelSelect) return;

            const storageService = new StorageService();
            
            // 保存供应商和模型设置
            const settings = storageService.getSettings();
            settings.defaultProvider = providerSelect.value;
            settings.defaultModel = modelSelect.value;
            storageService.saveSettings(settings);

            // 保存API Key（如果提供）
            if (apiKeyInput && apiKeyInput.value.trim()) {
                storageService.saveApiKey(providerSelect.value, apiKeyInput.value.trim());
                apiKeyInput.value = ''; // 清空输入框
            }

            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickSettingsModal'));
            if (modal) {
                modal.hide();
            }

            // 显示成功消息
            this.showNotification('设置已保存', 'success');

            // 刷新Dashboard（如果当前在Dashboard）
            if (this.activeTab === 'dashboard' && this.modules.dashboard) {
                this.modules.dashboard.refresh();
            }

        } catch (error) {
            console.error('保存快速设置失败:', error);
            this.showNotification('设置保存失败', 'error');
        }
    }

    /**
     * 显示帮助
     */
    showHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // 加载帮助内容
            this.loadHelpContent();
        }
    }

    /**
     * 加载帮助内容
     */
    loadHelpContent() {
        const helpContent = document.getElementById('helpContent');
        if (!helpContent) return;

        helpContent.innerHTML = `
            <div class="accordion" id="helpAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help1">
                            如何开始使用？
                        </button>
                    </h2>
                    <div id="help1" class="accordion-collapse collapse show" data-bs-parent="#helpAccordion">
                        <div class="accordion-body">
                            <ol>
                                <li>进入<strong>Dashboard</strong>页面配置API Key</li>
                                <li>选择AI供应商（硅基流动、深度求索或智谱）</li>
                                <li>测试连接确保配置正确</li>
                                <li>切换到<strong>Indienstein</strong>页面开始生成灵感</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help2">
                            键盘快捷键
                        </button>
                    </h2>
                    <div id="help2" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                        <div class="accordion-body">
                            <ul>
                                <li><kbd>Ctrl + 1</kbd> - 切换到Dashboard</li>
                                <li><kbd>Ctrl + 2</kbd> - 切换到Indienstein</li>
                                <li><kbd>Ctrl + 3</kbd> - 切换到信息空间</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help3">
                            常见问题
                        </button>
                    </h2>
                    <div id="help3" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                        <div class="accordion-body">
                            <p><strong>Q: API Key如何获取？</strong></p>
                            <p>A: 请访问对应供应商官网注册账号并获取API Key。</p>
                            
                            <p><strong>Q: 生成失败怎么办？</strong></p>
                            <p>A: 检查网络连接、API Key是否正确、供应商服务是否正常。</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 显示关于
     */
    showAbout() {
        const modal = document.getElementById('aboutModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // 加载关于内容
            this.loadAboutContent();
        }
    }

    /**
     * 加载关于内容
     */
    loadAboutContent() {
        const aboutContent = document.getElementById('aboutContent');
        if (!aboutContent) return;

        aboutContent.innerHTML = `
            <div class="text-center">
                <p class="lead">基于多维度向量组合的AI游戏创意生成工具</p>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h6>✨ 主要特色</h6>
                        <ul class="list-unstyled text-start">
                            <li>🎯 三合一Tab界面</li>
                            <li>🤖 三大AI供应商支持</li>
                            <li>🎲 智能随机选择</li>
                            <li>⚡ 实时流式生成</li>
                            <li>💾 本地数据持久化</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>🛠️ 技术栈</h6>
                        <ul class="list-unstyled text-start">
                            <li>前端：原生JavaScript</li>
                            <li>UI：Bootstrap 5</li>
                            <li>图标：Bootstrap Icons</li>
                            <li>存储：localStorage</li>
                            <li>网络：Fetch API</li>
                        </ul>
                    </div>
                </div>
                
                <hr class="my-4">
                
                <p class="small text-muted">
                    Copyright © 2025 JtheWL. All rights reserved.<br>
                    基于MIT许可证开源
                </p>
            </div>
        `;
    }

    /**
     * 保存用户偏好
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('indienstein_active_tab', this.activeTab);
        } catch (error) {
            console.error('保存用户偏好失败:', error);
        }
    }

    /**
     * 加载用户偏好
     */
    loadUserPreferences() {
        try {
            const savedTab = localStorage.getItem('indienstein_active_tab');
            if (savedTab && this.tabConfig[savedTab]) {
                this.switchTab(savedTab);
            }
        } catch (error) {
            console.error('加载用户偏好失败:', error);
        }
    }

    /**
     * 获取当前活动Tab
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * 获取模块实例
     */
    getModule(tabName) {
        return this.modules[tabName] || null;
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getBootstrapAlertClass(type)} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 80px;
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
        }, 4000);

        console.log(`[TAB_MANAGER ${type.toUpperCase()}] ${message}`);
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
}

/**
 * 事件总线 - 用于模块间通信
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 监听事件
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * 移除事件监听
     */
    off(event, callback) {
        if (!this.events[event]) return;
        
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * 触发事件
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件处理器出错 [${event}]:`, error);
                }
            });
        }
    }

    /**
     * 清除所有事件监听
     */
    clear() {
        this.events = {};
    }
}

// 创建全局Tab管理器实例
window.tabManager = new TabManager();

// 绑定全局方法供HTML调用
window.tabManager.saveQuickSettings = function() {
    window.tabManager.saveQuickSettings();
};

// 供应商选择变化时更新模型选项
document.addEventListener('DOMContentLoaded', () => {
    const providerSelect = document.getElementById('providerSelect');
    if (providerSelect) {
        providerSelect.addEventListener('change', (e) => {
            window.tabManager.updateModelOptions(e.target.value);
        });
    }
}); 