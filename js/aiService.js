/**
 * AIService - AI服务模块
 * 处理与不同AI供应商(硅基流动、深度求索、智谱)的通信
 */

const AIService = {
    // 当前设置
    currentSettings: {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-V2.5',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        streamOutput: true
    },
    
    // 供应商配置
    providers: {
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
    },
    
    /**
     * 初始化AI服务
     */
    init() {
        this.loadSettings();
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
     * 保存设置
     */
    saveSettings() {
        localStorage.setItem('indienstein_ai_settings', JSON.stringify(this.currentSettings));
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
        
        return {
            model: settings.model,
            messages: messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: settings.streamOutput
        };
    },
    
    /**
     * 获取请求头
     * @returns {Object} 请求头
     */
    getRequestHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentSettings.apiKey}`
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
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
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
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
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
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const json = JSON.parse(data);
                            
                            if (json.choices && json.choices[0]) {
                                const delta = json.choices[0].delta;
                                
                                if (delta && delta.content) {
                                    onContent?.(delta.content);
                                }
                                
                                // 保存最后一个响应作为最终结果
                                finalResponse = json;
                            }
                        } catch (e) {
                            console.warn('AIService: 解析SSE数据失败', e);
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
    }
}; 