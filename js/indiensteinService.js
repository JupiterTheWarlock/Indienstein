/**
 * IndiensteinService - 核心服务模块
 * 实现随机选择向量、构建提示词、生成灵感等功能
 */

class IndiensteinService {
    /**
     * 从单个维度随机选择向量
     * @param {string} dimensionId 维度ID
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object|null} 向量对象或null
     */
    static selectRandomVector(dimensionId, useWeight = false) {
        return InfoSpace.getRandomVector(dimensionId, useWeight);
    }
    
    /**
     * 从多个维度各选择一个向量
     * @param {Array} dimensionIds 维度ID数组
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object} 维度ID到向量的映射
     */
    static selectFromDimensionIds(dimensionIds, useWeight = false) {
        const result = {};
        
        if (!dimensionIds || dimensionIds.length === 0) {
            return result;
        }
        
        dimensionIds.forEach(id => {
            const vector = this.selectRandomVector(id, useWeight);
            if (vector) {
                result[id] = vector;
            }
        });
        
        return result;
    }
    
    /**
     * 从所有维度随机选择向量
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object} 维度ID到向量的映射
     */
    static selectFromAllDimensions(useWeight = false) {
        const dimensions = InfoSpace.getAllDimensions();
        const dimensionIds = dimensions.map(d => d.id);
        return this.selectFromDimensionIds(dimensionIds, useWeight);
    }
    
    /**
     * 构建AI提示词
     * @param {Object} selectedVectors 选中的向量
     * @param {string} userPrompt 用户自定义提示
     * @returns {string} 构建的提示词
     */
    static buildPrompt(selectedVectors, userPrompt = '') {
        let prompt = '请根据以下信息元素为我生成一个创意游戏灵感：\n\n';
        
        // 添加选中的向量信息
        for (const [dimensionId, vector] of Object.entries(selectedVectors)) {
            const dimension = InfoSpace.getDimension(dimensionId);
            if (dimension) {
                prompt += `【${dimension.name}】: ${vector.name}\n`;
                if (vector.description) {
                    prompt += `  描述: ${vector.description}\n`;
                }
                prompt += '\n';
            }
        }
        
        // 用户自定义提示
        if (userPrompt && userPrompt.trim()) {
            prompt += '额外要求：\n';
            prompt += userPrompt + '\n\n';
        }
        
        // 结尾指引
        prompt += `请基于这些元素，创造一个有趣、创新的游戏概念。包括：
1. 游戏核心概念
2. 主要玩法机制  
3. 游戏目标
4. 特色元素
5. 可能的发展方向

请用简洁明了的语言描述，字数控制在200-500字之间。`;
        
        return prompt;
    }
    
    /**
     * 生成灵感（流式传输）
     * @param {Object} selectedVectors 选中的向量
     * @param {string} userPrompt 用户自定义提示
     * @param {Function} onContentUpdate 内容更新回调
     * @param {Function} onComplete 完成回调
     * @param {Function} onError 错误回调
     * @returns {Promise<Object>} 灵感结果
     */
    static async generateInspirationStream(selectedVectors, userPrompt = '', onContentUpdate, onComplete, onError) {
        if (!selectedVectors || Object.keys(selectedVectors).length === 0) {
            const error = '没有选择的向量，无法生成灵感';
            onError?.(error);
            return null;
        }
        
        // 构建提示词
        const prompt = this.buildPrompt(selectedVectors, userPrompt);
        
        // 构建消息列表
        const messages = [
            { role: 'user', content: prompt }
        ];
        
        try {
            // 检查AIService是否可用
            if (typeof AIService === 'undefined' || !AIService.requestCompletionStream) {
                console.warn('AIService 不可用，使用模拟生成');
                return await this.mockGenerateInspiration(selectedVectors, userPrompt, onContentUpdate, onComplete);
            }
            
            // 调用AI服务
            let finalContent = '';
            
            await AIService.requestCompletionStream(
                messages,
                (content) => {
                    onContentUpdate?.(content);
                },
                (content) => {
                    finalContent = content;
                    onComplete?.(content);
                },
                (error) => {
                    onError?.(error);
                }
            );
            
            // 创建结果对象
            const result = {
                content: finalContent,
                sourceVectors: selectedVectors,
                userPrompt: userPrompt,
                createdTime: new Date().toISOString(),
                assistantId: 'ai-service'
            };
            
            return result;
        } catch (error) {
            console.error('生成灵感失败:', error);
            onError?.(error.message || '生成失败');
            return null;
        }
    }
    
