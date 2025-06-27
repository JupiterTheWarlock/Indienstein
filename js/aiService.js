/**
 * AIService - AI服务模块
 * 处理与不同AI供应商(硅基流动、深度求索、智谱)的通信
 */

const AIService = {
    // 当前设置
    currentSettings: {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-V3',
        temperature: 0.7,
        maxTokens: 8192,
        streamOutput: true
    },
    
    // 每个供应商的API Key（独立存储）
    apiKeys: {
        siliconflow: '',
        deepseek: '',
        zhipu: ''
    },
    
    // 供应商配置
    providers: {
        'siliconflow': {
            name: '硅基流动',
            apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
            defaultModel: 'deepseek-ai/DeepSeek-V3',
            models: [
                { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
                { id: 'deepseek-ai/DeepSeek-V2.5', name: 'DeepSeek-V2.5' },
                { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4-9B' },
                { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama-3.3-70B' },
                { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5-72B' }
            ]
        },
        'deepseek': {
            name: '深度求索',
            apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
            defaultModel: 'deepseek-chat',
            models: [
                { id: 'deepseek-chat', name: 'DeepSeek Chat' },
                { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' }
            ]
        },
        'zhipu': {
            name: '智谱',
            apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            defaultModel: 'glm-4-plus',
            models: [
                { id: 'glm-4-plus', name: 'GLM-4-Plus' },
                { id: 'glm-4-air', name: 'GLM-4-Air' },
                { id: 'glm-4-flash', name: 'GLM-4-Flash' }
            ]
        }
    },
    
    /**
     * 初始化AI服务
     */
    init() {
        this.loadSettings();
        this.loadApiKeys();
        console.log('AIService: 初始化完成');
    },
    
    /**
     * 加载设置
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('indienstein_ai_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.currentSettings = { ...this.currentSettings, ...settings };
                console.log('AIService: 已加载设置');
            } catch (error) {
                console.error('AIService: 加载设置失败', error);
            }
        }
    },
    
    /**
     * 加载API Keys
     */
    loadApiKeys() {
        const savedApiKeys = localStorage.getItem('indienstein_api_keys');
        if (savedApiKeys) {
            try {
                const apiKeys = JSON.parse(savedApiKeys);
                this.apiKeys = { ...this.apiKeys, ...apiKeys };
                console.log('AIService: 已加载API Keys');
            } catch (error) {
                console.error('AIService: 加载API Keys失败', error);
            }
        }
    },
    
    /**
     * 保存设置
     */
    saveSettings() {
        localStorage.setItem('indienstein_ai_settings', JSON.stringify(this.currentSettings));
    },
    
    /**
     * 保存API Keys
     */
    saveApiKeys() {
        localStorage.setItem('indienstein_api_keys', JSON.stringify(this.apiKeys));
    },
    
    /**
     * 更新设置
     * @param {Object} settings 新设置
     */
    updateSettings(settings) {
        this.currentSettings = { ...this.currentSettings, ...settings };
        this.saveSettings();
    },
    
    /**
     * 重置温度和令牌数为默认值
     * 用于确保在切换供应商和模型时保持统一的默认值
     */
    resetTemperatureAndTokens() {
        this.currentSettings.temperature = 0.7;
        this.currentSettings.maxTokens = 8192;
    },
    
    /**
     * 更新API Key
     * @param {string} provider 供应商ID
     * @param {string} apiKey 新的API Key
     */
    updateApiKey(provider, apiKey) {
        if (this.providers[provider]) {
            this.apiKeys[provider] = apiKey;
            this.saveApiKeys();
            console.log(`AIService: 已更新 ${provider} 的API Key`);
        } else {
            console.error(`AIService: 未知的供应商 ${provider}`);
        }
    },
    
    /**
     * 获取指定供应商的API Key
     * @param {string} provider 供应商ID
     * @returns {string} API Key
     */
    getApiKey(provider) {
        return this.apiKeys[provider] || '';
    },
    
    /**
     * 获取当前供应商的API Key
     * @returns {string} 当前供应商的API Key
     */
    getCurrentApiKey() {
        return this.getApiKey(this.currentSettings.provider);
    },
    
    /**
     * 获取所有供应商的API Key状态
     * @returns {Object} 各供应商的API Key状态
     */
    getApiKeysStatus() {
        const status = {};
        Object.keys(this.providers).forEach(providerId => {
            status[providerId] = {
                name: this.providers[providerId].name,
                hasApiKey: !!this.apiKeys[providerId],
                apiKey: this.apiKeys[providerId] || ''
            };
        });
        return status;
    },
    
    /**
     * 获取当前供应商的模型列表
     * @returns {Array} 模型列表
     */
    getModelsForCurrentProvider() {
        const provider = this.providers[this.currentSettings.provider];
        return provider ? provider.models : [];
    },
    
    /**
     * 构建请求数据
     * @param {Array} messages 消息数组
     * @returns {Object} 请求数据
     */
    buildRequestData(messages) {
        const settings = this.currentSettings;
        
        // 标准化消息格式，确保符合OpenAI API规范
        const formattedMessages = messages.map(message => {
            if (typeof message === 'string') {
                return {
                    role: 'user',
                    content: message
                };
            }
            
            return {
                role: message.role || 'user',
                content: message.content || message
            };
        });
        
        const requestData = {
            model: settings.model,
            messages: formattedMessages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: settings.streamOutput
        };
        
        // 添加供应商特定的参数
        if (settings.provider === 'zhipu') {
            // 智谱API的特殊参数
            if (requestData.stream) {
                requestData.stream = true;
                requestData.incremental = true;
            }
        }
        
        console.log('AIService: 构建请求数据', requestData);
        return requestData;
    },
    
    /**
     * 获取请求头
     * @returns {Object} 请求头
     */
    getRequestHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getCurrentApiKey()}`
        };
    },
    
    /**
     * 获取API端点
     * @returns {string} API端点
     */
    getApiEndpoint() {
        const provider = this.providers[this.currentSettings.provider];
        return provider ? provider.apiEndpoint : '';
    },
    
    /**
     * 请求AI生成内容（非流式）
     * @param {Array} messages 消息数组
     * @returns {Promise<Object>} 响应对象
     */
    async requestCompletion(messages) {
        if (this.currentSettings.streamOutput) {
            console.warn('AIService: 使用非流式方法请求流式输出');
        }
        
        // 预先验证
        const validation = this.validateConfiguration();
        if (!validation.valid) {
            throw new Error(`配置错误: ${validation.errors.join(', ')}`);
        }
        
        if (!messages || messages.length === 0) {
            throw new Error('消息列表不能为空');
        }
        
        const requestData = this.buildRequestData(messages);
        requestData.stream = false;
        
        const headers = this.getRequestHeaders();
        const apiEndpoint = this.getApiEndpoint();
        
        console.log('AIService: 准备发送非流式请求', {
            endpoint: apiEndpoint,
            provider: this.currentSettings.provider,
            model: this.currentSettings.model,
            messageCount: messages.length
        });
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('AIService: API请求失败详情', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    requestData: requestData,
                    headers: headers
                });
                throw new Error(`API请求失败: ${response.status} ${response.statusText}\n详情: ${errorText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('AIService: 请求失败', error);
            throw error;
        }
    },
    
    /**
     * 请求AI生成内容（流式）
     * @param {Array} messages 消息数组
     * @param {Function} onContent 内容更新回调
     * @param {Function} onComplete 完成回调
     * @param {Function} onError 错误回调
     * @returns {Promise<Object>} 最终响应对象
     */
    async requestCompletionStream(messages, onContent, onComplete, onError) {
        if (!this.currentSettings.streamOutput) {
            console.warn('AIService: 使用流式方法请求非流式输出');
            try {
                const response = await this.requestCompletion(messages);
                const content = response.choices[0].message.content;
                onContent?.(content);
                onComplete?.(content);
                return response;
            } catch (error) {
                onError?.(error.message);
                throw error;
            }
        }
        
        // 预先验证
        const validation = this.validateConfiguration();
        if (!validation.valid) {
            const error = `配置错误: ${validation.errors.join(', ')}`;
            onError?.(error);
            throw new Error(error);
        }
        
        if (!messages || messages.length === 0) {
            const error = '消息列表不能为空';
            onError?.(error);
            throw new Error(error);
        }
        
        const requestData = this.buildRequestData(messages);
        requestData.stream = true;
        
        const headers = this.getRequestHeaders();
        const apiEndpoint = this.getApiEndpoint();
        
        console.log('AIService: 准备发送流式请求', {
            endpoint: apiEndpoint,
            provider: this.currentSettings.provider,
            model: this.currentSettings.model,
            messageCount: messages.length
        });
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('AIService: 流式API请求失败详情', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    requestData: requestData,
                    headers: headers
                });
                throw new Error(`API请求失败: ${response.status} ${response.statusText}\n详情: ${errorText}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalResponse = null;
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // 解码新的数据块
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                // 处理SSE格式的数据
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留最后一个可能不完整的行
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        
                        if (data === '[DONE]' || data === '') {
                            continue;
                        }
                        
                        try {
                            const json = JSON.parse(data);
                            
                            // 处理不同供应商的响应格式
                            let content = this.extractContentFromStreamResponse(json);
                            
                            if (content) {
                                onContent?.(content);
                            }
                            
                            // 保存最后一个响应作为最终结果
                            finalResponse = json;
                        } catch (e) {
                            console.warn('AIService: 解析SSE数据失败', data, e);
                        }
                    }
                }
            }
            
            // 处理完成
            let finalContent = '';
            if (finalResponse && finalResponse.choices && finalResponse.choices[0]) {
                finalContent = finalResponse.choices[0].message?.content || '';
            }
            
            onComplete?.(finalContent);
            return finalResponse;
        } catch (error) {
            console.error('AIService: 流式请求失败', error);
            onError?.(error.message);
            throw error;
        }
    },
    
    /**
     * 从流式响应中提取内容
     * @param {Object} json 响应JSON对象
     * @returns {string|null} 提取的内容
     */
    extractContentFromStreamResponse(json) {
        // 标准OpenAI格式
        if (json.choices && json.choices[0]) {
            const choice = json.choices[0];
            
            // 流式响应中的delta
            if (choice.delta && choice.delta.content) {
                return choice.delta.content;
            }
            
            // 完整响应中的message
            if (choice.message && choice.message.content) {
                return choice.message.content;
            }
        }
        
        // 智谱AI格式
        if (json.delta && json.delta.content) {
            return json.delta.content;
        }
        
        // 直接内容格式
        if (json.content) {
            return json.content;
        }
        
        // 其他可能的格式
        if (json.text) {
            return json.text;
        }
        
        return null;
    },
    
    /**
     * 验证API Key是否设置
     * @returns {boolean} 是否已设置API Key
     */
    validateApiKey() {
        const apiKey = this.getCurrentApiKey();
        if (!apiKey) {
            console.error('AIService: 未设置API Key');
            return false;
        }
        return true;
    },
    
    /**
     * 验证当前配置
     * @returns {Object} 验证结果
     */
    validateConfiguration() {
        const result = {
            valid: true,
            errors: []
        };
        
        // 检查API Key
        if (!this.validateApiKey()) {
            result.valid = false;
            result.errors.push('未设置API Key');
        }
        
        // 检查供应商配置
        const provider = this.providers[this.currentSettings.provider];
        if (!provider) {
            result.valid = false;
            result.errors.push('未知的供应商');
        }
        
        // 检查模型
        if (!this.currentSettings.model) {
            result.valid = false;
            result.errors.push('未设置模型');
        }
        
        return result;
    }
}; 