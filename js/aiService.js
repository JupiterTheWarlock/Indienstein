/**
 * AIService - AI服务模块
 * 处理与不同AI供应商(硅基流动、深度求索、智谱)的通信
 */

class AIService {
    // 静态属性
    static currentSettings = {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-V2.5',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        streamOutput: true
    };
    
    static isInitialized = false;
    
    // 供应商配置
    static providers = {
        'siliconflow': {
            name: '硅基流动',
            apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
            defaultModel: 'deepseek-ai/DeepSeek-V2.5',
            models: [
                { id: 'deepseek-ai/DeepSeek-V2.5', name: 'DeepSeek-V2.5' },
                { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
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
    };
    
    /**
     * 初始化AI服务
     */
    static init() {
        if (this.isInitialized) {
            console.log('AIService 已经初始化');
            return;
        }
        
        this.loadSettings();
        this.isInitialized = true;
        console.log('AIService: 初始化完成');
    }
    
    /**
     * 加载设置
     */
    static loadSettings() {
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
    }
    
    /**
     * 保存设置
     */
    static saveSettings() {
        localStorage.setItem('indienstein_ai_settings', JSON.stringify(this.currentSettings));
    }
    
    /**
     * 更新设置
     * @param {Object} settings 新设置
     */
    static updateSettings(settings) {
        this.init(); // 确保已初始化
        this.currentSettings = { ...this.currentSettings, ...settings };
        this.saveSettings();
    }
    
    /**
     * 获取当前供应商的模型列表
     * @returns {Array} 模型列表
     */
    static getModelsForCurrentProvider() {
        this.init(); // 确保已初始化
        const provider = this.providers[this.currentSettings.provider];
        return provider ? provider.models : [];
    }
    
    /**
     * 获取指定供应商的模型列表
     * @param {string} providerName 供应商名称
     * @returns {Array} 模型列表
     */
    static getModelsForProvider(providerName) {
        const provider = this.providers[providerName];
        return provider ? provider.models : [];
    }
    
    /**
     * 构建请求数据
     * @param {Array} messages 消息数组
     * @returns {Object} 请求数据
     */
    static buildRequestData(messages) {
        this.init(); // 确保已初始化
        const settings = this.currentSettings;
        
        return {
            model: settings.model,
            messages: messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: settings.streamOutput
        };
    }
    
    /**
     * 获取请求头
     * @returns {Object} 请求头
     */
    static getRequestHeaders() {
        this.init(); // 确保已初始化
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentSettings.apiKey}`
        };
    }
    
    /**
     * 获取API端点
     * @returns {string} API端点
     */
    static getApiEndpoint() {
        this.init(); // 确保已初始化
        const provider = this.providers[this.currentSettings.provider];
        return provider ? provider.apiEndpoint : '';
    }
    
    /**
     * 检查API Key是否设置
     * @returns {boolean} 是否已设置API Key
     */
    static hasApiKey() {
        this.init(); // 确保已初始化
        return !!(this.currentSettings.apiKey && this.currentSettings.apiKey.trim());
    }
    
    /**
     * 验证当前设置
     * @returns {Object} 验证结果
     */
    static validateSettings() {
        this.init(); // 确保已初始化
        
        const result = {
            valid: true,
            errors: []
        };
        
        if (!this.hasApiKey()) {
            result.valid = false;
            result.errors.push('API Key 未设置');
        }
        
        if (!this.providers[this.currentSettings.provider]) {
            result.valid = false;
            result.errors.push('无效的供应商');
        }
        
        if (!this.currentSettings.model) {
            result.valid = false;
            result.errors.push('模型未选择');
        }
        
        return result;
    }
    
    /**
     * 请求AI生成内容（非流式）
     * @param {Array} messages 消息数组
     * @returns {Promise<Object>} 响应对象
     */
    static async requestCompletion(messages) {
        this.init(); // 确保已初始化
        
        const validation = this.validateSettings();
        if (!validation.valid) {
            throw new Error(`设置验证失败: ${validation.errors.join(', ')}`);
        }
        
        if (this.currentSettings.streamOutput) {
            console.warn('AIService: 使用非流式方法请求流式输出');
        }
        
        const requestData = this.buildRequestData(messages);
        requestData.stream = false;
        
        const headers = this.getRequestHeaders();
        const apiEndpoint = this.getApiEndpoint();
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('AIService: 请求失败', error);
            throw error;
        }
    }
    
    /**
     * 请求AI生成内容（流式）
     * @param {Array} messages 消息数组
     * @param {Function} onContent 内容更新回调
     * @param {Function} onComplete 完成回调
     * @param {Function} onError 错误回调
     * @returns {Promise<Object>} 最终响应对象
     */
    static async requestCompletionStream(messages, onContent, onComplete, onError) {
        this.init(); // 确保已初始化
        
        const validation = this.validateSettings();
        if (!validation.valid) {
            const errorMsg = `设置验证失败: ${validation.errors.join(', ')}`;
            onError?.(errorMsg);
            throw new Error(errorMsg);
        }
        
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
        
        const requestData = this.buildRequestData(messages);
        requestData.stream = true;
        
        const headers = this.getRequestHeaders();
        const apiEndpoint = this.getApiEndpoint();
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                const errorMsg = `API请求失败: ${response.status} ${response.statusText} - ${errorText}`;
                onError?.(errorMsg);
                throw new Error(errorMsg);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let completeContent = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content;
                            
                            if (delta) {
                                completeContent += delta;
                                onContent?.(delta);
                            }
                        } catch (parseError) {
                            console.warn('解析流式数据失败:', parseError);
                        }
                    }
                }
            }
            
            onComplete?.(completeContent);
            
            return {
                choices: [{
                    message: {
                        content: completeContent
                    }
                }]
            };
            
        } catch (error) {
            console.error('AIService: 流式请求失败', error);
            onError?.(error.message);
            throw error;
        }
    }
    
    /**
     * 测试API连接
     * @returns {Promise<Object>} 测试结果
     */
    static async testConnection() {
        this.init(); // 确保已初始化
        
        const testMessages = [
            { role: 'user', content: '请回复"连接成功"' }
        ];
        
        try {
            const response = await this.requestCompletion(testMessages);
            return {
                success: true,
                message: '连接成功',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }
    
    /**
     * 获取所有供应商列表
     * @returns {Array} 供应商列表
     */
    static getAllProviders() {
        return Object.entries(this.providers).map(([id, provider]) => ({
            id,
            name: provider.name,
            models: provider.models
        }));
    }
    
    /**
     * 设置API Key
     * @param {string} provider 供应商名称
     * @param {string} apiKey API Key
     */
    static setApiKey(provider, apiKey) {
        this.init(); // 确保已初始化
        
        if (provider === this.currentSettings.provider) {
            this.updateSettings({ apiKey });
        }
        
        // 也保存到存储服务中
        if (typeof StorageService !== 'undefined') {
            try {
                const storageService = new StorageService();
                storageService.saveApiKey(provider, apiKey);
            } catch (error) {
                console.warn('保存API Key到存储服务失败:', error);
            }
        }
    }
    
    /**
     * 获取API Key
     * @param {string} provider 供应商名称
     * @returns {string|null} API Key
     */
    static getApiKey(provider) {
        this.init(); // 确保已初始化
        
        if (provider === this.currentSettings.provider) {
            return this.currentSettings.apiKey;
        }
        
        // 尝试从存储服务获取
        if (typeof StorageService !== 'undefined') {
            try {
                const storageService = new StorageService();
                return storageService.getApiKey(provider);
            } catch (error) {
                console.warn('从存储服务获取API Key失败:', error);
            }
        }
        
        return null;
    }
    
    /**
     * 切换供应商
     * @param {string} provider 供应商名称
     * @param {string} model 模型名称（可选）
     */
    static switchProvider(provider, model) {
        this.init(); // 确保已初始化
        
        if (!this.providers[provider]) {
            throw new Error(`不支持的供应商: ${provider}`);
        }
        
        const providerConfig = this.providers[provider];
        const newModel = model || providerConfig.defaultModel;
        
        // 尝试获取该供应商的API Key
        const apiKey = this.getApiKey(provider) || '';
        
        this.updateSettings({
            provider,
            model: newModel,
            apiKey
        });
        
        console.log(`已切换到供应商: ${providerConfig.name}, 模型: ${newModel}`);
    }
    
    /**
     * 重置设置
     */
    static resetSettings() {
        this.currentSettings = {
            provider: 'siliconflow',
            model: 'deepseek-ai/DeepSeek-V2.5',
            apiKey: '',
            temperature: 0.7,
            maxTokens: 2000,
            streamOutput: true
        };
        
        localStorage.removeItem('indienstein_ai_settings');
        console.log('AIService: 设置已重置');
    }
    
    /**
     * 获取当前配置摘要
     * @returns {Object} 配置摘要
     */
    static getConfigSummary() {
        this.init(); // 确保已初始化
        
        const provider = this.providers[this.currentSettings.provider];
        
        return {
            providerName: provider?.name || '未知',
            model: this.currentSettings.model,
            hasApiKey: this.hasApiKey(),
            temperature: this.currentSettings.temperature,
            maxTokens: this.currentSettings.maxTokens,
            streamOutput: this.currentSettings.streamOutput
        };
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.AIService = AIService;
} 