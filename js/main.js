/**
 * Main.js v2.0 - 应用入口文件
 * 负责初始化和启动Tab布局应用
 */

// 全局变量声明
let app = null;

/**
 * 应用主类
 */
class App {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.storageService = null;
        this.version = '2.0.0';
    }

    /**
     * 应用初始化
     */
    async init() {
        if (this.isInitialized) {
            console.log('应用已经初始化');
            return;
        }

        try {
            console.log(`%c🚀 Indienstein v${this.version} 启动中...`, 'color: #6f42c1; font-size: 16px; font-weight: bold;');
            
            // 1. 初始化存储服务
            await this.initializeStorage();
            
            // 2. 初始化基础服务
            await this.initializeServices();
            
            // 3. 初始化Tab管理器
            await this.initializeTabManager();
            
            // 4. 绑定全局事件
            this.bindGlobalEvents();
            
            // 5. 启动完成
            this.isInitialized = true;
            
            console.log(`%c✅ Indienstein v${this.version} 初始化完成！`, 'color: #28a745; font-size: 14px; font-weight: bold;');
            
            // 显示启动成功通知
            this.showStartupNotification();
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showError('应用初始化失败', error.message);
            throw error;
        }
    }

    /**
     * 初始化存储服务
     */
    async initializeStorage() {
        try {
            console.log('📦 初始化存储服务...');
            
            // 初始化存储服务
            if (typeof StorageService !== 'undefined') {
                this.storageService = new StorageService();
                this.modules.storage = this.storageService;
                console.log('✓ 存储服务初始化完成');
            } else {
                console.warn('⚠️ StorageService 未找到');
            }
            
        } catch (error) {
            console.error('存储服务初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化基础服务
     */
    async initializeServices() {
        try {
            console.log('🔧 初始化基础服务...');
            
            // 初始化信息空间
            if (typeof InfoSpace !== 'undefined') {
                await InfoSpace.init();
                this.modules.infoSpace = InfoSpace;
                console.log('✓ 信息空间服务初始化完成');
            } else {
                console.warn('⚠️ InfoSpace 未找到');
            }
            
            // 初始化AI服务
            if (typeof AIService !== 'undefined') {
                await AIService.init();
                this.modules.aiService = AIService;
                console.log('✓ AI服务初始化完成');
            } else {
                console.warn('⚠️ AIService 未找到');
            }
            
            // 初始化UI管理器（兼容旧版本）
            if (typeof UI !== 'undefined') {
                await UI.init();
                this.modules.ui = UI;
                // 将UI设置为全局变量以供Tab管理器使用
                window.ui = UI;
                console.log('✓ UI管理器初始化完成');
            } else {
                console.warn('⚠️ UI 未找到');
            }
            
        } catch (error) {
            console.error('基础服务初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化Tab管理器
     */
    async initializeTabManager() {
        try {
            console.log('📋 初始化Tab管理器...');
            
            if (typeof TabManager !== 'undefined' && window.tabManager) {
                // 初始化Tab管理器
                await window.tabManager.initialize();
                this.modules.tabManager = window.tabManager;
                
                // 监听Tab管理器事件
                this.bindTabManagerEvents();
                
                console.log('✓ Tab管理器初始化完成');
            } else {
                console.error('❌ TabManager 未找到');
                throw new Error('Tab管理器初始化失败');
            }
            
        } catch (error) {
            console.error('Tab管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 绑定Tab管理器事件
     */
    bindTabManagerEvents() {
        const tabManager = this.modules.tabManager;
        if (!tabManager || !tabManager.eventBus) return;

        // 监听Tab切换事件
        tabManager.eventBus.on('tabManager:afterTabSwitch', (data) => {
            console.log(`Tab切换: ${data.from} → ${data.to}`);
            
            // 更新URL hash（不刷新页面）
            if (history.pushState) {
                history.pushState(null, null, `#${data.to}`);
            }
        });

        // 监听Tab管理器初始化完成事件
        tabManager.eventBus.on('tabManager:initialized', () => {
            console.log('Tab管理器初始化完成事件触发');
            
            // 根据URL hash设置初始Tab
            this.handleInitialRoute();
        });

        console.log('Tab管理器事件绑定完成');
    }

    /**
     * 处理初始路由
     */
    handleInitialRoute() {
        try {
            const hash = window.location.hash.substring(1);
            const tabManager = this.modules.tabManager;
            
            if (hash && tabManager && tabManager.tabConfig[hash]) {
                console.log(`从URL hash切换到Tab: ${hash}`);
                tabManager.switchTab(hash);
            } else {
                // 默认显示Dashboard
                console.log('显示默认Tab: dashboard');
                if (tabManager) {
                    tabManager.switchTab('dashboard');
                }
            }
        } catch (error) {
            console.error('处理初始路由失败:', error);
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 全局错误处理
        window.onerror = (message, source, lineno, colno, error) => {
            console.error('全局错误:', message, error);
            this.showError('发生错误', message);
            return true;
        };

        // Promise 错误处理
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise错误:', event.reason);
            this.showError('Promise错误', event.reason?.message || '未知错误');
            event.preventDefault();
        });

        // 页面可见性变化（用于优化性能）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('页面隐藏');
            } else {
                console.log('页面显示');
                // 页面重新显示时可以刷新数据
                this.handlePageVisible();
            }
        });

        // 绑定快捷键保存
        document.getElementById('saveQuickSettingsBtn')?.addEventListener('click', () => {
            if (window.tabManager) {
                window.tabManager.saveQuickSettings();
            }
        });

        // 供应商选择变化
        document.getElementById('providerSelect')?.addEventListener('change', (e) => {
            if (window.tabManager) {
                window.tabManager.updateModelOptions(e.target.value);
            }
        });

        console.log('全局事件绑定完成');
    }

    /**
     * 页面重新显示时的处理
     */
    handlePageVisible() {
        try {
            // 刷新当前活动Tab的数据
            const tabManager = this.modules.tabManager;
            if (tabManager) {
                const activeTab = tabManager.getActiveTab();
                const activeModule = tabManager.getModule(activeTab);
                
                if (activeModule && typeof activeModule.refresh === 'function') {
                    activeModule.refresh();
                    console.log(`刷新活动Tab: ${activeTab}`);
                }
            }
        } catch (error) {
            console.error('页面可见性处理失败:', error);
        }
    }

    /**
     * 显示启动通知
     */
    showStartupNotification() {
        try {
            const tabManager = this.modules.tabManager;
            if (tabManager) {
                tabManager.showNotification(
                    `🎉 Indienstein v${this.version} 启动成功！`, 
                    'success'
                );
            }
        } catch (error) {
            console.error('显示启动通知失败:', error);
        }
    }

    /**
     * 显示错误
     */
    showError(title, message) {
        try {
            // 首先尝试使用Tab管理器显示通知
            const tabManager = this.modules.tabManager;
            if (tabManager) {
                tabManager.showNotification(`${title}: ${message}`, 'error');
                return;
            }
            
            // 回退到UI模块
            if (this.modules.ui && typeof this.modules.ui.showMessage === 'function') {
                this.modules.ui.showMessage(`${title}: ${message}`, 'danger');
                return;
            }
            
            // 最终回退到alert
            alert(`${title}: ${message}`);
            
        } catch (error) {
            console.error('显示错误消息失败:', error);
            alert(`${title}: ${message}`);
        }
    }

    /**
     * 获取应用状态
     */
    getStatus() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            modules: Object.keys(this.modules),
            activeTab: this.modules.tabManager?.getActiveTab() || null
        };
    }

    /**
     * 重启应用
     */
    async restart() {
        try {
            console.log('重启应用...');
            
            // 清理资源
            this.cleanup();
            
            // 重新初始化
            this.isInitialized = false;
            await this.init();
            
            console.log('应用重启完成');
            
        } catch (error) {
            console.error('应用重启失败:', error);
            throw error;
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        try {
            // 清理Tab管理器事件
            if (this.modules.tabManager && this.modules.tabManager.eventBus) {
                this.modules.tabManager.eventBus.clear();
            }
            
            // 清理模块引用
            this.modules = {};
            
            console.log('资源清理完成');
            
        } catch (error) {
            console.error('资源清理失败:', error);
        }
    }
}

/**
 * 初始化应用 - 兼容旧版本
 */
function initApp() {
    if (app) {
        console.log('应用已存在，跳过初始化');
        return;
    }
    
    app = new App();
    app.init().catch(error => {
        console.error('initApp 失败:', error);
    });
}

// DOM加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 确保app变量被正确初始化
if (!app) {
    app = new App();
}

// 导出全局变量供调试使用
window.app = app;
window.initApp = initApp;

// 导出类供测试使用
window.Main = App;

console.log('Main.js v2.0 加载完成'); 