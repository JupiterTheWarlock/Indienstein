/**
 * StorageService - 存储服务模块
 * 实现数据持久化
 */

const StorageService = {
    // 存储键名
    KEYS: {
        INSPIRATIONS: 'indienstein_inspirations',
        SETTINGS: 'indienstein_settings',
        FAVORITES: 'indienstein_favorites'
    },

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
    },

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
    },

    /**
     * 获取所有灵感
     * @returns {Array} 灵感数组
     */
    getInspirations() {
        const inspirationsJson = localStorage.getItem(this.KEYS.INSPIRATIONS);
        return inspirationsJson ? JSON.parse(inspirationsJson) : [];
    },

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
    },

    /**
     * 获取收藏的灵感
     * @returns {Array} 灵感数组
     */
    getFavoriteInspirations() {
        const inspirations = this.getInspirations();
        return inspirations.filter(i => i.metadata && i.metadata.isFavorite);
    },

    /**
     * 根据ID获取灵感
     * @param {string} id 灵感ID
     * @returns {Object|null} 灵感对象或null
     */
    getInspirationById(id) {
        const inspirations = this.getInspirations();
        return inspirations.find(i => i.id === id) || null;
    },

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
    },

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
    },

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
    },

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
    },

    /**
     * 保存应用设置
     * @param {Object} settings 设置对象
     */
    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * 获取应用设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        const settingsJson = localStorage.getItem(this.KEYS.SETTINGS);
        return settingsJson ? JSON.parse(settingsJson) : {};
    },

    /**
     * 导出灵感为JSON文件
     * @param {Array} inspirations 要导出的灵感数组
     * @param {string} filename 文件名
     */
    exportInspirations(inspirations, filename = 'indienstein_inspirations.json') {
        const dataStr = JSON.stringify(inspirations, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.click();
    },

    /**
     * 导出单个灵感为文本文件
     * @param {Object} inspiration 灵感对象
     * @param {string} filename 文件名
     */
    exportInspirationAsText(inspiration, filename = 'game_inspiration.txt') {
        if (!inspiration) return;
        
        let content = `# 游戏灵感\n\n`;
        content += `## 生成时间\n${new Date(inspiration.createdTime).toLocaleString()}\n\n`;
        
        content += `## 选择的元素\n`;
        for (const [dimensionId, vector] of Object.entries(inspiration.sourceVectors)) {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension) {
                content += `- ${dimension.name}: ${vector.name}\n`;
                if (vector.description) {
                    content += `  ${vector.description}\n`;
                }
            }
        }
        content += '\n';
        
        if (inspiration.userPrompt) {
            content += `## 用户提示\n${inspiration.userPrompt}\n\n`;
        }
        
        content += `## 灵感内容\n${inspiration.content}\n`;
        
        const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.click();
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}; 