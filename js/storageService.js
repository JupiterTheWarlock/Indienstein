/**
 * StorageService - 存储服务模块
 * 实现数据持久化
 */

class StorageService {
    constructor() {
        // 存储键名
        this.KEYS = {
            INSPIRATIONS: 'indienstein_inspirations',
            SETTINGS: 'indienstein_settings',
            FAVORITES: 'indienstein_favorites',
            API_KEYS: 'indienstein_api_keys'
        };
    }

    /**
     * 保存灵感到本地存储
     * @param {Object} inspiration 灵感对象
     * @returns {string} 灵感ID
     */
    saveInspiration(inspiration) {
        if (!inspiration) return null;
        
        // 获取现有灵感
        const inspirations = this.getInspirations();
        
        // 生成唯一ID
        const id = this.generateUniqueId();
        
        // 添加元数据
        const newInspiration = {
            ...inspiration,
            id: id,
            createdTime: new Date().toISOString(),
            metadata: {
                rating: 0,
                isFavorite: false,
                tags: []
            }
        };
        
        // 添加到列表
        inspirations.push(newInspiration);
        
        // 保存到本地存储
        localStorage.setItem(this.KEYS.INSPIRATIONS, JSON.stringify(inspirations));
        
        return id;
    }

    /**
     * 批量保存灵感
     * @param {Array} inspirations 灵感数组
     * @returns {Array} 灵感ID数组
     */
    saveBatchInspirations(inspirations) {
        if (!inspirations || !Array.isArray(inspirations)) return [];
        
        const ids = [];
        
        for (const inspiration of inspirations) {
            const id = this.saveInspiration(inspiration);
            if (id) {
                ids.push(id);
            }
        }
        
        return ids;
    }

    /**
     * 获取所有灵感
     * @returns {Array} 灵感数组
     */
    getInspirations() {
        const inspirationsJson = localStorage.getItem(this.KEYS.INSPIRATIONS);
        return inspirationsJson ? JSON.parse(inspirationsJson) : [];
    }

    /**
     * 获取最近的灵感
     * @param {number} count 数量
     * @returns {Array} 灵感数组
     */
    getRecentInspirations(count = 5) {
        const inspirations = this.getInspirations();
        
        // 按创建时间排序（最新的在前）
        inspirations.sort((a, b) => {
            return new Date(b.createdTime) - new Date(a.createdTime);
        });
        
        return inspirations.slice(0, count);
    }

    /**
     * 获取收藏的灵感
     * @returns {Array} 灵感数组
     */
    getFavoriteInspirations() {
        const inspirations = this.getInspirations();
        return inspirations.filter(i => i.metadata && i.metadata.isFavorite);
    }

    /**
     * 获取历史记录（用于Dashboard模块）
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        // 获取所有灵感作为历史记录
        const inspirations = this.getInspirations();
        
        // 按时间排序（最新的在前）
        return inspirations.sort((a, b) => {
            const timeA = new Date(a.createdTime || a.timestamp || 0);
            const timeB = new Date(b.createdTime || b.timestamp || 0);
            return timeB - timeA;
        });
    }

    /**
     * 根据ID获取灵感
     * @param {string} id 灵感ID
     * @returns {Object|null} 灵感对象或null
     */
    getInspirationById(id) {
        const inspirations = this.getInspirations();
        return inspirations.find(i => i.id === id) || null;
    }

    /**
     * 更新灵感
     * @param {string} id 灵感ID
     * @param {Object} updates 更新内容
     * @returns {boolean} 是否成功
     */
    updateInspiration(id, updates) {
        const inspirations = this.getInspirations();
        const index = inspirations.findIndex(i => i.id === id);
        
        if (index === -1) return false;
        
        // 更新灵感
        inspirations[index] = {
            ...inspirations[index],
            ...updates,
            metadata: {
                ...inspirations[index].metadata,
                ...(updates.metadata || {})
            }
        };
        
        // 保存到本地存储
        localStorage.setItem(this.KEYS.INSPIRATIONS, JSON.stringify(inspirations));
        
        return true;
    }

    /**
     * 删除灵感
     * @param {string} id 灵感ID
     * @returns {boolean} 是否成功
     */
    deleteInspiration(id) {
        const inspirations = this.getInspirations();
        const index = inspirations.findIndex(i => i.id === id);
        
        if (index === -1) return false;
        
        // 删除灵感
        inspirations.splice(index, 1);
        
        // 保存到本地存储
        localStorage.setItem(this.KEYS.INSPIRATIONS, JSON.stringify(inspirations));
        
        return true;
    }

    /**
     * 设置灵感收藏状态
     * @param {string} id 灵感ID
     * @param {boolean} isFavorite 是否收藏
     * @returns {boolean} 是否成功
     */
    setInspirationFavorite(id, isFavorite) {
        return this.updateInspiration(id, {
            metadata: { isFavorite }
        });
    }

