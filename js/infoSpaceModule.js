/**
 * 信息空间模块
 * 负责维度管理、向量浏览、数据统计等功能
 */
class InfoSpaceModule {
    constructor() {
        this.selectedDimension = null;
        this.searchQuery = '';
        this.filterTags = [];
        this.isInitialized = false;
    }

    /**
     * 初始化信息空间模块
     */
    initialize() {
        if (this.isInitialized) return;
        
        try {
            this.renderDimensionList();
            this.renderDimensionDetails();
            this.renderVectorBrowser();
            this.renderDataStats();
            this.bindEvents();
            this.isInitialized = true;
            console.log('信息空间模块初始化完成');
        } catch (error) {
            console.error('信息空间模块初始化失败:', error);
        }
    }

    /**
     * 渲染维度列表
     */
    renderDimensionList() {
        const dimensions = InfoSpace.getAllDimensions();
        const listContainer = document.getElementById('dimensionList');
        if (!listContainer) return;

        let html = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">
                        <i class="bi bi-collection me-2"></i>维度列表 (${dimensions.length})
                    </h6>
                </div>
                <div class="card-body p-0">
                    <div class="list-group list-group-flush">
        `;

        dimensions.forEach(dimension => {
            const vectorCount = dimension.vectors ? dimension.vectors.length : 0;
            const isSelected = this.selectedDimension === dimension.id;
            
            html += `
                <a href="#" 
                   class="list-group-item list-group-item-action ${isSelected ? 'active' : ''}"
                   onclick="infoSpaceModule.selectDimension('${dimension.id}')">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${dimension.name}</h6>
                            <p class="mb-1 text-muted small">${dimension.description}</p>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-primary rounded-pill">${vectorCount}</span>
                            <br>
                            <small class="text-muted">向量</small>
                        </div>
                    </div>
                </a>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        listContainer.innerHTML = html;
    }

    /**
     * 选择维度
     */
    selectDimension(dimensionId) {
        this.selectedDimension = dimensionId;
        this.searchQuery = ''; // 重置搜索
        this.renderDimensionList(); // 重新渲染以更新选中状态
        this.renderDimensionDetails();
        this.renderVectorBrowser();
    }

