/**
 * Main.js - 应用入口文件
 * 负责初始化和启动应用
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化信息空间
    InfoSpace.init();
    
    // 初始化AI服务
    AIService.init();
    
    // 初始化UI
    UI.init();
    
    // 显示欢迎信息
    console.log('Indienstein 初始化完成 - AI游戏灵感生成器');
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
        
        // 初始化模型选项
        UI.updateModelOptions();
        
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
    console.error('全局错误:', message, error);
    
    // 显示友好的错误消息
    if (UI && UI.showMessage) {
        UI.showMessage('发生错误: ' + message, 'danger');
    } else {
        alert('发生错误: ' + message);
    }
    
    return true; // 防止默认错误处理
}; 