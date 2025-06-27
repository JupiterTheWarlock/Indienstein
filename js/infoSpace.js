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
            // 情感体验
            'emotion': {
                id: 'emotion',
                name: '情感体验',
                description: '游戏希望带给玩家的主要情感',
                vectors: [
                    { id: 'e1', name: '刺激紧张', description: '肾上腺素飙升、快节奏、高强度' },
                    { id: 'e2', name: '轻松欢乐', description: '幽默元素、积极氛围、减压体验' },
                    { id: 'e3', name: '恐惧紧张', description: '恐怖元素、心理压力、生存恐惧' },
                    { id: 'e4', name: '思考挑战', description: '智力挑战、解谜满足感、策略思考' },
                    { id: 'e5', name: '探索好奇', description: '发现新事物、解开谜题、开放世界' },
                    { id: 'e6', name: '成长成就', description: '角色进步、技能提升、目标达成' },
                    { id: 'e7', name: '沉浸代入', description: '身临其境、角色认同、情感投入' },
                    { id: 'e8', name: '社交连接', description: '团队合作、友谊建立、社区归属' },
                    { id: 'e9', name: '叙事感动', description: '情感故事、角色羁绊、道德选择' },
                    { id: 'e10', name: '创造自由', description: '表达创意、建造世界、个性化体验' }
                ]
            },
            
            // 动词维度
            'verb': {
                id: 'verb',
                name: '动词',
                description: '描述动作、行为、状态变化的词汇',
                vectors: [
                    // 单字动词
                    { id: 'v1', name: '跑'},
                    { id: 'v2', name: '走'},
                    { id: 'v3', name: '飞'},
                    { id: 'v4', name: '跳'},
                    { id: 'v5', name: '爬'},
                    { id: 'v6', name: '游'},
                    { id: 'v7', name: '看'},
                    { id: 'v8', name: '听'},
                    { id: 'v9', name: '说'},
                    { id: 'v10', name: '唱'},
                    { id: 'v11', name: '吃'},
                    { id: 'v12', name: '喝'},
                    { id: 'v13', name: '睡'},
                    { id: 'v14', name: '醒'},
                    { id: 'v15', name: '笑'},
                    { id: 'v16', name: '哭'},
                    { id: 'v17', name: '爱'},
                    { id: 'v18', name: '恨'},
                    { id: 'v19', name: '想'},
                    { id: 'v20', name: '忘'},
                    { id: 'v21', name: '拿'},
                    { id: 'v22', name: '放'},
                    { id: 'v23', name: '抱'},
                    { id: 'v24', name: '推'},
                    { id: 'v25', name: '拉'},
                    { id: 'v26', name: '打'},
                    { id: 'v27', name: '踢'},
                    { id: 'v28', name: '咬'},
                    { id: 'v29', name: '舔'},
                    { id: 'v30', name: '摸'},
                    { id: 'v31', name: '握'},
                    { id: 'v32', name: '挥'},
                    { id: 'v33', name: '扔'},
                    { id: 'v34', name: '接'},
                    { id: 'v35', name: '抓'},
                    { id: 'v36', name: '松'},
                    { id: 'v37', name: '开'},
                    { id: 'v38', name: '关'},
                    { id: 'v39', name: '锁'},
                    { id: 'v40', name: '解'},
                    { id: 'v41', name: '切'},
                    { id: 'v42', name: '削'},
                    { id: 'v43', name: '挖'},
                    { id: 'v44', name: '埋'},
                    { id: 'v45', name: '种'},
                    { id: 'v46', name: '收'},
                    { id: 'v47', name: '燃'},
                    { id: 'v48', name: '灭'},
                    { id: 'v49', name: '冻'},
                    { id: 'v50', name: '融'},
                    { id: 'v51', name: '流'},
                    { id: 'v52', name: '停'},
                    { id: 'v53', name: '转'},
                    { id: 'v54', name: '摇'},
                    { id: 'v55', name: '晃'},
                    { id: 'v56', name: '震'},
                    { id: 'v57', name: '闪'},
                    { id: 'v58', name: '照'},
                    { id: 'v59', name: '藏'},
                    { id: 'v60', name: '露'},
                    // 双字动词
                    { id: 'v61', name: '战斗'},
                    { id: 'v62', name: '探索'},
                    { id: 'v63', name: '建造'},
                    { id: 'v64', name: '收集'},
                    { id: 'v65', name: '跳跃'},
                    { id: 'v66', name: '解谜'},
                    { id: 'v67', name: '交流'},
                    { id: 'v68', name: '潜行'},
                    { id: 'v69', name: '驾驶'},
                    { id: 'v70', name: '治愈'},
                    { id: 'v71', name: '创造'},
                    { id: 'v72', name: '破坏'},
                    { id: 'v73', name: '修复'},
                    { id: 'v74', name: '保护'},
                    { id: 'v75', name: '攻击'},
                    { id: 'v76', name: '防御'},
                    { id: 'v77', name: '逃跑'},
                    { id: 'v78', name: '追赶'},
                    { id: 'v79', name: '寻找'},
                    { id: 'v80', name: '发现'},
                    { id: 'v81', name: '消失'},
                    { id: 'v82', name: '出现'},
                    { id: 'v83', name: '变化'},
                    { id: 'v84', name: '成长'},
                    { id: 'v85', name: '衰老'},
                    { id: 'v86', name: '学习'},
                    { id: 'v87', name: '教导'},
                    { id: 'v88', name: '模仿'},
                    { id: 'v89', name: '练习'},
                    { id: 'v90', name: '掌握'},
                    { id: 'v91', name: '失败'},
                    { id: 'v92', name: '成功'},
                    { id: 'v93', name: '努力'},
                    { id: 'v94', name: '放弃'},
                    { id: 'v95', name: '坚持'},
                    { id: 'v96', name: '选择'},
                    { id: 'v97', name: '决定'},
                    { id: 'v98', name: '犹豫'},
                    { id: 'v99', name: '后悔'},
                    { id: 'v100', name: '原谅'}
                ]
            },
            
            // 名词维度
            'noun': {
                id: 'noun',
                name: '名词',
                description: '描述事物、人物、概念的词汇',
                vectors: [
                    // 人物
                    { id: 'n1', name: '人'},
                    { id: 'n2', name: '孩子'},
                    { id: 'n3', name: '大人'},
                    { id: 'n4', name: '老人'},
                    { id: 'n5', name: '朋友'},
                    { id: 'n6', name: '敌人'},
                    { id: 'n7', name: '陌生人'},
                    { id: 'n8', name: '家人'},
                    { id: 'n9', name: '老师'},
                    { id: 'n10', name: '学生'},
                    // 身体部位
                    { id: 'n11', name: '头'},
                    { id: 'n12', name: '眼'},
                    { id: 'n13', name: '鼻'},
                    { id: 'n14', name: '嘴'},
                    { id: 'n15', name: '耳'},
                    { id: 'n16', name: '手'},
                    { id: 'n17', name: '脚'},
                    { id: 'n18', name: '心'},
                    { id: 'n19', name: '脑'},
                    { id: 'n20', name: '血'},
                    // 自然元素
                    { id: 'n21', name: '水'},
                    { id: 'n22', name: '火'},
                    { id: 'n23', name: '土'},
                    { id: 'n24', name: '风'},
                    { id: 'n25', name: '雨'},
                    { id: 'n26', name: '雪'},
                    { id: 'n27', name: '冰'},
                    { id: 'n28', name: '云'},
                    { id: 'n29', name: '雾'},
                    { id: 'n30', name: '光'},
                    { id: 'n31', name: '影'},
                    { id: 'n32', name: '暗'},
                    { id: 'n33', name: '雷'},
                    { id: 'n34', name: '电'},
                    { id: 'n35', name: '烟'},
                    // 动物
                    { id: 'n36', name: '猫'},
                    { id: 'n37', name: '狗'},
                    { id: 'n38', name: '鸟'},
                    { id: 'n39', name: '鱼'},
                    { id: 'n40', name: '虫'},
                    { id: 'n41', name: '蛇'},
                    { id: 'n42', name: '马'},
                    { id: 'n43', name: '牛'},
                    { id: 'n44', name: '羊'},
                    { id: 'n45', name: '猪'},
                    { id: 'n46', name: '鸡'},
                    { id: 'n47', name: '鸭'},
                    { id: 'n48', name: '兔'},
                    { id: 'n49', name: '鼠'},
                    { id: 'n50', name: '虎'},
                    // 植物
                    { id: 'n51', name: '树'},
                    { id: 'n52', name: '花'},
                    { id: 'n53', name: '草'},
                    { id: 'n54', name: '叶'},
                    { id: 'n55', name: '根'},
                    { id: 'n56', name: '枝'},
                    { id: 'n57', name: '果'},
                    { id: 'n58', name: '种'},
                    { id: 'n59', name: '竹'},
                    { id: 'n60', name: '藤'},
                    // 物品
                    { id: 'n61', name: '石'},
                    { id: 'n62', name: '木'},
                    { id: 'n63', name: '金'},
                    { id: 'n64', name: '银'},
                    { id: 'n65', name: '铁'},
                    { id: 'n66', name: '布'},
                    { id: 'n67', name: '纸'},
                    { id: 'n68', name: '绳'},
                    { id: 'n69', name: '线'},
                    { id: 'n70', name: '针'},
                    { id: 'n71', name: '刀'},
                    { id: 'n72', name: '剑'},
                    { id: 'n73', name: '锤'},
                    { id: 'n74', name: '钥'},
                    { id: 'n75', name: '锁'},
                    // 建筑
                    { id: 'n76', name: '房'},
                    { id: 'n77', name: '门'},
                    { id: 'n78', name: '窗'},
                    { id: 'n79', name: '墙'},
                    { id: 'n80', name: '桥'},
                    { id: 'n81', name: '路'},
                    { id: 'n82', name: '塔'},
                    { id: 'n83', name: '井'},
                    { id: 'n84', name: '洞'},
                    { id: 'n85', name: '坑'},
                    // 抽象概念
                    { id: 'n86', name: '时'},
                    { id: 'n87', name: '空'},
                    { id: 'n88', name: '梦'},
                    { id: 'n89', name: '爱'},
                    { id: 'n90', name: '恨'},
                    { id: 'n91', name: '乐'},
                    { id: 'n92', name: '愁'},
                    { id: 'n93', name: '希'},
                    { id: 'n94', name: '绝'},
                    { id: 'n95', name: '生'},
                    { id: 'n96', name: '死'},
                    { id: 'n97', name: '魂'},
                    { id: 'n98', name: '神'},
                    { id: 'n99', name: '命'},
                    { id: 'n100', name: '运'}
                ]
            },
            
            // 形容词维度
            'adjective': {
                id: 'adjective',
                name: '形容词',
                description: '描述性质、状态、特征的词汇',
                vectors: [
                    // 单字形容词
                    { id: 'a1', name: '大'},
                    { id: 'a2', name: '小'},
                    { id: 'a3', name: '高'},
                    { id: 'a4', name: '低'},
                    { id: 'a5', name: '长'},
                    { id: 'a6', name: '短'},
                    { id: 'a7', name: '宽'},
                    { id: 'a8', name: '窄'},
                    { id: 'a9', name: '厚'},
                    { id: 'a10', name: '薄'},
                    { id: 'a11', name: '重'},
                    { id: 'a12', name: '轻'},
                    { id: 'a13', name: '快'},
                    { id: 'a14', name: '慢'},
                    { id: 'a15', name: '热'},
                    { id: 'a16', name: '冷'},
                    { id: 'a17', name: '暖'},
                    { id: 'a18', name: '凉'},
                    { id: 'a19', name: '亮'},
                    { id: 'a20', name: '暗'},
                    { id: 'a21', name: '红'},
                    { id: 'a22', name: '绿'},
                    { id: 'a23', name: '蓝'},
                    { id: 'a24', name: '黄'},
                    { id: 'a25', name: '黑'},
                    { id: 'a26', name: '白'},
                    { id: 'a27', name: '紫'},
                    { id: 'a28', name: '粉'},
                    { id: 'a29', name: '灰'},
                    { id: 'a30', name: '棕'},
                    { id: 'a31', name: '新'},
                    { id: 'a32', name: '旧'},
                    { id: 'a33', name: '干'},
                    { id: 'a34', name: '湿'},
                    { id: 'a35', name: '硬'},
                    { id: 'a36', name: '软'},
                    { id: 'a37', name: '尖'},
                    { id: 'a38', name: '钝'},
                    { id: 'a39', name: '直'},
                    { id: 'a40', name: '弯'},
                    { id: 'a41', name: '圆'},
                    { id: 'a42', name: '方'},
                    { id: 'a43', name: '平'},
                    { id: 'a44', name: '凸'},
                    { id: 'a45', name: '凹'},
                    { id: 'a46', name: '满'},
                    { id: 'a47', name: '空'},
                    { id: 'a48', name: '多'},
                    { id: 'a49', name: '少'},
                    { id: 'a50', name: '真'},
                    { id: 'a51', name: '假'},
                    { id: 'a52', name: '好'},
                    { id: 'a53', name: '坏'},
                    { id: 'a54', name: '美'},
                    { id: 'a55', name: '丑'},
                    { id: 'a56', name: '善'},
                    { id: 'a57', name: '恶'},
                    { id: 'a58', name: '正'},
                    { id: 'a59', name: '邪'},
                    { id: 'a60', name: '净'},
                    // 双字形容词
                    { id: 'a61', name: '神秘'},
                    { id: 'a62', name: '危险'},
                    { id: 'a63', name: '美丽'},
                    { id: 'a64', name: '古老'},
                    { id: 'a65', name: '强大'},
                    { id: 'a66', name: '黑暗'},
                    { id: 'a67', name: '光明'},
                    { id: 'a68', name: '巨大'},
                    { id: 'a69', name: '灵活'},
                    { id: 'a70', name: '智慧'},
                    { id: 'a71', name: '勇敢'},
                    { id: 'a72', name: '胆小'},
                    { id: 'a73', name: '温柔'},
                    { id: 'a74', name: '粗暴'},
                    { id: 'a75', name: '安静'},
                    { id: 'a76', name: '吵闹'},
                    { id: 'a77', name: '清晰'},
                    { id: 'a78', name: '模糊'},
                    { id: 'a79', name: '简单'},
                    { id: 'a80', name: '复杂'},
                    { id: 'a81', name: '自由'},
                    { id: 'a82', name: '束缚'},
                    { id: 'a83', name: '开放'},
                    { id: 'a84', name: '封闭'},
                    { id: 'a85', name: '活泼'},
                    { id: 'a86', name: '沉默'},
                    { id: 'a87', name: '纯洁'},
                    { id: 'a88', name: '污浊'},
                    { id: 'a89', name: '柔和'},
                    { id: 'a90', name: '刺激'},
                    { id: 'a91', name: '平和'},
                    { id: 'a92', name: '激烈'},
                    { id: 'a93', name: '稳定'},
                    { id: 'a94', name: '动荡'},
                    { id: 'a95', name: '完整'},
                    { id: 'a96', name: '破碎'},
                    { id: 'a97', name: '鲜艳'},
                    { id: 'a98', name: '暗淡'},
                    { id: 'a99', name: '透明'},
                    { id: 'a100', name: '不透明'}
                ]
            },
            
            // 副词维度
            'adverb': {
                id: 'adverb',
                name: '副词',
                description: '修饰动词、形容词的词汇',
                vectors: [
                    // 时间副词
                    { id: 'ad1', name: '突然'},
                    { id: 'ad2', name: '缓慢'},
                    { id: 'ad3', name: '快速'},
                    { id: 'ad4', name: '立即'},
                    { id: 'ad5', name: '马上'},
                    { id: 'ad6', name: '渐渐'},
                    { id: 'ad7', name: '慢慢'},
                    { id: 'ad8', name: '逐渐'},
                    { id: 'ad9', name: '瞬间'},
                    { id: 'ad10', name: '永远'},
                    { id: 'ad11', name: '始终'},
                    { id: 'ad12', name: '一直'},
                    { id: 'ad13', name: '暂时'},
                    { id: 'ad14', name: '偶尔'},
                    { id: 'ad15', name: '经常'},
                    // 方式副词
                    { id: 'ad16', name: '悄悄'},
                    { id: 'ad17', name: '静静'},
                    { id: 'ad18', name: '轻轻'},
                    { id: 'ad19', name: '重重'},
                    { id: 'ad20', name: '猛烈'},
                    { id: 'ad21', name: '温柔'},
                    { id: 'ad22', name: '优雅'},
                    { id: 'ad23', name: '粗暴'},
                    { id: 'ad24', name: '精确'},
                    { id: 'ad25', name: '准确'},
                    { id: 'ad26', name: '模糊'},
                    { id: 'ad27', name: '清楚'},
                    { id: 'ad28', name: '仔细'},
                    { id: 'ad29', name: '随意'},
                    { id: 'ad30', name: '认真'},
                    // 程度副词
                    { id: 'ad31', name: '很'},
                    { id: 'ad32', name: '非常'},
                    { id: 'ad33', name: '极其'},
                    { id: 'ad34', name: '特别'},
                    { id: 'ad35', name: '十分'},
                    { id: 'ad36', name: '相当'},
                    { id: 'ad37', name: '比较'},
                    { id: 'ad38', name: '稍微'},
                    { id: 'ad39', name: '略微'},
                    { id: 'ad40', name: '完全'},
                    { id: 'ad41', name: '彻底'},
                    { id: 'ad42', name: '绝对'},
                    { id: 'ad43', name: '几乎'},
                    { id: 'ad44', name: '差不多'},
                    { id: 'ad45', name: '大概'},
                    // 情态副词
                    { id: 'ad46', name: '疯狂'},
                    { id: 'ad47', name: '冷静'},
                    { id: 'ad48', name: '坚定'},
                    { id: 'ad49', name: '犹豫'},
                    { id: 'ad50', name: '果断'},
                    { id: 'ad51', name: '小心'},
                    { id: 'ad52', name: '大胆'},
                    { id: 'ad53', name: '谨慎'},
                    { id: 'ad54', name: '勇敢'},
                    { id: 'ad55', name: '恐惧'},
                    { id: 'ad56', name: '兴奋'},
                    { id: 'ad57', name: '平静'},
                    { id: 'ad58', name: '愤怒'},
                    { id: 'ad59', name: '高兴'},
                    { id: 'ad60', name: '悲伤'},
                    { id: 'ad61', name: '紧张'},
                    { id: 'ad62', name: '放松'},
                    { id: 'ad63', name: '专心'},
                    { id: 'ad64', name: '分心'},
                    { id: 'ad65', name: '努力'},
                    { id: 'ad66', name: '懒散'},
                    { id: 'ad67', name: '积极'},
                    { id: 'ad68', name: '消极'},
                    { id: 'ad69', name: '主动'},
                    { id: 'ad70', name: '被动'}
                ]
            },
            
            // 时间维度
            'time': {
                id: 'time',
                name: '时间',
                description: '时间、节奏、时机的概念',
                vectors: [
                    { id: 't1', name: '瞬间'},
                    { id: 't2', name: '永恒'},
                    { id: 't3', name: '黎明'},
                    { id: 't4', name: '黄昏'},
                    { id: 't5', name: '午夜'},
                    { id: 't6', name: '循环'},
                    { id: 't7', name: '加速'},
                    { id: 't8', name: '静止'},
                    { id: 't9', name: '倒流'},
                    { id: 't10', name: '延续'}
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
     * @param {boolean} useWeight 是否使用权重（已废弃，保留参数兼容性）
     * @returns {Object|null} 向量对象或null
     */
    getRandomVector(dimensionId, useWeight = false) {
        const dimension = this.getDimension(dimensionId);
        if (!dimension || !dimension.vectors || dimension.vectors.length === 0) {
            return null;
        }
        
        // 普通随机选择
        const randomIndex = Math.floor(Math.random() * dimension.vectors.length);
        return dimension.vectors[randomIndex];
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
     * @returns {Object} 统计信息
     */
    getDimensionStats() {
        const dimensions = this.getAllDimensions();
        const totalVectors = dimensions.reduce((sum, dim) => sum + dim.vectors.length, 0);
        
        return {
            dimensionCount: dimensions.length,
            totalVectors: totalVectors,
            averageVectors: Math.round(totalVectors / dimensions.length)
        };
    }
};