    /**
     * 设置灵感评分
     * @param {string} id 灵感ID
     * @param {number} rating 评分（0-5）
     * @returns {boolean} 是否成功
     */
    setInspirationRating(id, rating) {
        return this.updateInspiration(id, {
            metadata: { rating: Math.max(0, Math.min(5, rating)) }
        });
    }

    /**
     * 保存应用设置
     * @param {Object} settings 设置对象
     */
    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }

    /**
     * 获取应用设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        const settingsJson = localStorage.getItem(this.KEYS.SETTINGS);
        return settingsJson ? JSON.parse(settingsJson) : {
            defaultProvider: 'siliconflow',
            defaultModel: 'deepseek-ai/DeepSeek-V3',
            longFormat: true,
            useWeightedRandom: false
        };
    }

    /**
     * 保存API Key
     * @param {string} provider 供应商名称
     * @param {string} apiKey API Key
     */
    saveApiKey(provider, apiKey) {
        const apiKeys = this.getApiKeys();
        apiKeys[provider] = apiKey;
        localStorage.setItem(this.KEYS.API_KEYS, JSON.stringify(apiKeys));
    }

    /**
     * 获取API Key
     * @param {string} provider 供应商名称
     * @returns {string|null} API Key或null
     */
    getApiKey(provider) {
        const apiKeys = this.getApiKeys();
        return apiKeys[provider] || null;
    }

    /**
     * 获取所有API Keys
     * @returns {Object} API Keys对象
     */
    getApiKeys() {
        const apiKeysJson = localStorage.getItem(this.KEYS.API_KEYS);
        return apiKeysJson ? JSON.parse(apiKeysJson) : {};
    }

    /**
     * 删除API Key
     * @param {string} provider 供应商名称
     * @returns {boolean} 是否成功
     */
    removeApiKey(provider) {
        const apiKeys = this.getApiKeys();
        if (apiKeys[provider]) {
            delete apiKeys[provider];
            localStorage.setItem(this.KEYS.API_KEYS, JSON.stringify(apiKeys));
            return true;
        }
        return false;
    }

    /**
     * 导出所有灵感为JSON
     * @param {Array} inspirations 灵感数组（可选，默认为所有灵感）
     * @param {string} filename 文件名
     */
    exportInspirations(inspirations, filename = 'indienstein_inspirations.json') {
        if (!inspirations) {
            inspirations = this.getInspirations();
        }
        
        const dataStr = JSON.stringify(inspirations, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
    }

    /**
     * 导出单个灵感为文本
     * @param {Object} inspiration 灵感对象
     * @param {string} filename 文件名
     */
    exportInspirationAsText(inspiration, filename = 'game_inspiration.txt') {
        if (!inspiration) return;
        
        let content = '';
        content += `游戏灵感生成报告\n`;
        content += `==================\n\n`;
        content += `生成时间: ${new Date(inspiration.createdTime).toLocaleString()}\n`;
        content += `助手ID: ${inspiration.assistantId || '未知'}\n\n`;
        
        if (inspiration.sourceVectors) {
            content += `使用的元素:\n`;
            Object.entries(inspiration.sourceVectors).forEach(([dimension, vector]) => {
                content += `- ${dimension}: ${vector.name}\n`;
            });
            content += '\n';
        }
        
        if (inspiration.userPrompt) {
            content += `用户提示: ${inspiration.userPrompt}\n\n`;
        }
        
        content += `生成内容:\n`;
        content += `${inspiration.content}\n`;
        
        const dataBlob = new Blob([content], {type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
    }

    /**
     * 清空所有数据
     * @param {boolean} confirm 是否需要确认
     */
    clearAllData(confirm = true) {
        if (confirm && !window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            return false;
        }
        
        localStorage.removeItem(this.KEYS.INSPIRATIONS);
        localStorage.removeItem(this.KEYS.SETTINGS);
        localStorage.removeItem(this.KEYS.FAVORITES);
        localStorage.removeItem(this.KEYS.API_KEYS);
        
        return true;
    }

    /**
     * 获取存储统计信息
     * @returns {Object} 统计信息
     */
    getStorageStats() {
        const inspirations = this.getInspirations();
        const favorites = this.getFavoriteInspirations();
        const apiKeys = this.getApiKeys();
        
        return {
            totalInspirations: inspirations.length,
            totalFavorites: favorites.length,
            hasApiKeys: Object.keys(apiKeys).length > 0,
            storageUsed: this.getStorageUsage()
        };
    }

    /**
     * 获取存储空间使用情况
     * @returns {Object} 存储使用情况
     */
    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        
        return {
            totalBytes: total,
            totalKB: Math.round(total / 1024 * 100) / 100,
            totalMB: Math.round(total / (1024 * 1024) * 100) / 100
        };
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateUniqueId() {
        return 'insp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 为了兼容性，也创建一个静态实例
if (typeof window !== 'undefined') {
    window.StorageService = StorageService;
} 