/**
 * IndiensteinService - 核心服务模块
 * 实现随机选择向量、构建提示词、生成灵感等功能
 */

const IndiensteinService = {
    /**
     * 从单个维度随机选择向量
     * @param {string} dimensionId 维度ID
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object|null} 向量对象或null
     */
    selectRandomVector(dimensionId, useWeight = false) {
        return InfoSpace.getRandomVector(dimensionId, useWeight);
    },
    
    /**
     * 从多个维度各选择一个向量
     * @param {Array} dimensionIds 维度ID数组
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object} 维度ID到向量的映射
     */
    selectFromDimensionIds(dimensionIds, useWeight = false) {
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
    },
    
    /**
     * 从所有维度随机选择向量
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object} 维度ID到向量的映射
     */
    selectFromAllDimensions(useWeight = false) {
        const dimensions = InfoSpace.getAllDimensions();
        const dimensionIds = dimensions.map(d => d.id);
        return this.selectFromDimensionIds(dimensionIds, useWeight);
    },
    
    /**
     * 构建AI提示词
     * @param {Object} selectedVectors 选中的向量
     * @param {string} userPrompt 用户自定义提示
     * @returns {string} 构建的提示词
     */
    buildPrompt(selectedVectors, userPrompt = '') {
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
    },
    
    /**
     * 生成灵感（流式传输）
     * @param {Object} selectedVectors 选中的向量
     * @param {string} userPrompt 用户自定义提示
     * @param {Function} onContentUpdate 内容更新回调
     * @param {Function} onComplete 完成回调
     * @param {Function} onError 错误回调
     * @returns {Promise<Object>} 灵感结果
     */
    async generateInspirationStream(selectedVectors, userPrompt = '', onContentUpdate, onComplete, onError) {
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
            // 验证AI服务配置
            const validation = AIService.validateConfiguration();
            if (!validation.valid) {
                const error = `AI服务配置错误: ${validation.errors.join(', ')}`;
                onError?.(error);
                return null;
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
                createdTime: new Date().toISOString()
            };
            
            return result;
        } catch (error) {
            console.error('生成灵感失败:', error);
            onError?.(error.message || '生成失败');
            return null;
        }
    },
    
    /**
     * 批量生成灵感
     * @param {Object} config 配置对象
     * @param {Function} onItemUpdate 单项更新回调
     * @param {Function} onItemComplete 单项完成回调
     * @param {Function} onItemError 单项错误回调
     * @param {Function} onProgress 进度回调
     * @returns {Promise<Array>} 灵感结果数组
     */
    async generateBatchInspiration(config, onItemUpdate, onItemComplete, onItemError, onProgress) {
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
                    (content) => onItemComplete?.(i, result),
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
                console.error(`批量生成第${i+1}个灵感时出错:`, error);
                onItemError?.(i, error.message || '生成失败');
            }
        }
        
        return results;
    }
}; 