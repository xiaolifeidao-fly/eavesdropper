// 属性类型选项
const attributeTypes = [
    { value: 'text', label: '文本' },
    { value: 'number', label: '数字' },
    { value: 'select', label: '下拉选择' },
    { value: 'date', label: '日期' },
    { value: 'color', label: '颜色' }
];

document.addEventListener('DOMContentLoaded', function() {
    // 添加属性按钮事件
    document.querySelectorAll('.add-attribute').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            addAttributeRow(targetId);
        });
    });

    // 添加表格行按钮事件
    document.getElementById('add-row').addEventListener('click', function() {
        addTableRow();
    });

    // 添加详情图片按钮事件
    document.getElementById('add-detail-image').addEventListener('click', function() {
        addDetailImage();
    });

    // 初始化设置默认属性
    addAttributeRow('product-attributes', '属性a');
    addAttributeRow('product-attributes', '属性b');
    addAttributeRow('sales-attributes', '属性a');
    addAttributeRow('sales-attributes', '属性b');
    updateSalesTable();

    // 监听图片上传
    setupImageUpload();

    // 初始化日期选择器
    initializeDatePickers();

    // 为已存在的删除行按钮添加事件
    document.querySelectorAll('.delete-row').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('tr').remove();
        });
    });
});

// 添加详情图片
function addDetailImage() {
    const container = document.getElementById('detailImages');
    const addButton = document.getElementById('add-detail-image');
    
    const imageUpload = document.createElement('div');
    imageUpload.className = 'detail-image-upload';
    imageUpload.innerHTML = `
        <input type="file" accept="image/*" class="image-input">
        <div class="upload-placeholder">
            <i class="plus-icon">+</i>
            <div>点击上传</div>
        </div>
        <img class="preview-image" style="display: none;">
        <button type="button" class="btn btn-sm btn-danger remove-image">×</button>
    `;
    
    // 添加到容器中，放在添加按钮之前
    container.insertBefore(imageUpload, addButton);
    
    // 为删除按钮添加事件
    imageUpload.querySelector('.remove-image').addEventListener('click', function() {
        imageUpload.remove();
    });
    
    // 设置图片上传事件
    setupImageUpload(imageUpload);
}

// 添加属性行
function addAttributeRow(targetId, defaultName = '') {
    const container = document.getElementById(targetId);
    const rowId = `${targetId}-${Date.now()}`;
    
    const row = document.createElement('div');
    row.className = 'attribute-row';
    row.dataset.id = rowId;
    
    // 属性名称输入
    const nameField = document.createElement('div');
    nameField.className = 'attribute-field';
    nameField.innerHTML = `
        <label for="${rowId}-name">属性名称</label>
        <input type="text" class="form-control" id="${rowId}-name" placeholder="输入属性名称" value="${defaultName}">
    `;
    
    // 属性类型选择
    const typeField = document.createElement('div');
    typeField.className = 'attribute-field';
    
    let typeOptions = '';
    attributeTypes.forEach(type => {
        typeOptions += `<option value="${type.value}">${type.label}</option>`;
    });
    
    typeField.innerHTML = `
        <label for="${rowId}-type">属性类型</label>
        <select class="form-control" id="${rowId}-type">
            ${typeOptions}
        </select>
    `;
    
    // 添加选择器的变化事件
    typeField.querySelector('select').addEventListener('change', function() {
        handleTypeChange(rowId);
    });
    
    // 属性值设置区域（根据类型动态变化）
    const valueField = document.createElement('div');
    valueField.className = 'attribute-field';
    valueField.id = `${rowId}-value-container`;
    valueField.innerHTML = `
        <label for="${rowId}-value">属性值</label>
        <input type="text" class="form-control" id="${rowId}-value" placeholder="输入属性值">
    `;
    
    // 操作按钮
    const actions = document.createElement('div');
    actions.className = 'attribute-actions';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = '删除';
    deleteButton.addEventListener('click', function() {
        removeAttribute(rowId);
    });
    actions.appendChild(deleteButton);
    
    // 组装行元素
    row.appendChild(nameField);
    row.appendChild(typeField);
    row.appendChild(valueField);
    row.appendChild(actions);
    
    // 添加到容器
    container.appendChild(row);
    
    // 如果是销售属性，更新表格
    if (targetId === 'sales-attributes') {
        updateSalesTable();
    }
}

