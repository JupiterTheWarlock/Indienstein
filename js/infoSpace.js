/**
 * InfoSpace - 信息空间模块
 * 包含维度和向量数据
 */

const InfoSpace = {
    // 维度数据
    dimensions: {},
    
    /**
     * 初始化信息空间
     */
    init() {
        this.loadDimensionData();
    },
    
    /**
     * 加载维度数据
     */
    loadDimensionData() {
        // 加载预定义的维度数据
        this.dimensions = {
            // 游戏主题
            'theme': {
                id: 'theme',
                name: '游戏主题',
                description: '游戏的核心主题或背景设定',
                vectors: [
                    { id: 't1', name: '太空探索', description: '探索未知宇宙、星际旅行、外星文明', weight: 1 },
                    { id: 't2', name: '后启示录', description: '世界末日后的生存、废土、重建文明', weight: 1 },
                    { id: 't3', name: '奇幻冒险', description: '魔法世界、神话生物、英雄旅程', weight: 1 },
                    { id: 't4', name: '赛博朋克', description: '高科技低生活、巨型企业、人机融合', weight: 1 },
                    { id: 't5', name: '历史战争', description: '真实历史背景、战争冲突、军事策略', weight: 1 },
                    { id: 't6', name: '海洋探险', description: '深海探索、海盗、水下文明', weight: 1 },
                    { id: 't7', name: '生态环保', description: '自然保护、气候变化、环境危机', weight: 1 },
                    { id: 't8', name: '蒸汽朋克', description: '维多利亚时代、蒸汽科技、机械装置', weight: 1 },
                    { id: 't9', name: '恐怖生存', description: '超自然威胁、恐惧元素、紧张氛围', weight: 1 },
                    { id: 't10', name: '城市生活', description: '现代都市、社会问题、日常生活', weight: 1 }
                ]
            },
            
            // 核心机制
            'mechanic': {
                id: 'mechanic',
                name: '核心机制',
                description: '游戏的主要玩法机制',
                vectors: [
                    { id: 'm1', name: '建造与管理', description: '建设基地、管理资源、优化生产', weight: 1 },
                    { id: 'm2', name: '回合制策略', description: '战术决策、单位控制、资源管理', weight: 1 },
                    { id: 'm3', name: '解谜探索', description: '环境谜题、线索收集、空间导航', weight: 1 },
                    { id: 'm4', name: '生存收集', description: '资源采集、制作物品、维持生命', weight: 1 },
                    { id: 'm5', name: '角色扮演', description: '角色成长、技能树、对话选择', weight: 1 },
                    { id: 'm6', name: '卡牌构筑', description: '卡组搭建、资源管理、连锁效果', weight: 1 },
                    { id: 'm7', name: '物理模拟', description: '真实物理、破坏系统、环境交互', weight: 1 },
                    { id: 'm8', name: '社交互动', description: '多人合作、社区建设、关系系统', weight: 1 },
                    { id: 'm9', name: '潜行隐匿', description: '躲避敌人、隐蔽行动、战术规划', weight: 1 },
                    { id: 'm10', name: '即时战斗', description: '实时操作、技能连招、反应测试', weight: 1 }
                ]
            },
            
            // 美术风格
            'art': {
                id: 'art',
                name: '美术风格',
                description: '游戏的视觉呈现风格',
                vectors: [
                    { id: 'a1', name: '像素复古', description: '8位/16位像素、复古游戏美学', weight: 1 },
                    { id: 'a2', name: '手绘水彩', description: '水彩画效果、艺术感强、柔和色调', weight: 1 },
                    { id: 'a3', name: '低多边形', description: '几何形状、简约设计、鲜明色彩', weight: 1 },
                    { id: 'a4', name: '写实3D', description: '高细节纹理、逼真光影、现实主义', weight: 1 },
                    { id: 'a5', name: '卡通风格', description: '夸张比例、鲜艳色彩、轮廓线条', weight: 1 },
                    { id: 'a6', name: '黑白剪影', description: '高对比度、剪影效果、极简设计', weight: 1 },
                    { id: 'a7', name: '赛博霓虹', description: '霓虹灯效、高科技UI、强烈对比', weight: 1 },
                    { id: 'a8', name: '蒸汽朋克', description: '铜色调、机械装置、维多利亚风格', weight: 1 },
                    { id: 'a9', name: '黑暗哥特', description: '阴暗氛围、怪诞设计、恐怖元素', weight: 1 },
                    { id: 'a10', name: '日式动漫', description: '动漫风格、鲜明轮廓、表情夸张', weight: 1 }
                ]
            },
            
            // 游戏视角
            'perspective': {
                id: 'perspective',
                name: '游戏视角',
                description: '玩家体验游戏的视角方式',
                vectors: [
                    { id: 'p1', name: '第一人称', description: '通过角色眼睛观察世界', weight: 1 },
                    { id: 'p2', name: '第三人称', description: '跟随角色背后的摄像机视角', weight: 1 },
                    { id: 'p3', name: '俯视角', description: '从上方俯视游戏世界', weight: 1 },
                    { id: 'p4', name: '侧面2D', description: '横向卷轴视角', weight: 1 },
                    { id: 'p5', name: '等距视角', description: '等角度投影的3D世界', weight: 1 },
                    { id: 'p6', name: '多视角切换', description: '可在多种视角间切换', weight: 1 },
                    { id: 'p7', name: '战术俯视', description: '战略性俯瞰全局', weight: 1 },
                    { id: 'p8', name: '虚拟现实', description: 'VR沉浸式体验', weight: 1 },
                    { id: 'p9', name: '文本界面', description: '以文本为主的界面', weight: 1 },
                    { id: 'p10', name: '卡牌桌面', description: '模拟桌游的视角', weight: 1 }
                ]
            },
            
            // 目标玩家
            'audience': {
                id: 'audience',
                name: '目标玩家',
                description: '游戏主要面向的玩家群体',
                vectors: [
                    { id: 'au1', name: '休闲玩家', description: '简单规则、短时间体验、低难度', weight: 1 },
                    { id: 'au2', name: '硬核玩家', description: '复杂系统、高挑战性、深度内容', weight: 1 },
                    { id: 'au3', name: '策略爱好者', description: '战术思考、资源管理、长期规划', weight: 1 },
                    { id: 'au4', name: '叙事探索者', description: '故事驱动、世界探索、角色发展', weight: 1 },
                    { id: 'au5', name: '创造建设者', description: '自由创造、个性表达、沙盒体验', weight: 1 },
                    { id: 'au6', name: '社交玩家', description: '多人互动、团队合作、社区参与', weight: 1 },
                    { id: 'au7', name: '收集成就者', description: '收集要素、完成挑战、解锁成就', weight: 1 },
                    { id: 'au8', name: '竞技玩家', description: 'PVP对战、排名系统、技能竞争', weight: 1 },
                    { id: 'au9', name: '实验创新派', description: '新颖机制、独特体验、实验性玩法', weight: 1 },
                    { id: 'au10', name: '怀旧玩家', description: '经典致敬、复古风格、熟悉感受', weight: 1 }
                ]
            },
            
            // 情感体验
            'emotion': {
                id: 'emotion',
                name: '情感体验',
                description: '游戏希望带给玩家的主要情感',
                vectors: [
                    { id: 'e1', name: '刺激紧张', description: '肾上腺素飙升、快节奏、高强度', weight: 1 },
                    { id: 'e2', name: '轻松欢乐', description: '幽默元素、积极氛围、减压体验', weight: 1 },
                    { id: 'e3', name: '恐惧紧张', description: '恐怖元素、心理压力、生存恐惧', weight: 1 },
                    { id: 'e4', name: '思考挑战', description: '智力挑战、解谜满足感、策略思考', weight: 1 },
                    { id: 'e5', name: '探索好奇', description: '发现新事物、解开谜题、开放世界', weight: 1 },
                    { id: 'e6', name: '成长成就', description: '角色进步、技能提升、目标达成', weight: 1 },
                    { id: 'e7', name: '沉浸代入', description: '身临其境、角色认同、情感投入', weight: 1 },
                    { id: 'e8', name: '社交连接', description: '团队合作、友谊建立、社区归属', weight: 1 },
                    { id: 'e9', name: '叙事感动', description: '情感故事、角色羁绊、道德选择', weight: 1 },
                    { id: 'e10', name: '创造自由', description: '表达创意、建造世界、个性化体验', weight: 1 }
                ]
            },
            
            // 游戏规模
            'scope': {
                id: 'scope',
                name: '游戏规模',
                description: '游戏的开发规模和内容量',
                vectors: [
                    { id: 's1', name: '迷你游戏', description: '极简机制、单一玩法、短时体验', weight: 1 },
                    { id: 's2', name: '独立小品', description: '聚焦核心、精致内容、中等规模', weight: 1 },
                    { id: 's3', name: '中型游戏', description: '多系统、丰富内容、10-20小时', weight: 1 },
                    { id: 's4', name: '大型作品', description: '开放世界、多线任务、40+小时', weight: 1 },
                    { id: 's5', name: '持续服务', description: '定期更新、社区互动、长期运营', weight: 1 },
                    { id: 's6', name: '系列游戏', description: '多部作品、连续故事、世界观扩展', weight: 1 },
                    { id: 's7', name: '跨媒体IP', description: '游戏、动画、小说等多媒体形式', weight: 1 },
                    { id: 's8', name: '游戏合集', description: '多个小游戏组合、主题统一', weight: 1 },
                    { id: 's9', name: '可扩展框架', description: '模组支持、玩家创作、内容生态', weight: 1 },
                    { id: 's10', name: '实验原型', description: '概念验证、创新尝试、简化实现', weight: 1 }
                ]
            },
            
            // 创新元素
            'innovation': {
                id: 'innovation',
                name: '创新元素',
                description: '游戏的独特创新点',
                vectors: [
                    { id: 'i1', name: '时间操控', description: '时间倒流、暂停、加速等机制', weight: 1 },
                    { id: 'i2', name: '维度转换', description: '在不同维度或现实间切换', weight: 1 },
                    { id: 'i3', name: '程序生成', description: '随机生成内容、无限可能性', weight: 1 },
                    { id: 'i4', name: '叙事分支', description: '多结局、选择影响、非线性故事', weight: 1 },
                    { id: 'i5', name: '混合现实', description: 'AR/VR/MR技术、现实融合', weight: 1 },
                    { id: 'i6', name: 'AI系统', description: '智能NPC、动态适应、学习系统', weight: 1 },
                    { id: 'i7', name: '玩家创作', description: '用户生成内容、创意分享', weight: 1 },
                    { id: 'i8', name: '跨媒体互动', description: '与其他设备或平台联动', weight: 1 },
                    { id: 'i9', name: '物理模拟', description: '真实物理、破坏系统、环境交互', weight: 1 },
                    { id: 'i10', name: '元游戏', description: '打破第四面墙、自我意识', weight: 1 }
                ]
            }
        };
        
        console.log('InfoSpace: 已加载 ' + Object.keys(this.dimensions).length + ' 个维度');
    },
    
    /**
     * 获取所有维度
     * @returns {Array} 维度数组
     */
    getAllDimensions() {
        return Object.values(this.dimensions);
    },
    
    /**
     * 获取指定维度
     * @param {string} dimensionId 维度ID
     * @returns {Object|null} 维度对象或null
     */
    getDimension(dimensionId) {
        return this.dimensions[dimensionId] || null;
    },
    
    /**
     * 从维度中随机选择一个向量
     * @param {string} dimensionId 维度ID
     * @param {boolean} useWeight 是否使用权重
     * @returns {Object|null} 向量对象或null
     */
    getRandomVector(dimensionId, useWeight = false) {
        const dimension = this.getDimension(dimensionId);
        if (!dimension || !dimension.vectors || dimension.vectors.length === 0) {
            return null;
        }
        
        if (useWeight) {
            // 使用权重随机
            const totalWeight = dimension.vectors.reduce((sum, vector) => sum + (vector.weight || 1), 0);
            let randomWeight = Math.random() * totalWeight;
            
            for (const vector of dimension.vectors) {
                const weight = vector.weight || 1;
                if (randomWeight <= weight) {
                    return vector;
                }
                randomWeight -= weight;
            }
            
            // 防止浮点数精度问题，返回最后一个
            return dimension.vectors[dimension.vectors.length - 1];
        } else {
            // 普通随机
            const randomIndex = Math.floor(Math.random() * dimension.vectors.length);
            return dimension.vectors[randomIndex];
        }
    },

    /**
     * 从多个维度选择向量
     * @param {Array} dimensionIds 维度ID数组
     * @returns {Object} 维度ID到向量的映射
     */
    selectFromDimensions(dimensionIds) {
        const result = {};
        
        for (const id of dimensionIds) {
            const vector = this.getRandomVector(id);
            if (vector) {
                result[id] = vector;
            }
        }
        
        return result;
    },

    /**
     * 获取维度中的所有向量
     * @param {string} dimensionId 维度ID
     * @returns {Array} 向量数组
     */
    getVectorsFromDimension(dimensionId) {
        const dimension = this.dimensions[dimensionId];
        return dimension ? dimension.vectors : [];
    },

    /**
     * 获取维度统计信息
     * @returns {Object} 维度名称到向量数量的映射
     */
    getDimensionStats() {
        const stats = {};
        
        for (const [id, dimension] of Object.entries(this.dimensions)) {
            stats[dimension.name] = dimension.vectors.length;
        }
        
        return stats;
    }
}; 