    /**
     * 渲染维度详情
     */
    renderDimensionDetails() {
        const detailContainer = document.getElementById('dimensionDetails');
        if (!detailContainer) return;

        if (!this.selectedDimension) {
            detailContainer.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-collection text-muted" style="font-size: 3rem;"></i>
                        <h5 class="text-muted mt-3">请选择一个维度</h5>
                        <p class="text-muted">点击左侧维度列表中的任意维度查看详情</p>
                    </div>
                </div>
            `;
            return;
        }

        const dimension = InfoSpace.dimensions[this.selectedDimension];
        if (!dimension) {
            detailContainer.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                        <h5 class="text-warning mt-3">维度不存在</h5>
                        <p class="text-muted">所选维度可能已被删除或不存在</p>
                    </div>
                </div>
            `;
            return;
        }

        const vectorCount = dimension.vectors ? dimension.vectors.length : 0;
        const allTags = this.extractAllTags(dimension.vectors || []);

        const html = `
            <div class="card">
                <div class="card-header bg-info text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-info-circle me-2"></i>${dimension.name}
                        </h5>
                        <button class="btn btn-sm btn-outline-light" onclick="infoSpaceModule.refreshDimensionData()">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p class="mb-3">${dimension.description}</p>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <div class="stat-card bg-light p-3 rounded text-center">
                                <i class="bi bi-tags text-primary fs-4"></i>
                                <h4 class="text-primary mb-0">${vectorCount}</h4>
                                <small class="text-muted">向量数量</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-card bg-light p-3 rounded text-center">
                                <i class="bi bi-bookmark text-success fs-4"></i>
                                <h4 class="text-success mb-0">${allTags.length}</h4>
                                <small class="text-muted">标签数量</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-card bg-light p-3 rounded text-center">
                                <i class="bi bi-key text-warning fs-4"></i>
                                <h4 class="text-warning mb-0">${dimension.id}</h4>
                                <small class="text-muted">维度ID</small>
                            </div>
                        </div>
                    </div>
                    
                    ${allTags.length > 0 ? `
                        <div class="mb-3">
                            <h6>常用标签</h6>
                            <div class="d-flex flex-wrap gap-1">
                                ${allTags.slice(0, 10).map(tag => 
                                    `<span class="badge bg-secondary cursor-pointer" 
                                           onclick="infoSpaceModule.filterByTag('${tag}')">${tag}</span>`
                                ).join('')}
                                ${allTags.length > 10 ? `<span class="badge bg-light text-dark">+${allTags.length - 10} 更多</span>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="infoSpaceModule.randomSelectFromDimension()">
                            <i class="bi bi-shuffle"></i> 随机选择
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="infoSpaceModule.exportDimensionData()">
                            <i class="bi bi-download"></i> 导出数据
                        </button>
                    </div>
                </div>
            </div>
        `;

        detailContainer.innerHTML = html;
    }

    /**
     * 渲染向量浏览器
     */
    renderVectorBrowser() {
        const browserContainer = document.getElementById('vectorBrowser');
        if (!browserContainer) return;

        if (!this.selectedDimension) {
            browserContainer.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                        <h5 class="text-muted mt-3">准备浏览向量</h5>
                        <p class="text-muted">选择一个维度后即可浏览其包含的所有向量</p>
                    </div>
                </div>
            `;
            return;
        }

        const dimension = InfoSpace.dimensions[this.selectedDimension];
        if (!dimension || !dimension.vectors) {
            browserContainer.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                        <h5 class="text-muted mt-3">暂无向量数据</h5>
                        <p class="text-muted">该维度目前没有向量数据</p>
                    </div>
                </div>
            `;
            return;
        }

        // 过滤向量
        let filteredVectors = dimension.vectors;
        
        // 搜索过滤
        if (this.searchQuery) {
            filteredVectors = filteredVectors.filter(vector => 
                vector.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (vector.description && vector.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }
        
        // 标签过滤
        if (this.filterTags.length > 0) {
            filteredVectors = filteredVectors.filter(vector =>
                vector.tags && this.filterTags.some(tag => vector.tags.includes(tag))
            );
        }

        let html = `
            <div class="card">
                <div class="card-header bg-success text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="bi bi-grid me-2"></i>向量浏览器 (${filteredVectors.length}/${dimension.vectors.length})
                        </h6>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-light" onclick="infoSpaceModule.clearFilters()">
                                <i class="bi bi-x-circle"></i> 清除过滤
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- 搜索和过滤区域 -->
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">
                                    <i class="bi bi-search"></i>
                                </span>
                                <input type="text" 
                                       class="form-control" 
                                       id="vectorSearchInput"
                                       placeholder="搜索向量名称或描述..."
                                       value="${this.searchQuery}"
                                       onkeyup="infoSpaceModule.handleSearchInput(event)">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <select class="form-select form-select-sm" onchange="infoSpaceModule.handleSortChange(event)">
                                <option value="name">按名称排序</option>
                                <option value="tags">按标签数量排序</option>
                                <option value="random">随机排序</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- 向量卡片网格 -->
                    <div class="row g-3">
        `;

        if (filteredVectors.length === 0) {
            html += `
                <div class="col-12">
                    <div class="text-center py-4">
                        <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
                        <p class="text-muted mt-2">没有找到匹配的向量</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="infoSpaceModule.clearFilters()">
                            清除过滤条件
                        </button>
                    </div>
                </div>
            `;
        } else {
            filteredVectors.forEach((vector, index) => {
                html += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card vector-card h-100 border-light shadow-sm">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h6 class="card-title mb-0 flex-grow-1">${vector.name}</h6>
                                    <small class="text-muted">#${index + 1}</small>
                                </div>
                                
                                <p class="card-text text-muted small mb-2">
                                    ${vector.description || '无描述'}
                                </p>
                                
                                ${vector.tags && vector.tags.length > 0 ? `
                                    <div class="mb-2">
                                        ${vector.tags.map(tag => 
                                            `<span class="badge bg-light text-dark me-1 small cursor-pointer"
                                                   onclick="infoSpaceModule.filterByTag('${tag}')">${tag}</span>`
                                        ).join('')}
                                    </div>
                                ` : ''}
                                
                                <div class="d-flex gap-1">
                                    <button class="btn btn-sm btn-outline-primary flex-fill" 
                                            onclick="infoSpaceModule.selectVector('${vector.id || vector.name}')">
                                        <i class="bi bi-check2"></i> 选择
                                    </button>
                                    <button class="btn btn-sm btn-outline-info" 
                                            onclick="infoSpaceModule.viewVectorDetails('${vector.id || vector.name}')">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        browserContainer.innerHTML = html;
    }

    /**
     * 渲染数据统计
     */
    renderDataStats() {
        const dimensions = InfoSpace.getAllDimensions();
        const statsContainer = document.getElementById('dataStats');
        if (!statsContainer) return;

        const totalVectors = dimensions.reduce((sum, dim) => {
            return sum + (dim.vectors ? dim.vectors.length : 0);
        }, 0);

        // 统计标签使用频率
        const tagFrequency = {};
        dimensions.forEach(dimension => {
            if (dimension.vectors) {
                dimension.vectors.forEach(vector => {
                    if (vector.tags) {
                        vector.tags.forEach(tag => {
                            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                        });
                    }
                });
            }
        });

        const topTags = Object.entries(tagFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        let html = `
            <div class="card">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0">
                        <i class="bi bi-bar-chart me-2"></i>数据统计分析
                    </h6>
                </div>
                <div class="card-body">
                    <!-- 总体统计 -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="bi bi-collection text-primary fs-3"></i>
                                <h4 class="text-primary mb-0">${dimensions.length}</h4>
                                <small class="text-muted">维度总数</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="bi bi-tags text-success fs-3"></i>
                                <h4 class="text-success mb-0">${totalVectors}</h4>
                                <small class="text-muted">向量总数</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="bi bi-bookmark text-info fs-3"></i>
                                <h4 class="text-info mb-0">${Object.keys(tagFrequency).length}</h4>
                                <small class="text-muted">标签种类</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="bi bi-calculator text-warning fs-3"></i>
                                <h4 class="text-warning mb-0">${totalVectors > 0 ? (totalVectors / dimensions.length).toFixed(1) : 0}</h4>
                                <small class="text-muted">平均向量数</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 维度分布 -->
                    <h6 class="mb-3">维度向量分布</h6>
                    <div class="dimension-distribution mb-4">
        `;

        dimensions.forEach(dimension => {
            const count = dimension.vectors ? dimension.vectors.length : 0;
            const percentage = totalVectors > 0 ? (count / totalVectors * 100).toFixed(1) : 0;
            
            html += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="small cursor-pointer text-primary" 
                              onclick="infoSpaceModule.selectDimension('${dimension.id}')">${dimension.name}</span>
                        <span class="badge bg-primary">${count} (${percentage}%)</span>
                    </div>
                    <div class="progress" style="height: 4px;">
                        <div class="progress-bar bg-gradient" 
                             role="progressbar" 
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                    
                    <!-- 热门标签 -->
                    ${topTags.length > 0 ? `
                        <h6 class="mb-3">热门标签 Top ${topTags.length}</h6>
                        <div class="row">
                            ${topTags.map(([tag, count], index) => `
                                <div class="col-md-6 mb-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge bg-secondary cursor-pointer" 
                                              onclick="infoSpaceModule.searchByTag('${tag}')">
                                            #${index + 1} ${tag}
                                        </span>
                                        <small class="text-muted">${count} 次使用</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="mt-4 text-center">
                        <small class="text-muted">
                            <i class="bi bi-clock me-1"></i>
                            统计时间: ${new Date().toLocaleString()}
                        </small>
                    </div>
                </div>
            </div>
        `;

        statsContainer.innerHTML = html;
    }

    /**
     * 提取所有标签
     */
    extractAllTags(vectors) {
        const tags = new Set();
        vectors.forEach(vector => {
            if (vector.tags) {
                vector.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags);
    }

    /**
     * 处理搜索输入
     */
    handleSearchInput(event) {
        this.searchQuery = event.target.value;
        this.renderVectorBrowser();
    }

    /**
     * 处理排序变化
     */
    handleSortChange(event) {
        const sortType = event.target.value;
        const dimension = InfoSpace.dimensions[this.selectedDimension];
        
        if (dimension && dimension.vectors) {
            switch (sortType) {
                case 'name':
                    dimension.vectors.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'tags':
                    dimension.vectors.sort((a, b) => {
                        const aTagCount = a.tags ? a.tags.length : 0;
                        const bTagCount = b.tags ? b.tags.length : 0;
                        return bTagCount - aTagCount;
                    });
                    break;
                case 'random':
                    dimension.vectors.sort(() => Math.random() - 0.5);
                    break;
            }
            this.renderVectorBrowser();
        }
    }

    /**
     * 按标签过滤
     */
    filterByTag(tag) {
        if (!this.filterTags.includes(tag)) {
            this.filterTags.push(tag);
            this.renderVectorBrowser();
        }
    }

    /**
     * 清除过滤条件
     */
    clearFilters() {
        this.searchQuery = '';
        this.filterTags = [];
        const searchInput = document.getElementById('vectorSearchInput');
        if (searchInput) searchInput.value = '';
        this.renderVectorBrowser();
    }

    /**
     * 选择向量
     */
    selectVector(vectorId) {
        // 这里可以与Indienstein模块交互，将选中的向量添加到生成列表
        console.log('选择向量:', vectorId);
        this.showNotification(`向量 "${vectorId}" 已选择`, 'success');
    }

    /**
     * 查看向量详情
     */
    viewVectorDetails(vectorId) {
        const dimension = InfoSpace.dimensions[this.selectedDimension];
        const vector = dimension.vectors.find(v => (v.id || v.name) === vectorId);
        
        if (vector) {
            const modal = this.createVectorDetailModal(vector);
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // 模态框关闭后移除DOM元素
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        }
    }

    /**
     * 创建向量详情模态框
     */
    createVectorDetailModal(vector) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">向量详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6>${vector.name}</h6>
                        <p class="text-muted">${vector.description || '无描述'}</p>
                        
                        ${vector.tags && vector.tags.length > 0 ? `
                            <div class="mb-3">
                                <strong>标签：</strong>
                                ${vector.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="bg-light p-3 rounded">
                            <strong>向量ID：</strong> ${vector.id || vector.name}<br>
                            <strong>所属维度：</strong> ${InfoSpace.dimensions[this.selectedDimension].name}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="infoSpaceModule.selectVector('${vector.id || vector.name}'); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">选择此向量</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * 从维度随机选择
     */
    randomSelectFromDimension() {
        if (!this.selectedDimension) return;
        
        const dimension = InfoSpace.dimensions[this.selectedDimension];
        if (dimension && dimension.vectors && dimension.vectors.length > 0) {
            const randomVector = dimension.vectors[Math.floor(Math.random() * dimension.vectors.length)];
            this.selectVector(randomVector.id || randomVector.name);
        }
    }

    /**
     * 导出维度数据
     */
    exportDimensionData() {
        if (!this.selectedDimension) return;
        
        const dimension = InfoSpace.dimensions[this.selectedDimension];
        const data = JSON.stringify(dimension, null, 2);
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dimension_${dimension.id}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('维度数据已导出', 'success');
    }

    /**
     * 按标签搜索
     */
    searchByTag(tag) {
        this.searchQuery = '';
        this.filterTags = [tag];
        const searchInput = document.getElementById('vectorSearchInput');
        if (searchInput) searchInput.value = '';
        this.renderVectorBrowser();
    }

    /**
     * 刷新维度数据
     */
    refreshDimensionData() {
        this.renderDimensionDetails();
        this.renderVectorBrowser();
        this.renderDataStats();
        this.showNotification('维度数据已刷新', 'success');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 可以在这里绑定全局事件
        console.log('信息空间模块事件已绑定');
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getBootstrapAlertClass(type)} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            ${this.getNotificationIcon(type)}
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);

        console.log(`[INFO_SPACE ${type.toUpperCase()}] ${message}`);
    }

    /**
     * 获取Bootstrap alert类型
     */
    getBootstrapAlertClass(type) {
        const mapping = {
            'info': 'info',
            'success': 'success',
            'warning': 'warning',
            'error': 'danger'
        };
        return mapping[type] || 'info';
    }

    /**
     * 获取通知图标
     */
    getNotificationIcon(type) {
        const icons = {
            'info': '<i class="bi bi-info-circle me-2"></i>',
            'success': '<i class="bi bi-check-circle me-2"></i>',
            'warning': '<i class="bi bi-exclamation-triangle me-2"></i>',
            'error': '<i class="bi bi-x-circle me-2"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * 刷新所有数据
     */
    refresh() {
        try {
            this.renderDimensionList();
            this.renderDimensionDetails();
            this.renderVectorBrowser();
            this.renderDataStats();
            this.showNotification('信息空间数据已刷新', 'success');
        } catch (error) {
            console.error('刷新失败:', error);
            this.showNotification('刷新失败，请重试', 'error');
        }
    }
}

// 创建全局实例
window.infoSpaceModule = new InfoSpaceModule(); 