/**
 * Main.js - 应用入口文件
 * 负责初始化和启动应用
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM 加载完成，开始初始化...');
        
        // 初始化信息空间
        console.log('初始化 InfoSpace...');
        InfoSpace.init();
        
        // 初始化AI服务
        console.log('初始化 AIService...');
        AIService.init();
        
        // 初始化UI
        console.log('初始化 UI...');
        UI.init();
        
        // 设置console重定向
        console.log('设置 console 重定向...');
        setupConsoleRedirect();
        
        // 显示欢迎信息
        console.log('Indienstein 初始化完成 - AI游戏灵感生成器');
        
    } catch (error) {
        console.error('初始化过程中发生错误:', error);
        alert('应用初始化失败: ' + error.message);
    }
});

/**
 * 初始化应用
 */
function initApp() {
    try {
        console.log('Indienstein Web 应用启动中...');
        
        // 初始化AI服务
        AIService.init();
        
        // 初始化UI
        UI.init();
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败: ' + error.message);
    }
}

/**
 * 添加一个全局错误处理器
 */
window.onerror = function(message, source, lineno, colno, error) {
    const errorInfo = {
        message: message,
        source: source,
        line: lineno,
        column: colno,
        error: error
    };
    
    console.error('全局错误:', errorInfo);
    
    // 显示友好的错误消息
    if (UI && UI.showMessage) {
        UI.showMessage('发生错误: ' + message, 'danger');
    } else {
        alert('发生错误: ' + message);
    }
    
    return true; // 防止默认错误处理
};

/**
 * 处理未捕获的Promise错误
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('未捕获的Promise错误:', event.reason);
    
    if (UI && UI.showMessage) {
        UI.showMessage('异步操作发生错误: ' + event.reason, 'danger');
    }
    
    event.preventDefault();
});

/**
 * 设置console重定向到调试窗口
 */
function setupConsoleRedirect() {
    // 保存原始的console方法
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // 重定向console.log
    console.log = function(...args) {
        originalLog.apply(console, args);
        if (UI && UI.addDebugInfo) {
            UI.addDebugInfo(args.join(' '), 'log');
        }
    };
    
    // 重定向console.warn
    console.warn = function(...args) {
        originalWarn.apply(console, args);
        if (UI && UI.addDebugInfo) {
            UI.addDebugInfo(args.join(' '), 'warn');
        }
    };
    
    // 重定向console.error
    console.error = function(...args) {
        originalError.apply(console, args);
        if (UI && UI.addDebugInfo) {
            UI.addDebugInfo(args.join(' '), 'error');
        }
    };
} 