// 处理属性类型变化
function handleTypeChange(rowId) {
    const typeSelect = document.getElementById(`${rowId}-type`);
    const valueContainer = document.getElementById(`${rowId}-value-container`);
    const selectedType = typeSelect.value;
    
    let inputHtml = '';
    const labelText = '属性值';
    
    switch (selectedType) {
        case 'text':
            inputHtml = `<input type="text" class="form-control" id="${rowId}-value" placeholder="输入文本">`;
            break;
        case 'number':
            inputHtml = `<input type="number" class="form-control" id="${rowId}-value" placeholder="输入数字">`;
            break;
        case 'select':
            inputHtml = `
                <input type="text" class="form-control" id="${rowId}-value" placeholder="输入选项，用逗号分隔">
                <small class="form-text text-muted">例如: 红色,蓝色,绿色</small>
            `;
            break;
        case 'date':
            inputHtml = `<input type="text" class="form-control datepicker" id="${rowId}-value" placeholder="选择日期">`;
            break;
        case 'color':
            inputHtml = `<input type="color" class="form-control" id="${rowId}-value" style="height: 40px;">`;
            break;
    }
    
    valueContainer.innerHTML = `<label for="${rowId}-value">${labelText}</label>${inputHtml}`;
    
    // 如果是日期类型，初始化日期选择器
    if (selectedType === 'date') {
        initializeDatePickers();
    }
    
    // 如果是销售属性，更新表格
    const targetId = rowId.split('-')[0] + '-' + rowId.split('-')[1];
    if (targetId === 'sales-attributes') {
        updateSalesTable();
    }
}

// 删除属性
function removeAttribute(rowId) {
    const row = document.querySelector(`[data-id="${rowId}"]`);
    const targetId = rowId.split('-')[0] + '-' + rowId.split('-')[1];
    
    row.remove();
    
    // 如果是销售属性，更新表格
    if (targetId === 'sales-attributes') {
        updateSalesTable();
    }
}

// 更新销售属性表格
function updateSalesTable() {
    const salesAttributes = document.getElementById('sales-attributes').querySelectorAll('.attribute-row');
    const tableHead = document.querySelector('#sales-table thead tr');
    
    // 清除旧的属性列（保留图片、价格、数量、操作列）
    const headCells = Array.from(tableHead.children);
    // 保留第一列（图片）和最后三列（价格、数量、操作）
    for (let i = headCells.length - 4; i > 0; i--) {
        tableHead.removeChild(headCells[i + 1]);
    }
    
    // 添加新的属性列
    const attributeNames = [];
    salesAttributes.forEach(attr => {
        const nameInput = attr.querySelector('input[id$="-name"]');
        if (nameInput && nameInput.value.trim()) {
            attributeNames.push({
                id: attr.dataset.id,
                name: nameInput.value.trim()
            });
            
            const th = document.createElement('th');
            th.textContent = nameInput.value.trim();
            
            // 插入到图片列之后，价格列之前
            tableHead.insertBefore(th, tableHead.children[attributeNames.length]);
        }
    });
    
    // 更新现有行
    const tableRows = document.querySelectorAll('#sales-table tbody tr');
    tableRows.forEach(row => {
        updateTableRow(row, attributeNames);
    });
}

// 更新表格行
function updateTableRow(row, attributeNames) {
    // 首先清除旧的属性单元格（保留图片、价格、数量、操作单元格）
    const cells = Array.from(row.children);
    // 保留第一列（图片）和最后三列（价格、数量、操作）
    for (let i = cells.length - 4; i > 0; i--) {
        row.removeChild(cells[i]);
    }
    
    // 添加新的属性单元格
    attributeNames.forEach((attr, index) => {
        const td = document.createElement('td');
        const rowId = attr.id;
        const attrType = document.getElementById(`${rowId}-type`).value;
        
        // 根据属性类型创建不同的输入控件
        switch (attrType) {
            case 'text':
                td.innerHTML = `<input type="text" class="form-control">`;
                break;
            case 'number':
                td.innerHTML = `<input type="number" class="form-control">`;
                break;
            case 'select':
                const options = document.getElementById(`${rowId}-value`).value.split(',')
                    .map(opt => opt.trim())
                    .filter(opt => opt)
                    .map(opt => `<option value="${opt}">${opt}</option>`)
                    .join('');
                
                td.innerHTML = `
                    <select class="form-control">
                        <option value="">请选择</option>
                        ${options}
                    </select>
                `;
                break;
            case 'date':
                td.innerHTML = `<input type="text" class="form-control datepicker">`;
                break;
            case 'color':
                td.innerHTML = `<input type="color" class="form-control" style="height: 38px;">`;
                break;
        }
        
        // 插入到图片列之后，价格列之前
        row.insertBefore(td, row.children[index + 1]);
    });
    
    // 如果有日期选择器，初始化它们
    initializeDatePickers();
}