    /**
     * 模拟生成灵感（用于测试）
     * @param {Object} selectedVectors 选中的向量
     * @param {string} userPrompt 用户自定义提示
     * @param {Function} onContentUpdate 内容更新回调
     * @param {Function} onComplete 完成回调
     * @returns {Promise<Object>} 灵感结果
     */
    static async mockGenerateInspiration(selectedVectors, userPrompt, onContentUpdate, onComplete) {
        const elements = Object.values(selectedVectors).map(v => v.name).join('、');
        
        const templates = [
            `一个融合了${elements}的创新游戏概念：这是一款结合策略与冒险的独特体验，玩家需要在充满挑战的世界中运用智慧和技巧来达成目标。游戏的核心机制围绕着资源管理和角色成长，通过探索未知领域和解决复杂谜题来推进故事发展。`,
            
            `基于${elements}设计的全新游戏：想象一个充满神秘色彩的虚拟世界，玩家将扮演特殊角色，利用独特能力在危机四伏的环境中生存。游戏强调团队合作与个人成长的平衡，通过精心设计的关卡和丰富的互动系统带来沉浸式体验。`,
            
            `以${elements}为核心的创意游戏：这款游戏将传统玩法与现代创新完美结合，提供多样化的挑战和无限的可能性。玩家可以自由探索开放世界，建立属于自己的王国，同时面对来自各方的考验。游戏的深度系统确保每次游玩都有新的发现。`
        ];
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        let content = template;
        
        // 如果有用户提示，添加相关内容
        if (userPrompt) {
            content += `\n\n根据您的要求"${userPrompt}"，游戏将特别注重相关元素的融入，确保体验的独特性和吸引力。`;
        }
        
        // 模拟流式输出
        const words = content.split('');
        let currentContent = '';
        
        for (let i = 0; i < words.length; i++) {
            currentContent += words[i];
            onContentUpdate?.(words[i]);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        onComplete?.(content);
        
        return {
            content: content,
            sourceVectors: selectedVectors,
            userPrompt: userPrompt,
            createdTime: new Date().toISOString(),
            assistantId: 'mock-service'
        };
    }
    
    /**
     * 批量生成灵感
     * @param {Object} config 配置对象
     * @param {Function} onItemUpdate 单项更新回调
     * @param {Function} onItemComplete 单项完成回调
     * @param {Function} onItemError 单项错误回调
     * @param {Function} onProgress 进度回调
     * @returns {Promise<Array>} 灵感结果数组
     */
    static async generateBatchInspiration(config, onItemUpdate, onItemComplete, onItemError, onProgress) {
        if (!config) {
            console.error('批量生成配置为空');
            return [];
        }
        
        const count = config.count || 3;
        const dimensionIds = config.dimensionIds || [];
        const useWeight = config.useWeight || false;
        const userPrompt = config.userPrompt || '';
        const delay = config.delay || 1;
        
        const results = [];
        
        for (let i = 0; i < count; i++) {
            try {
                // 随机选择向量
                let selectedVectors;
                if (dimensionIds.length > 0) {
                    selectedVectors = this.selectFromDimensionIds(dimensionIds, useWeight);
                } else {
                    selectedVectors = this.selectFromAllDimensions(useWeight);
                }
                
                // 生成灵感
                const result = await this.generateInspirationStream(
                    selectedVectors,
                    userPrompt,
                    (content) => onItemUpdate?.(i, content),
                    (content) => {
                        onItemComplete?.(i, result);
                    },
                    (error) => onItemError?.(i, error)
                );
                
                if (result) {
                    results.push(result);
                }
                
                // 更新进度
                onProgress?.(i, count);
                
                // 请求间隔
                if (i < count - 1 && delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay * 1000));
                }
                
            } catch (error) {
                console.error(`批量生成第${i+1}个灵感失败:`, error);
                onItemError?.(i, error.message);
            }
        }
        
        console.log(`批量生成完成，成功生成 ${results.length}/${count} 个灵感`);
        return results;
    }
    
    /**
     * 获取短提示词模板
     * @returns {string} 短提示词模板
     */
    static getShortPromptTemplate() {
        return `你是一个专业的游戏灵感生成器，擅长将随机关键词转化为简短的游戏创意。

你的任务是：
1. 分析用户提供的维度和关键词
2. 基于这些关键词生成一个简短的游戏灵感
3. 灵感必须是一句话，不超过100个字
4. 确保灵感清晰、有创意、独特
5. 灵感应该包含游戏的核心机制或玩法思路
6. 不要解释你的思考过程，直接给出结果

你的回复必须简洁、直接，只返回一句游戏灵感，不包含任何前言或解释。`;
    }
    
    /**
     * 获取所有可用的维度列表
     * @returns {Array} 维度列表
     */
    static getAllDimensions() {
        return InfoSpace.getAllDimensions();
    }
    
    /**
     * 获取维度统计信息
     * @returns {Object} 统计信息
     */
    static getDimensionStats() {
        const dimensions = this.getAllDimensions();
        const stats = {};
        
        dimensions.forEach(dimension => {
            stats[dimension.name] = dimension.vectors?.length || 0;
        });
        
        return stats;
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.IndiensteinService = IndiensteinService;
} 