// 添加表格行
function addTableRow() {
    const tbody = document.querySelector('#sales-table tbody');
    const attributeNames = [];
    
    document.getElementById('sales-attributes').querySelectorAll('.attribute-row').forEach(attr => {
        const nameInput = attr.querySelector('input[id$="-name"]');
        if (nameInput && nameInput.value.trim()) {
            attributeNames.push({
                id: attr.dataset.id,
                name: nameInput.value.trim()
            });
        }
    });
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <div class="table-image-upload">
                <input type="file" accept="image/*" class="image-input">
                <div class="upload-placeholder small">
                    <i class="plus-icon">+</i>
                </div>
                <img class="preview-image" style="display: none;">
            </div>
        </td>
    `;
    
    // 添加销售属性列
    attributeNames.forEach(() => {
        newRow.innerHTML += `<td></td>`;
    });
    
    newRow.innerHTML += `
        <td><input type="number" class="form-control" placeholder="价格"></td>
        <td><input type="number" class="form-control" placeholder="数量"></td>
        <td><button class="btn btn-danger btn-sm delete-row">删除</button></td>
    `;
    
    tbody.appendChild(newRow);
    
    // 更新新行的单元格
    updateTableRow(newRow, attributeNames);
    
    // 为新行的删除按钮添加事件
    newRow.querySelector('.delete-row').addEventListener('click', function() {
        newRow.remove();
    });
    
    // 设置图片上传事件
    setupImageUpload(newRow);
}

// 设置图片上传
function setupImageUpload(container = document) {
    container.querySelectorAll('.image-input').forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const parent = this.parentElement;
            const preview = parent.querySelector('.preview-image');
            const placeholder = parent.querySelector('.upload-placeholder');
            
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    });
}

// 初始化日期选择器
function initializeDatePickers() {
    flatpickr(".datepicker", {
        locale: "zh",
        dateFormat: "Y-m-d",
        allowInput: true
    });
}

// 保存和发布按钮逻辑
document.getElementById('save-draft').addEventListener('click', function() {
    saveProductData('draft');
});

document.getElementById('publish').addEventListener('click', function() {
    saveProductData('published');
});

// 保存商品数据
function saveProductData(status) {
    const productData = {
        status: status,
        basicInfo: {
            title: document.getElementById('title').value
        },
        productAttributes: getAttributes('product-attributes'),
        salesAttributes: getAttributes('sales-attributes'),
        salesSpecs: getSalesSpecs(),
        detailImages: getDetailImages()
    };
    
    // 这里你可以将数据发送到服务器
    console.log('商品数据:', productData);
    
    // 显示保存成功消息
    const message = status === 'published' ? '商品发布成功！' : '草稿保存成功！';
    showMessage(message, 'success');
}

// 获取属性数据
function getAttributes(containerId) {
    const attributes = [];
    document.getElementById(containerId).querySelectorAll('.attribute-row').forEach(row => {
        const id = row.dataset.id;
        attributes.push({
            name: document.getElementById(`${id}-name`).value,
            type: document.getElementById(`${id}-type`).value,
            value: document.getElementById(`${id}-value`).value
        });
    });
    return attributes;
}

// 获取销售规格数据
function getSalesSpecs() {
    const specs = [];
    document.querySelectorAll('#sales-table tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const salesAttributeCount = cells.length - 4; // 减去图片、价格、数量、操作列
        
        const spec = {
            values: [],
            price: cells[salesAttributeCount + 1].querySelector('input').value,
            quantity: cells[salesAttributeCount + 2].querySelector('input').value
        };
        
        // 收集属性值
        for (let i = 1; i <= salesAttributeCount; i++) {
            const input = cells[i].querySelector('input, select');
            spec.values.push(input ? input.value : '');
        }
        
        specs.push(spec);
    });
    return specs;
}

// 获取详情图片数据
function getDetailImages() {
    const images = [];
    document.querySelectorAll('#detailImages .detail-image-upload').forEach(upload => {
        const preview = upload.querySelector('.preview-image');
        if (preview && preview.style.display !== 'none' && preview.src) {
            images.push(preview.src);
        }
    });
    return images;
}

// 显示消息
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
} 