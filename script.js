            // --- 1- XÁC THỰC DỮ LIỆU THÔNG TIN CÔNG TRÌNH KHAI BÁO CÓ ÂM HAY KHÔNG ----------------------->
function validateInput(event) {
    const inputElement = event.target;
    const value = parseFloat(inputElement.value);
    if (!isNaN(value) && value < 0) {
        inputElement.classList.add("input-error");
    } else {
        inputElement.classList.remove("input-error");
    }
}
      
            // --- 2 - TẠO BẢN SAO DỰ ÁN CHO TÍNH NĂNG LƯU MỞ CLOUD------------------------------>
      async function cloneSelectedCloudProject() {
    const projectSelect = document.getElementById('cloudProjectSelect');
    const projectID = projectSelect.value;
    if (!projectID) {
        alert('Vui lòng chọn một dự án từ danh sách để tạo bản sao.');
        return;
    }
    if (!confirm('Bạn có muốn tải dữ liệu của dự án này làm mẫu cho một dự án mới không?')) {
        return;
    }
    const cloneBtn = event.target;
    cloneBtn.disabled = true;
    cloneBtn.textContent = 'Đang tải...';
    await loadProjectFromCloud(projectID, true); // Thêm một tham số để biết đây là chế độ clone
    projectSelect.value = '';
    alert('Đã tạo bản sao thành công. Bây giờ bạn có thể chỉnh sửa và lưu lại thành một dự án mới.');
    cloneBtn.disabled = false;
    cloneBtn.textContent = 'Tạo bản sao';
}
      // --- 3 - ẨN GIAO DIỆN POPUP, DỌN DẸP DỮ LIỆU------------------------------>
function closeLivePreviewModal() {
    document.getElementById('live-preview-modal').classList.add('hidden');
    document.getElementById('live-preview-content').innerHTML = '';
}
	// --- 4 - KIỂM TRA MÃ XÁC NHẬN CỦA NGƯỜI DÙNG ĐỂ KÍCH HOẠT TÍNH NĂNG CAO CẤP------------------------------>
function handleExportClick(type) {
    if (isUserValidated) {
        if (type === 'excel') exportToExcel();
        if (type === 'quote') printQuote(false);
    } else {
        if (type === 'excel') {
            postActivationAction = 'downloadExcel';
        } else if (type === 'quote') {
            postActivationAction = 'downloadQuote';
        }
        const modalTitle = document.getElementById('live-preview-title');
        const modalContent = document.getElementById('live-preview-content');
        modalTitle.textContent = (type === 'excel') ? 'Bản xem trước File Excel' : 'Bản xem trước Báo giá';
        modalContent.innerHTML = (type === 'excel') ? generateExcelPreviewHTML() : printQuote(true);
        document.getElementById('live-preview-modal').classList.remove('hidden');
    }
}
	// --- 5 - TẠO BẢNG XEM TRƯỚC DỰ TOÁN CHI TIẾT DƯỚI DẠNG HTML------------------------------>
function generateExcelPreviewHTML() {
    if (!estimateTable) return '<p>Không có dữ liệu để xem trước.</p>';
    const allData = estimateTable.getSourceData();
    const hiddenRowsPlugin = estimateTable.getPlugin('hiddenRows');
    const hiddenRowIndexes = new Set(hiddenRowsPlugin.getHiddenRows());
    const dataToExport = allData.filter((row, index) => !hiddenRowIndexes.has(index));
    // Bắt đầu tạo chuỗi HTML cho bảng
    let tableHTML = `
        <table style="width:100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background-color: #004080; color: white; text-align: center;">
                    <th style="border: 1px solid #ccc; padding: 8px;">STT</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Hạng mục</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">ĐVT</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Chủng loại/ Quy cách</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Số lượng</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Hệ số</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Tổng SL</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Đơn giá</th>
                    <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Thành tiền</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Ghi chú</th>
                </tr>
            </thead>
            <tbody>
    `;
    dataToExport.forEach(row => {
        if (!row || !row.category) return;
        const isMainTotal = /^\d+$/.test(row.category) && row.category.indexOf('.') === -1;
        const isSubTotal = /^\d+\.\d+$/.test(row.category) && !/^\d+\.\d+\.\d+$/.test(row.category);
        const isGrandTotal = row.category === 'TONG';
        let rowStyle = '';
        if (isGrandTotal) {
            rowStyle = 'font-weight: bold; font-size: 16px; background-color: #004080; color: white;';
        } else if (isMainTotal) {
            rowStyle = 'font-weight: bold; background-color: #e9ecef;';
        } else if (isSubTotal) {
            rowStyle = 'font-weight: bold; background-color: #f8f9fa;';
        }
        tableHTML += `<tr style="${rowStyle}">
            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${row.category}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">${row.item}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${row.unit}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">${row.type_origin || ''}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${(row.quantity !== undefined && row.quantity !== '') ? Number(row.quantity).toLocaleString('vi-VN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${(row.coefficient !== undefined && row.coefficient !== '') ? Number(row.coefficient).toLocaleString('vi-VN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${(row.total_quantity !== undefined && row.total_quantity !== '') ? Number(row.total_quantity).toLocaleString('vi-VN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${(row.unit_price !== undefined && row.unit_price !== '') ? Number(row.unit_price).toLocaleString('vi-VN') : ''}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${Number(row.total_cost || 0).toLocaleString('vi-VN')}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">${row.note || ''}</td>
        </tr>`;
    });
    tableHTML += '</tbody></table>';
    return tableHTML;
}
	// --- 6 - CHỨC NĂNG TĂNG GIẢM GIÁ------------------------------>
function openBulkUpdateModal() {
    if (!estimateTable) return;
    const selected = estimateTable.getSelected();
    if (!selected || selected.length === 0) {
        alert('Vui lòng chọn một hoặc nhiều dòng trong bảng để điều chỉnh tăng giảm giá.');
        return;
    }
    const percentage = prompt("Nhập phần trăm thay đổi đơn giá (ví dụ: nhập 10 để tăng 10%, nhập -5 để giảm 5%):", "10");
    if (percentage === null || isNaN(parseFloat(percentage))) {
        return; // Người dùng hủy hoặc nhập không phải số
    }
    applyBulkUpdate(parseFloat(percentage));
}
function applyBulkUpdate(percentage) {
    const selectedRanges = estimateTable.getSelected();
    const changeFactor = 1 + (percentage / 100);
    estimateTable.batch(() => {
        selectedRanges.forEach(range => {
            const startRow = Math.min(range[0], range[2]);
            const endRow = Math.max(range[0], range[2]);
            for (let i = startRow; i <= endRow; i++) {
                const currentPrice = parseFloat(estimateTable.getDataAtCell(i, 7)) || 0;
                const newPrice = Math.round(currentPrice * changeFactor);
                estimateTable.setDataAtCell(i, 7, newPrice); // Cột 7 là cột Đơn giá
            }
        });
    });
    // Sau khi cập nhật xong, phải tính toán lại tất cả
    calculateAllSubTotals();
    updateAndRenderGrandTotal();
}      
      
	// --- 7 - ĐÁNH DẤU CÁC BƯỚC TIẾN TRÌNH THAO TÁC NHẬP LIỆU ĐỂ NGƯỜI DÙNG DỄ THEO DÕI------------------------------>
       let currentStep = 0; // Bước hiện tại, bắt đầu từ 0
const steps = document.querySelectorAll(".wizard-step");
const progressSteps = document.querySelectorAll(".progress-step");
progressSteps.forEach((step, index) => {
    step.addEventListener('click', () => {
        if (index === 4) {
            progressSteps.forEach((p, i) => {
                if (i <= 4) { 
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });
           openEstimateModal();
        } else {
            currentStep = index;
            showStep(currentStep);
        }
    });
});
function showStep(stepIndex) {
    steps.forEach(step => {
        step.classList.remove('active');
    });
    if (steps[stepIndex]) {
        steps[stepIndex].classList.add('active');
    }
    progressSteps.forEach((progress, index) => {
        if (index <= stepIndex) {
            progress.classList.add('active');
        } else {
            progress.classList.remove('active');
        }
    });
    if (stepIndex === steps.length - 1) {
        calculateCosts();
    }
   if (stepIndex === 1) {
        drawBuilding();
    }
}

	// --- 8 - TẠO BẢNG PHÂN TÍCH ĐỊNH MỨC VẬT TƯ------------------------------>
function renderMaterialUsageTable(data) {
    const container = document.getElementById('materialUsageTableContainer');
    if (!container) return;
    const standardRates = {
        '2.1.1': { name: 'Thép xây dựng', unit: 'kg/m²', rate: 40 },
        '2.1.2': { name: 'Xi măng', unit: 'kg/m²', rate: 110 },
        '2.1.8': { name: 'Gạch xây', unit: 'viên/m²', rate: 150 },
        // Bổ sung các vật tư mới
        '2.1.3': { name: 'Đá 1x2', unit: 'm³/m²', rate: 0.25 },
        '2.1.5': { name: 'Cát vàng bê tông', unit: 'm³/m²', rate: 0.15 },
        '2.1.6': { name: 'Cát xây tô', unit: 'm³/m²', rate: 0.20 },
    };
    const totalArea = parseFloat(document.getElementById('totalArea').value) || 0;
    if (totalArea === 0) {
        container.innerHTML = '<p class="text-xl">Không có diện tích để phân tích.</p>';
        return;
    }
    let tableHTML = `
        <table class="w-full text-xl border-collapse">
            <thead>
                <tr class="bg-gray-200">
                    <th class="p-3 text-left border-b-2 border-gray-300 font-bold">Vật tư</th>
                    <th class="p-3 border-b-2 border-gray-300 font-bold">Đơn vị</th>
                    <th class="p-3 text-right border-b-2 border-gray-300 font-bold">Định mức Dự án</th>
                    <th class="p-3 text-right border-b-2 border-gray-300 font-bold">Định mức Tham khảo</th>
                    <th class="p-3 text-right border-b-2 border-gray-300 font-bold">Chênh lệch</th>
                </tr>
            </thead>
            <tbody>
    `;
    // Lặp qua danh sách vật tư đã định nghĩa
    Object.keys(standardRates).forEach((categoryCode, index) => {
        const standard = standardRates[categoryCode];
        const projectItem = data.find(row => row.category === categoryCode);
        // Thêm màu nền xen kẽ cho các dòng
        const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        if (projectItem) {
            const projectUsage = (projectItem.total_quantity || 0) / totalArea;
            const difference = ((projectUsage / standard.rate) - 1) * 100;
            const diffColor = Math.abs(difference) > 15 ? 'text-red-500 font-bold' : 'text-green-600';
            tableHTML += `
                <tr class="${rowBg}">
                    <td class="p-3 border-b border-gray-200">${standard.name}</td>
                    <td class="p-3 text-center border-b border-gray-200">${standard.unit}</td>
                    <td class="p-3 text-right border-b border-gray-200">${projectUsage.toFixed(2)}</td>
                    <td class="p-3 text-right border-b border-gray-200">${standard.rate.toFixed(2)}</td>
                    <td class="p-3 text-right border-b border-gray-200 ${diffColor}">${difference.toFixed(1)}%</td>
                </tr>
            `;
        }
    });
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}
      
	// --- 9 - VẼ BIỂU ĐỒ PHÂN BỔ CHI PHÍ THEO TẦNG------------------------------>
function renderFloorCostChart(data) {
    const canvas = document.getElementById('floorCostChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Lấy trạng thái của checkbox "Chỉ tính phần thô"
    const isRoughOnly = document.getElementById('showRoughOnlyToggle').checked;
    // Lấy diện tích thô của từng tầng (giữ nguyên)
    const floorAreas = [];
    // ... (Toàn bộ phần code lấy diện tích các tầng giữ nguyên như cũ)
    const foundationArea = parseFloat(document.getElementById('foundationArea').value) || 0;
    const basementArea = parseFloat(document.getElementById('basementArea').value) || 0;
    if (foundationArea > 0 || basementArea > 0) {
        let name = [foundationArea > 0 ? 'Móng' : null, basementArea > 0 ? 'Hầm' : null].filter(Boolean).join(' & ');
        floorAreas.push({ name: name, area: foundationArea + basementArea });
    }
    const groundFloorArea = parseFloat(document.getElementById('groundFloorArea').value) || 0;
    if (groundFloorArea > 0) floorAreas.push({ name: 'Tầng 1', area: groundFloorArea });
    const mezzanineArea = parseFloat(document.getElementById('mezzanineArea').value) || 0;
    if (mezzanineArea > 0) floorAreas.push({ name: 'Tầng lửng', area: mezzanineArea });
    const numFloors = parseInt(document.getElementById('numFloors').value) || 0;
    for (let i = 2; i <= numFloors + 1; i++) {
        const floorArea = parseFloat(document.getElementById(`floor${i}Area`)?.value) || 0;
        if (floorArea > 0) {
            floorAreas.push({ name: `Tầng ${i}`, area: floorArea });
        }
    }
    const roofArea = parseFloat(document.getElementById('roofArea').value) || 0;
    const terraceArea = parseFloat(document.getElementById('terraceArea').value) || 0;
    if (roofArea > 0 || terraceArea > 0) {
        let name = [terraceArea > 0 ? 'Sân thượng' : null, roofArea > 0 ? 'Tum/Mái' : null].filter(Boolean).join(' & ');
        floorAreas.push({ name: name, area: roofArea + terraceArea });
    }
    const activeFloors = floorAreas.filter(f => f.area > 0);
    const totalRawArea = activeFloors.reduce((sum, f) => sum + f.area, 0);
    // Lấy tổng chi phí của các nhóm
    const totalLaborCost = data.find(row => row.category === '1.1')?.total_cost || 0;
    const totalRoughCost = data.find(row => row.category === '2')?.total_cost || 0;
    const totalFinishingCost = data.find(row => row.category === '3')?.total_cost || 0;
    const totalOutsourcedCost = data.find(row => row.category === '4')?.total_cost || 0;
   // Chuẩn bị datasets CÓ ĐIỀU KIỆN
    const labels = activeFloors.map(f => f.name);
    // Luôn có 2 dataset cơ bản: Nhân công và Vật liệu thô
    const datasets = [
        { label: 'Nhân công', data: activeFloors.map(f => totalRawArea > 0 ? Math.round((f.area / totalRawArea) * totalLaborCost) : 0), backgroundColor: '#FF6384' },
        { label: 'Vật liệu thô', data: activeFloors.map(f => totalRawArea > 0 ? Math.round((f.area / totalRawArea) * totalRoughCost) : 0), backgroundColor: '#36A2EB' }
    ];
    // Chỉ thêm dataset Hoàn thiện và Giao khoán nếu KHÔNG tick chọn "Chỉ tính phần thô"
    if (!isRoughOnly) {
        datasets.push({ label: 'Vật liệu hoàn thiện', data: activeFloors.map(f => totalRawArea > 0 ? Math.round((f.area / totalRawArea) * totalFinishingCost) : 0), backgroundColor: '#FFCE56' });
        datasets.push({ label: 'Giao khoán', data: activeFloors.map(f => totalRawArea > 0 ? Math.round((f.area / totalRawArea) * totalOutsourcedCost) : 0), backgroundColor: '#9966FF' });
    }
    // Vẽ biểu đồ (Phần còn lại giữ nguyên)
    if (window.floorChart instanceof Chart) {
        window.floorChart.destroy();
    }
    window.floorChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Chi phí ước tính cho mỗi tầng' },
                datalabels: {
                    formatter: function(value, context) {
                        const total = context.chart.data.datasets.reduce((sum, dataset) => sum + dataset.data[context.dataIndex], 0);
                        if (context.datasetIndex === context.chart.data.datasets.length - 1) {
                            return Math.round(total / 1000000) + ' Tr';
                        } else {
                            return '';
                        }
                    },
                    color: '#000000',
                    anchor: 'end',
                    align: 'end',
                    offset: 8,
                    font: { weight: 'bold', size: 14 }
                }
            },
            scales: {
                x: { stacked: true, title: { display: true, text: 'Chi phí (triệu đồng)' }, ticks: { callback: value => value / 1000000 } },
                y: { stacked: true }
            }
        },
        plugins: [ChartDataLabels]
    });
}
      
	// --- 10 - VẼ BIỂU ĐỒ VẬT LIỆU THÔ------------------------------>
function renderRoughMaterialsChart(data) {
    const canvas = document.getElementById('roughMaterialsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const roughItems = {
        'Vật liệu xây dựng': data.find(row => row.category === '2.1')?.total_cost || 0,
        'Vật liệu âm sàn, tường': data.find(row => row.category === '2.2')?.total_cost || 0,
    };
    if (window.roughChart instanceof Chart) {
        window.roughChart.destroy();
    }
    window.roughChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(roughItems),
            datasets: [{
                label: 'Chi phí (vnđ)',
                data: Object.values(roughItems),
                backgroundColor: '#4BC0C0', // Màu xanh
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            // --- BẮT ĐẦU DÁN ĐOẠN MÃ VÀO ĐÂY ---
        scales: {
            x: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return value / 1000000;
                    }
                },
                title: {
                    display: true,
                    text: 'Chi phí (triệu đồng)'
                }
            }
        },
            plugins: {
                legend: { display: false },
                datalabels: {
                    formatter: (value) => {
                        if (value === 0) return '';
                        const millions = (value / 1000000).toFixed(1);
                        return millions + ' Tr';
                    },
                    color: '#333',
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

      	// --- 11 - VẼ BIỂU ĐỒ GIAO KHOÁN------------------------------>
function renderOutsourcedItemsChart(data) {
    const canvas = document.getElementById('outsourcedItemsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const outsourcedItems = {
        'Cửa & Vách kính': data.find(row => row.category === '4.1')?.total_cost || 0,
        'Cầu thang': data.find(row => row.category === '4.2')?.total_cost || 0,
        'Đá granite': data.find(row => row.category === '4.3')?.total_cost || 0,
        'Đóng trần': data.find(row => row.category === '4.4')?.total_cost || 0,
        'Hệ kim khí': data.find(row => row.category === '4.5')?.total_cost || 0,
        'Thiết bị & Nội thất': data.find(row => row.category === '4.6')?.total_cost || 0,
        'Hạng mục khác': data.find(row => row.category === '4.7')?.total_cost || 0,
    };
    if (window.outsourcedChart instanceof Chart) {
        window.outsourcedChart.destroy();
    }
    window.outsourcedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(outsourcedItems),
            datasets: [{
                label: 'Chi phí (vnđ)',
                data: Object.values(outsourcedItems),
                backgroundColor: '#FF6384', // Màu đỏ
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return value / 1000000;
                    }
                },
                title: {
                    display: true,
                    text: 'Chi phí (triệu đồng)'
                }
            }
        },
            plugins: {
                legend: { display: false },
                datalabels: {
                    formatter: (value) => {
                        if (value === 0) return '';
                        const millions = (value / 1000000).toFixed(1);
                        return millions + ' Tr';
                    },
                    color: '#333',
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
      
            	// --- 12 - HÀM MỞ ĐÓNG POPUP PHÂN TÍCH------------------------------>
function openCurrentAnalysisModal() {
    if (!estimateData || estimateData.length === 0) {
        alert('Vui lòng tính toán chi phí trước khi xem phân tích.');
        return;
    }
    document.getElementById('currentAnalysisModal').classList.remove('hidden');
    runCurrentProjectAnalysis(); // Chạy phân tích ngay khi mở
}
function closeCurrentAnalysisModal() {
    document.getElementById('currentAnalysisModal').classList.add('hidden');
}
function runCurrentProjectAnalysis() {
    const isRoughOnly = document.getElementById('showRoughOnlyToggle').checked;
    const finishingChartContainer = document.getElementById('finishingChartContainer');
    const outsourcedChartContainer = document.getElementById('outsourcedChartContainer');
    renderKPIs(estimateData);
    renderMainCategoriesChart(estimateData);
    renderRoughMaterialsChart(estimateData);
    renderFloorCostChart(estimateData);
    renderMaterialUsageTable(estimateData);
    if (isRoughOnly) {
        if(finishingChartContainer) finishingChartContainer.style.display = 'none';
        if(outsourcedChartContainer) outsourcedChartContainer.style.display = 'none';
    } else {
        if(finishingChartContainer) finishingChartContainer.style.display = 'block';
        if(outsourcedChartContainer) outsourcedChartContainer.style.display = 'block';
        renderFinishingItemsChart(estimateData);
        renderOutsourcedItemsChart(estimateData);
    }
}

            	// --- 13 - HÀM HIỂN THỊ CÁC THẺ KPI------------------------------>
function renderKPIs(data) {
    const container = document.getElementById('kpiContainer');
    if (!container) return;
    // 1. Lấy "Giá chào"
    const isRoughOnly = document.getElementById('showRoughOnlyToggle').checked;
    const offerPriceString = isRoughOnly 
        ? document.getElementById('totalRoughCost').value 
        : document.getElementById('totalFullCost').value;
    const offerPrice = parseFloat(offerPriceString.replace(/\D/g, '')) || 0;
    // 2. Lấy "Dự toán"
    const estimateCost = data.find(row => row.category === 'TONG')?.total_cost || 0;
    // 3. Tính "Lợi nhuận" và Tỷ lệ %
    const profit = offerPrice - estimateCost;
    const profitPercentage = estimateCost > 0 ? (profit / estimateCost) * 100 : 0;
    // 4. Lấy các giá trị có sẵn
    const totalArea = parseFloat(document.getElementById('totalArea').value) || 0;
    const costPerSqm = totalArea > 0 ? Math.round(estimateCost / totalArea) : 0;
    // 5. Tạo cấu trúc 5 KPI
    const kpis = [
        { label: 'Giá chào', value: offerPrice.toLocaleString('vi-VN') + ' vnđ', icon: '🏷️' },
        { label: 'Dự toán', value: estimateCost.toLocaleString('vi-VN') + ' vnđ', icon: '🧾' },
        { 
            label: 'Lợi nhuận', 
            value: `${profit.toLocaleString('vi-VN')} vnđ <br> <span class="text-green-600 font-semibold">(${profitPercentage.toFixed(2)}%)</span>`, 
            icon: '📈' 
        },
        { label: 'Tổng Diện tích', value: totalArea.toFixed(2) + ' m²', icon: '🏠' },
        { label: 'Chi phí / m²', value: costPerSqm.toLocaleString('vi-VN') + ' vnđ', icon: '💲' }
    ];
    // 6. Hiển thị kết quả ra giao diện
    container.innerHTML = kpis.map(kpi => `
        <div class="bg-gray-100 p-4 rounded-lg text-center border">
            <div class="text-4xl mb-2">${kpi.icon}</div>
            <div class="text-lg font-semibold">${kpi.label}</div>
            <div class="text-xl text-blue-600 font-bold">${kpi.value}</div>
        </div>
    `).join('');
}

            	// --- 14 - HÀM VẼ BIỂU ĐỒ TỶ TRỌNG HẠNG MỤC CHÍNH------------------------------>
function renderMainCategoriesChart(data) {
    const canvas = document.getElementById('mainCategoriesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chartData = {
        'Tổ chức sản xuất': data.find(row => row.category === '1')?.total_cost || 0,
        'Vật liệu thô': data.find(row => row.category === '2')?.total_cost || 0,
        'Vật liệu hoàn thiện': data.find(row => row.category === '3')?.total_cost || 0,
        'Giao khoán': data.find(row => row.category === '4')?.total_cost || 0,
    };
    if (window.mainChart instanceof Chart) {
        window.mainChart.destroy();
    }
    window.mainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(chartData),
            datasets: [{
                data: Object.values(chartData),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', // Chuyển chú thích xuống dưới
                },
                datalabels: {
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = (value / total * 100);
                        // Chỉ hiển thị số nếu % > 1 để tránh rối
                        return percentage > 1 ? percentage.toFixed(1) + '%' : '';
                    },
                    color: '#ffffff',
                    font: {
                        weight: 'bold',
                        size: 14,
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Kích hoạt plugin
    });
}

            	// --- 15 - HÀM VẼ BIỂU ĐỒ CHI TIẾT HẠNG MỤC HOÀN THIỆN------------------------------>
function renderFinishingItemsChart(data) {
    const canvas = document.getElementById('finishingItemsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const finishingItems = {
        'Gạch ốp lát': data.find(row => row.category === '3.1')?.total_cost || 0,
        'Sơn nước': data.find(row => row.category === '3.2')?.total_cost || 0,
        'Thiết bị điện': data.find(row => row.category === '3.3')?.total_cost || 0,
        'Thiết bị vệ sinh': data.find(row => row.category === '3.4')?.total_cost || 0,
    };
    if (window.finishingChart instanceof Chart) {
        window.finishingChart.destroy();
    }
    window.finishingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(finishingItems),
            datasets: [{
                label: 'Chi phí (vnđ)',
                data: Object.values(finishingItems),
                backgroundColor: '#FF9F40',
            }]
        },
        options: {
            indexAxis: 'y', // Biểu đồ cột ngang
            responsive: true,
            maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return value / 1000000;
                    }
                },
                title: {
                    display: true,
                    text: 'Chi phí (triệu đồng)'
                }
            }
        },
            plugins: {
                legend: { display: false },
                datalabels: {
                    formatter: (value) => {
                        if (value === 0) return '';
                        // Chuyển đổi sang triệu đồng
                        const millions = (value / 1000000).toFixed(1);
                        return millions + ' Tr';
                    },
                    color: '#333',
                    anchor: 'end',
                    align: 'end',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Kích hoạt plugin
    });
}
      
                  	// --- 16 - HÀM ẨN DÒNG TRỐNG, TÍNH PHẦN THÔ, CẬP NHẬT LẠI BẢNG DỰ TOÁN------------------------------>
  function refreshTableDisplay() {
    const showRoughOnlyToggle = document.getElementById('showRoughOnlyToggle');
    const isRoughOnly = showRoughOnlyToggle ? showRoughOnlyToggle.checked : false;
    const totalFullCostDisplay = document.getElementById('modalTotalFullCostDisplay');
    if (totalFullCostDisplay) {
        let offerPriceText;
        if (isRoughOnly) {
            // Lấy giá trị từ ô "Chi phí phần thô" ở giao diện chính
            offerPriceText = document.getElementById('totalRoughCost').value;
        } else {
            // Lấy giá trị từ ô "Chi phí trọn gói" ở giao diện chính
            offerPriceText = document.getElementById('totalFullCost').value;
        }
        // Cập nhật trực tiếp vào ô hiển thị Chào giá
        totalFullCostDisplay.textContent = offerPriceText;
    }
    if (!estimateTable) return;
    updateOverheadCosts();
    calculateAllSubTotals();
    updateAndRenderGrandTotal();
    estimateTable.loadData(estimateData);
    const hideEmptyToggle = document.getElementById('hideEmptyRowsToggle');
    const hiddenRowsPlugin = estimateTable.getPlugin('hiddenRows');
    const allData = estimateTable.getSourceData();
    const rowsToHide = new Set();
    if (hideEmptyToggle.checked) {
        allData.forEach((row, index) => {
            if (!row.total_cost || row.total_cost === 0) {
                rowsToHide.add(index);
            }
        });
    }
    if (showRoughOnlyToggle.checked) {
        allData.forEach((row, index) => {
            const category = String(row.category || '');
            if (category.startsWith('3') || category.startsWith('4')) {
                rowsToHide.add(index);
            }
        });
    }
    if (rowsToHide.size > 0) {
        hiddenRowsPlugin.hideRows(Array.from(rowsToHide));
    }
    estimateTable.render();
const analysisModal = document.getElementById('currentAnalysisModal');
    if (analysisModal && !analysisModal.classList.contains('hidden')) {
        runCurrentProjectAnalysis();
    }
}

                  	// --- 16 - HÀM LƯU MỞ CLOUD------------------------------>
function openCloudStorageModal() {
    // Lấy tất cả các nút chức năng trong popup Cloud
    const featureButtons = document.querySelectorAll('.cloud-feature-button');
    const authNotice = document.getElementById('cloud-auth-notice');
    const modal = document.getElementById('cloudStorageModal');
    // Mảng chứa các class của TailwindCSS để làm mờ và vô hiệu hóa nút
    const disabledClasses = ['opacity-50', 'cursor-not-allowed'];
    if (isUserValidated) {
        // NẾU ĐÃ CÓ MÃ: Kích hoạt tất cả các nút
        featureButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove(...disabledClasses);
        });
        // Và ẩn đi dòng thông báo mời nâng cấp
        authNotice.classList.add('hidden');
    } else {
        // NẾU CHƯA CÓ MÃ: Vô hiệu hóa tất cả các nút
        featureButtons.forEach(button => {
            button.disabled = true;
            button.classList.add(...disabledClasses);
        });
        // Và hiển thị dòng thông báo mời nâng cấp
        authNotice.classList.remove('hidden');
    }
    // Luôn luôn mở popup Cloud Storage để người dùng thấy được
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
function closeCloudStorageModal() {
    const modal = document.getElementById('cloudStorageModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
      // Hàm được gọi bởi nút "Mở dự án"========================================
function openSelectedCloudProject() {
    const projectSelect = document.getElementById('cloudProjectSelect');
    const selectedProjectID = projectSelect.value;
    if (!selectedProjectID) {
        alert('Vui lòng chọn một dự án từ danh sách để mở.');
        return;
    }
    // Gọi lại hàm load dự án đã có sẵn
    loadProjectFromCloud(selectedProjectID);
}
// Hàm được gọi bởi nút "Xóa dự án" (PHIÊN BẢN SỬA LỖI LẦN 2 - QUAY VỀ GET)
async function deleteSelectedCloudProject() {
    const deleteBtn = document.getElementById('deleteProjectBtn');
    if (!deleteBtn) return;
    const userID = document.getElementById('userID').value.trim();
    const projectSelect = document.getElementById('cloudProjectSelect');
    const projectID = projectSelect.value;
    if (!userID || !projectID) {
        alert('Vui lòng nhập tài khoản và chọn một dự án để xóa.');
        return;
    }
    const projectName = projectSelect.options[projectSelect.selectedIndex].text.split(' (')[0];
    if (!confirm(`BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN dự án "${projectName}" không? Thao tác này không thể hoàn tác!`)) {
        return;
    }
    const originalBtnText = deleteBtn.textContent;
    try {
        deleteBtn.textContent = 'Đang xóa...';
        deleteBtn.disabled = true;
        // 1. Tạo các tham số để gửi trên URL
        const params = new URLSearchParams({
            action: 'deleteProject', // Hành động xóa
            userID: userID,
            projectID: projectID,
            _v: new Date().getTime() // Tham số chống cache
        });
        // 2. Gửi yêu cầu bằng phương thức GET (mặc định của fetch)
        const requestUrl = `${WEB_APP_URL}?${params.toString()}`;
        const response = await fetch(requestUrl);
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            listCloudProjects(); // Tải lại danh sách
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        // Thay đổi thông báo lỗi để rõ ràng hơn
        alert('Thông báo: ' + error.message );
    } finally {
        if(deleteBtn) {
            deleteBtn.textContent = originalBtnText;
            deleteBtn.disabled = false;
        }
    }
}
      // DÁN HÀM MỚI NÀY VÀO SAU HÀM cloneSelectedCloudProject
function triggerActivationFlow(action) {
    postActivationAction = action; // Gán hành động
    // Đóng các popup hiện tại
    closeLivePreviewModal();
    closeCloudStorageModal();
    // Mở popup nhập mã
    showLicenseModal();
}
      //========================================
function handleOpenSelectedCloudProject(selectElement) {
    // Giờ không cần tìm bằng getElementById nữa
    const selectedProjectID = selectElement.value;
    if (!selectedProjectID) {
        // Không làm gì nếu người dùng chọn dòng "-- Chọn một dự án --"
        return;
    }
    // Gọi lại hàm load dự án đã có sẵn
    loadProjectFromCloud(selectedProjectID);
}
     // Hàm lưu dự án hiện tại lên đám mây
async function saveProjectToCloud() {
    const saveBtn = document.getElementById('saveToCloudBtn');
    if (!saveBtn) return;
    const originalBtnText = saveBtn.textContent;
    const userID = document.getElementById('userID').value.trim();
    if (!userID) {
        alert('Vui lòng nhập "Tên tài khoản" (SĐT) để có thể lưu dự án lên đám mây');
        return;
    }
    let projectName = '';
    const projectSelect = document.getElementById('cloudProjectSelect');
    if (projectSelect && projectSelect.selectedIndex > 0) {
        const selectedOptionText = projectSelect.options[projectSelect.selectedIndex].text;
        projectName = selectedOptionText.split(' (')[0].trim();
    }
    if (!projectName) {
        projectName = prompt("Nhập tên cho dự án này:", `DuToan_${new Date().toISOString().slice(0, 10)}`);
        if (!projectName) return;
    }
    try {
        saveBtn.textContent = 'Đang lưu...';
        saveBtn.disabled = true;
        const listParams = new URLSearchParams({ action: 'listProjects', userID: userID, _v: new Date().getTime() });
        const listResponse = await fetch(`${WEB_APP_URL}?${listParams.toString()}`);
        const listResult = await listResponse.json();
        if (listResult.status === 'success' && listResult.data) {
            const isDuplicate = listResult.data.some(project => project.name === projectName);
            if (isDuplicate) {
                if (!confirm(`Tên dự án "${projectName}" đã tồn tại.\nBạn có muốn ghi đè lên nó không?`)) {
                    return;
                }
            }
        }
        // Bắt đầu tạo dữ liệu để lưu
        const snapshot = {
            formState: {},
            estimateData: estimateTable.getSourceData()
        };
        const inputIdsToSave = [
            'location', 'buildingType', 'facade', 'architecture', 'smallFloorAreaExtraCost',
            'road', 'bedrooms', 'bathrooms', 'mezzanineCount', 'balconies','altarRooms',
            'familyRooms', 'readingRooms', 'dressingRooms', 'foundationType', 'foundationArea',
            'basementType', 'basementArea', 'groundFloorType', 'groundFloorArea', 'mezzanineArea',
            'numFloors', 'terraceArea','uncoveredBalconyArea', 'roofArea', 'roofType2', 'roofType4', 'roofType5', 'roofArea2', 'roofArea4', 'roofArea5', 'roofType3',
            'roofArea3', 'frontYardType', 'frontYardArea', 'backYardType', 'backYardArea',
            'pileLength', 'elevatorStops', 'poolArea'
        ];
        inputIdsToSave.forEach(id => {
            const element = document.getElementById(id);
            if (element) snapshot.formState[id] = element.value;
        });

        // --- SỬA LỖI 1: Thêm ID của 2 nút tick vào danh sách lưu ---
        const checkboxIdsToSave = [
            'isDifficultConstruction', 'isSplitLevel', 'neighborSupport',
            'pileDriving', 'elevator', 'pool', 'BVXPXD', 'TK',
            'hideEmptyRowsToggle', 'showRoughOnlyToggle' // Thêm 2 ID vào đây
        ];
        checkboxIdsToSave.forEach(id => {
            const element = document.getElementById(id);
            if (element) snapshot.formState[id] = element.checked;
        });

        // --- SỬA LỖI 2: Tự động tìm và lưu diện tích các tầng đã thêm ---
        const numFloors = parseInt(document.getElementById('numFloors').value) || 0;
        for (let i = 2; i <= numFloors + 1; i++) {
            const floorId = `floor${i}Area`;
            const floorElement = document.getElementById(floorId);
            if (floorElement) {
                snapshot.formState[floorId] = floorElement.value;
            }
        }
        const payload = {
            action: 'saveProject',
            userID: userID,
            projectName: projectName,
            projectData: JSON.stringify(snapshot)
        };
        const saveResponse = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        });
        const saveResult = await saveResponse.json();
        alert(saveResult.message);
        listCloudProjects();
    } catch (error) {
        alert('Đã có lỗi xảy ra trong quá trình lưu dự án: ' + error.message);
    } finally {
        saveBtn.textContent = originalBtnText;
        saveBtn.disabled = false;
    }
}
// Hàm mở Modal chứa danh sách dự án
function openCloudProjectsModal() {
    const userID = document.getElementById('userID').value.trim();
    if (!userID) {
        alert('Vui lòng nhập "Tên tài khoản" (SĐT) để xem các dự án đã lưu.');
        return;
    }
    document.getElementById('cloudProjectsModal').classList.remove('hidden');
    listCloudProjects(); // Gọi hàm tải danh sách
}
// Hàm đóng Modal (HÀM NÀY CÓ THỂ BẠN ĐANG THIẾU)
function closeCloudProjectsModal() {
    document.getElementById('cloudProjectsModal').classList.add('hidden');
}
// Hàm tải và hiển thị danh sách dự án từ đám mây
async function listCloudProjects() {
    // Lấy đối tượng <select> mà chúng ta muốn cập nhật
    const projectSelect = document.getElementById('cloudProjectSelect');
    if (!projectSelect) {
        console.error("Lỗi: Không tìm thấy phần tử 'cloudProjectSelect'.");
        return;
    }
    // Lấy tài khoản người dùng
    const userID = document.getElementById('userID').value.trim();
    if (!userID) {
        // Nếu người dùng xóa hết tài khoản, reset lại dropdown
        projectSelect.innerHTML = '<option value="">-- Nhập tài khoản để xem danh sách --</option>';
        return;
    }
    // Hiển thị trạng thái đang tải ngay trên dropdown
    projectSelect.innerHTML = '<option value="">-- Đang tải danh sách dự án...</option>';
    projectSelect.disabled = true; // Vô hiệu hóa trong khi tải
    try {
        // Tạo URL để gọi API, thêm tham số chống cache (_v)
        const params = new URLSearchParams({ action: 'listProjects', userID: userID, _v: new Date().getTime() });
        const response = await fetch(`${WEB_APP_URL}?${params.toString()}`);
        const result = await response.json();
        // Xóa thông báo "đang tải"
        projectSelect.innerHTML = '';
        if (result.status === 'success' && result.data.length > 0) {
            // Thêm lại lựa chọn mặc định ban đầu
            projectSelect.innerHTML = '<option value="">-- Chọn một dự án để mở --</option>';
            // Lặp qua từng dự án trong dữ liệu trả về
            result.data.forEach(project => {
                // Tạo một phần tử <option> mới
                const option = document.createElement('option');
                // Gán giá trị cho option (đây là ID của dự án, ví dụ: '1720108800000')
                option.value = project.id;
                // Gán nội dung hiển thị cho người dùng (tên và ngày tạo)
                option.textContent = `${project.name} (${new Date(project.id).toLocaleString('vi-VN')})`;
                // Thêm <option> mới vào trong <select>
                projectSelect.appendChild(option);
            });
        } else {
            // Nếu không có dự án nào hoặc có lỗi, hiển thị thông báo
            projectSelect.innerHTML = '<option value="">-- Không tìm thấy dự án nào --</option>';
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách dự án:', error);
        projectSelect.innerHTML = '<option value="">-- Lỗi khi tải, vui lòng thử lại --</option>';
    } finally {
        // Dù thành công hay thất bại, hãy bật lại dropdown
        projectSelect.disabled = false;
    }
}
// Hàm tải dữ liệu của một dự án cụ thể và áp dụng
async function loadProjectFromCloud(projectID, isCloning = false) {
    if (!isCloning && !confirm('Mở dự án này sẽ ghi đè lên công việc hiện tại. Bạn có chắc chắn?')) {
         return;
    }
    const openBtn = document.getElementById('openProjectBtn');
    if (!openBtn) return;
    const originalBtnText = openBtn.textContent;
    const userID = document.getElementById('userID').value.trim();
    try {
        openBtn.textContent = 'Đang mở...';
        openBtn.disabled = true;
        const params = new URLSearchParams({ action: 'getProject', userID: userID, projectID: projectID, _v: new Date().getTime() });
        const response = await fetch(`${WEB_APP_URL}?${params.toString()}`);
        const result = await response.json();
        if (result.status === 'success') {
            const snapshot = JSON.parse(result.data);
            const formState = snapshot.formState;
            
            // Khôi phục trạng thái của tất cả các ô input và checkbox đã lưu
            for (const id in formState) {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = formState[id];
                    } else {
                        element.value = formState[id];
                    }
                }
            }
            // --- SỬA LỖI 2: Áp dụng lại các giá trị đã lưu cho các tầng được tạo tự động ---
            const numFloors = parseInt(formState['numFloors']) || 0;
            const numFloorsInput = document.getElementById('numFloors');
            // Tạm thời đặt về 0 để hàm changeFloors tạo lại đúng số tầng
            numFloorsInput.value = 0; 
            changeFloors(numFloors); // Tạo lại các ô nhập liệu cho các tầng
            // Sau khi các ô nhập liệu đã được tạo, lặp lại để điền giá trị đã lưu
            for (let i = 2; i <= numFloors + 1; i++) {
                const floorId = `floor${i}Area`;
                const floorElement = document.getElementById(floorId);
                if (floorElement && formState[floorId] !== undefined) {
                    floorElement.value = formState[floorId];
                }
            }
            // Cập nhật lại các phần giao diện và dữ liệu khác
            drawBuilding();
            estimateData = snapshot.estimateData;
            if (estimateTable) {
                estimateTable.loadData(estimateData);
            }
            // Chạy lại toàn bộ tính toán và hiển thị
            calculateCosts();
            alert('Đã mở dự án từ đám mây thành công!');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert('Lỗi khi mở dự án từ đám mây: ' + error.message);
    } finally {
        if (openBtn) {
           openBtn.textContent = originalBtnText;
           openBtn.disabled = false;
        }
    }
}
		// --- 17 - HÀM LƯU ĐƠN GIÁ NGƯỜI DÙNG------------------------------>
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCv4CwmRgQSip6FOlH0fltQHMzBR7k_f6Zaf38IqBdT6TXC_cl-2wtfl4o0qfm4vbAng/exec';
async function saveMyPrices() {
    const saveBtn = document.getElementById('saveMyPricesBtn');
    if (!saveBtn) return;
    const originalBtnText = saveBtn.textContent;
    try {
        saveBtn.textContent = 'Đang lưu...';
        saveBtn.disabled = true;
        const userID = document.getElementById('userID').value.trim();
        let priceSetName = document.getElementById('newPriceSetName').value.trim();
        if (!priceSetName) {
            priceSetName = document.getElementById('priceSetName').value;
        }
        if (!userID || !priceSetName) {
            alert('Vui lòng nhập "Tên tài khoản" và "Tên bộ đơn giá" để lưu.');
            // Phải trả lại trạng thái nút trước khi return
            saveBtn.textContent = originalBtnText;
            saveBtn.disabled = false;
            return;
        }
        if (!confirm(`Bạn có chắc muốn lưu (hoặc ghi đè) bộ giá có tên "${priceSetName}" không?`)) {
            // Phải trả lại trạng thái nút trước khi return
            saveBtn.textContent = originalBtnText;
            saveBtn.disabled = false;
            return;
        }
        const allData = estimateTable.getSourceData();
        const pricesToSave = allData
            .filter(row => row.category && typeof row.unit_price === 'number')
            .map(row => ({ category: row.category, unitPrice: row.unit_price }));
        const payload = {
            action: 'save',
            userID: userID,
            priceSetName: priceSetName,
            prices: pricesToSave
        };
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify(payload),
            //mode: 'no-cors' // Thử thêm mode no-cors để tránh một số vấn đề preflight
        });
        // Bây giờ chúng ta có thể đọc được phản hồi chính xác từ server
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message); // Hiển thị thông báo thành công
            document.getElementById('newPriceSetName').value = '';
            setTimeout(() => { loadMyPriceSetList(); }, 1500);
        } else {
            // Hiển thị chính xác thông báo lỗi từ server
            throw new Error(result.message); 
        }
    } catch (error) {
        // Bắt và hiển thị lỗi
        alert('Thông báo: ' + error.message);
    } finally {
        saveBtn.textContent = originalBtnText;
        saveBtn.disabled = false;
    }
}
     async function loadMyPriceSetList() {
    const userID = document.getElementById('userID').value;
    if (!userID) return;
    const priceSetSelect = document.getElementById('priceSetName');
    priceSetSelect.innerHTML = '<option value="">-- Đang tải...</option>';
    try {
        const params = new URLSearchParams({
            action: 'list',
            userID: userID,
            _v: new Date().getTime()
        });
        const requestUrl = `${WEB_APP_URL}?${params.toString()}`;
        const response = await fetch(requestUrl);
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.length > 0) {
            priceSetSelect.innerHTML = '<option value="">-- Chọn bộ đơn giá --</option>';
            result.data.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                priceSetSelect.appendChild(option);
            });
        } else {
            priceSetSelect.innerHTML = '<option value="">-- Chưa có bộ giá nào --</option>';
        }
    } catch (error) {
        priceSetSelect.innerHTML = '<option value="">-- Lỗi khi tải --</option>';
    }
}
async function loadMyPrices() {
    const loadBtn = document.getElementById('loadPricesBtn');
    if (!loadBtn) {
        alert("Lỗi: Không tìm thấy nút bấm 'loadPricesBtn'.");
        return;
    }
    const originalBtnText = loadBtn.textContent;
    try {
        loadBtn.textContent = 'Đang tải...';
        loadBtn.disabled = true;
        const userID = document.getElementById('userID').value;
        const priceSetName = document.getElementById('priceSetName').value;
        if (!userID || !priceSetName) {
            alert('Vui lòng chọn một Bộ đơn giá để lắp.');
            return;
        }
        const params = new URLSearchParams({
            action: 'get_prices',
            userID: userID,
            priceSetName: priceSetName,
            _v: new Date().getTime()
        });
        const requestUrl = `${WEB_APP_URL}?${params.toString()}`;
        const response = await fetch(requestUrl);
        const result = await response.json();
        if (result.status === 'success' && result.data) {
            const pricesFromServer = JSON.parse(result.data);
            const priceMap = new Map(pricesFromServer.map(p => [p.category, p.unitPrice]));
            let updatedCount = 0;
            estimateData.forEach(row => {
                if (priceMap.has(row.category)) {
                    row.unit_price = parseFloat(priceMap.get(row.category));
                    updatedCount++;
                }
            });
            if (estimateTable) { estimateTable.loadData(estimateData); }
            recalculateAllCosts();
            alert(`Tải thành công! Đã cập nhật ${updatedCount} đơn giá.`);
        } else { throw new Error(result.message || 'Không tìm thấy dữ liệu.'); }
    } catch (error) {
        alert('Thông báo: ' + error.message);
    } finally {
        if(loadBtn) {
            loadBtn.textContent = originalBtnText;
            loadBtn.disabled = false;
        }
    }
}
async function deleteMyPriceSet() {
  // --- BẮT ĐẦU THÊM MỚI ---
    const deleteBtn = document.getElementById('deletePriceSetBtn');
    if (!deleteBtn) return;
    const originalBtnText = deleteBtn.textContent;
    // --- KẾT THÚC THÊM MỚI ---
    const userID = document.getElementById('userID').value.trim();
    const priceSetName = document.getElementById('priceSetName').value;
    if (!userID || !priceSetName) {
        alert('Vui lòng nhập "Tên tài khoản" và chọn một Bộ đơn giá để xóa.');
        return;
    }
    if (!confirm(`BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN bộ giá có tên "${priceSetName}" không?`)) {
        return;
    }
    try {
        deleteBtn.textContent = 'Đang xóa...';
        deleteBtn.disabled = true;
        const params = new URLSearchParams({
            action: 'delete',
            userID: userID,
            priceSetName: priceSetName,
            _v: new Date().getTime() // Tham số chống cache
        });
        const requestUrl = `${WEB_APP_URL}?${params.toString()}`;
        const response = await fetch(requestUrl);
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            loadMyPriceSetList(); // Tải lại danh sách sau khi xóa thành công
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert('Thông báo: ' + error.message);
    } finally {
        deleteBtn.textContent = originalBtnText;
        deleteBtn.disabled = false;
    }
}
                  	// --- 18 - TÍNH TOÁN LẠI TOÀN BỘ CHI PHÍ SAU KHI LOAD ĐƠN GIÁ MỚI VÀO------------------------------>
function recalculateAllCosts() {
    if (!estimateData) return;
    // 1. Tính toán lại "Thành tiền" cho từng hạng mục chi tiết
    estimateData.forEach(row => {
        // Chỉ tính toán cho các hạng mục chi tiết, không tính cho các dòng tổng
        if (row.category && row.category.includes('.')) {
            const totalQuantity = parseFloat(row.total_quantity) || 0;
            const unitPrice = parseFloat(row.unit_price) || 0;
            row.total_cost = Math.round(totalQuantity * unitPrice);
        }
    });
    // 2. Gọi lại hàm tính tổng phụ (ví dụ: 1.1, 2.2, 3.4...) và tổng chính (1, 2, 3, 4)
    calculateAllSubTotals();
    // 3. Gọi lại hàm cập nhật dòng TỔNG CHI PHÍ XÂY DỰNG cuối cùng
    updateAndRenderGrandTotal();
}

      // --- 18 - HÀM LẤY HỆ SỐ ĐIỀU CHỈNH VẬT TƯ THEO M2 SÀN TỪ GOOGLE SHEET------------------------------>
async function fetchDataFromSheet() {
  // !!! DÁN URL DỮ LIỆU DỰ ÁN CỦA BẠN VÀO ĐÂY !!!
  const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwsqPdZJ-NwO6pIfdEKluzO75BlOrYpr-kCkVkwKK8_tFXKovOcgMQVgSYS6nwb0jMW/exec';
 let postActivationAction = null; // Biến toàn cục để ghi nhớ hành động 
  try {
    const response = await fetch(SHEET_API_URL);
    if (!response.ok) {
      throw new Error('Lỗi mạng hoặc không thể kết nối tới hệ thống');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu từ hệ thống:', error);
    alert('Không thể tải được đơn giá và định mức từ hệ thống. Vui lòng kiểm tra lại kết nối mạng và URL.');
    return null; // Trả về null nếu có lỗi
  }
}
      // --- 19 - HÀM LƯU MÃ XÁC NHẬN CHO LẦN SAU KHÔNG CẦN NHẬP LẠI------------------------------>    
// Khai báo biến trạng thái và DOM
let isUserValidated = false;
let licenseOverlay;
let statusMsg;
// Hàm điều khiển hiển thị modal
function showLicenseModal() {
    if (licenseOverlay) {
        // Đảm bảo các trường được reset khi mở lại modal
        const keyInput = document.getElementById('custom-key-input');
        if (keyInput) {
            // Thay vì xóa trắng, hãy thử điền mã đã lưu
            const savedKey = localStorage.getItem('lastActivationKey');
            if (savedKey) {
                keyInput.value = savedKey; // Điền mã đã lưu
            } else {
                keyInput.value = ''; // Chỉ xóa trắng nếu không có mã nào được lưu
            }
        }
        if (statusMsg) {
            statusMsg.textContent = '';
        }
        licenseOverlay.classList.add('visible');
    }
}
function hideLicenseModal() {
    if (licenseOverlay) {
        licenseOverlay.classList.remove('visible');
    }
}
      
            // --- 20 - HÀM kIỂM TRA QUYỀN TRUY CẬP------------------------------>    
// BIẾN MỚI: Dùng để lưu hành động sẽ thực hiện sau khi xác thực thành công
let afterValidationAction = null;
// Chấp nhận một tham số là hành động cần làm
function requestPremiumFeature(onSuccessCallback) {
    if (isUserValidated) {
        // Nếu đã xác thực, thực hiện hành động ngay
        if (typeof onSuccessCallback === 'function') {
            onSuccessCallback();
        }
    } else {
        // Nếu chưa, lưu lại hành động và hiển thị pop-up
        afterValidationAction = onSuccessCallback;
        showLicenseModal();
    }
}
      // Hàm này được gọi khi xác thực thành công để cấp quyền truy cập
function grantAccess(message) {
    if (statusMsg) {
        statusMsg.textContent = message;
        statusMsg.style.color = 'green';
    }
    isUserValidated = true;
    setTimeout(() => {
        hideLicenseModal();
        // Kiểm tra và thực hiện hành động đã được lưu
        if (typeof afterValidationAction === 'function') {
            afterValidationAction();
            afterValidationAction = null; // Xóa hành động sau khi đã thực hiện
        }
    }, 1500);
}
      
            // --- 21 - HÀM XÁC THỰC MÃ XÁC NHẬN TỪ GOOGLE SHEET VÀ POPUP NHẬP MÃ KÍCH HOẠT------------------------------>    
async function handleKeyValidation() {
    const keyInput = document.getElementById('custom-key-input');
    const userKey = keyInput.value.trim();
    // !!! QUAN TRỌNG: Dán URL Web App của bạn đã triển khai vào đây
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPXtKNJlgA3M5d_zlgHhUKJnUBRv34Yy9p4JHATTolkGi2iDe97nO5skaYUkVdxUAcpA/exec';
    if (!userKey) {
        statusMsg.textContent = 'Vui lòng nhập mã xác nhận.';
        statusMsg.style.color = 'red';
        return;
    }
    // 1. Tạo một "dấu vân tay" đơn giản cho thiết bị
    const getDeviceId = () => {
        const navigator = window.navigator;
        const screen = window.screen;
        let deviceId = navigator.userAgent.replace(/[\s\(\);,]/g, '');
        //deviceId += `${screen.height}x${screen.width}x${screen.colorDepth}`;
        deviceId += navigator.language;
        return deviceId;
    };
    const deviceId = getDeviceId();
    statusMsg.textContent = 'Đang kiểm tra mã...';
    statusMsg.style.color = 'black';
    try {
        // 2. Gửi cả userKey và deviceId lên máy chủ
        const response = await fetch(`${APPS_SCRIPT_URL}?key=${encodeURIComponent(userKey)}&deviceId=${encodeURIComponent(deviceId)}`);
        if (!response.ok) {
            throw new Error('Lỗi mạng hoặc máy chủ script.');
        }
        const result = await response.json();
        // 3. Xử lý các kết quả trả về từ server
       if (result.status === 'valid') {
    // Các bước cơ bản khi thành công
    localStorage.setItem('lastActivationKey', userKey);
    localStorage.setItem('licenseExpiry', result.expiryDate);
    isUserValidated = true;
    hideLicenseModal();
    // KIỂM TRA HÀNH ĐỘNG ĐÃ GHI NHỚ
    switch (postActivationAction) {
        case 'downloadExcel':
            exportToExcel(); // Tự động tải Excel
            break;
        case 'downloadQuote':
            printQuote(false); // Tự động tải Báo giá
            break;
        case 'refreshCloud':
            openCloudStorageModal(); // Làm mới lại popup Cloud
            break;
        default:
            // Mặc định không làm gì thêm
            break;
    }
    // Reset biến ghi nhớ sau khi đã thực hiện
    postActivationAction = null;
}
        else if (result.status === 'device_mismatch') {
            statusMsg.textContent = 'Thông báo: Mã này đã được kích hoạt trên một thiết bị khác.';
            statusMsg.style.color = 'red';
        } 
        else if (result.status === 'expired') {
            statusMsg.textContent = `Mã này đã hết hạn vào ngày ${result.expiryDate}.`;
            statusMsg.style.color = 'red';
        } else { // Bao gồm cả trường hợp 'invalid' và 'error'
            statusMsg.textContent = result.message || 'Mã xác nhận không hợp lệ.';
            statusMsg.style.color = 'red';
        }
    } catch (error) {
        console.error('Lỗi khi gọi API xác thực:', error);
        statusMsg.textContent = 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.';
        statusMsg.style.color = 'red';
    }
}
// Gán giá trị và thêm sự kiện khi trang đã tải xong
window.addEventListener('DOMContentLoaded', () => {
      // Gán giá trị cho các biến DOM ở đây, đảm bảo HTML đã sẵn sàng
    licenseOverlay = document.getElementById('custom-license-overlay');
    statusMsg = document.getElementById('custom-status-msg');
    const submitBtn = document.getElementById('custom-submit-btn');
    const closeBtn = document.getElementById('custom-close-btn');
    const keyInput = document.getElementById('custom-key-input');
    // Hiển thị thông tin liên hệ Zalo
    const trialKeyHint = document.getElementById('trial-key-hint');
   const userIDInput = document.getElementById('userID'); // Thêm dòng này
    // 1. Tự động điền tài khoản mặc định khi tải trang
    if (userIDInput) {
        userIDInput.value = 'DU LIEU DTC';
    }
    // 2. Tự động tải danh sách bộ giá và dự án của tài khoản mặc định
    loadMyPriceSetList();
    listCloudProjects();
    // --- KẾT THÚC PHẦN CODE MỚI ---
    if (trialKeyHint) {
        trialKeyHint.innerHTML = `Để nhận mã dùng thử liên hệ Zalo: 0968.500.139`;
    }
    // Chỉ thêm sự kiện nếu các nút tồn tại
    if (submitBtn) {
        submitBtn.addEventListener('click', handleKeyValidation);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', hideLicenseModal);
    }
    if (keyInput) {
        keyInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                handleKeyValidation();
            }
        });
    }
    // Khởi tạo các hàm khác của bạn nếu có
    // Ví dụ: changeFloors(0); // Dòng này từ code gốc của bạn, giữ lại nếu cần
});

      
            // --- 22 - HÀM KHÓA CÁC Ô KHÔNG CHO CHỈNH SỬA TRONG DỰ TOÁN CHI TIẾT------------------------------>    
const readOnlyCategories = new Set([
    '1', '2', '3', '4', 'TONG', // Các dòng tổng chính
    '1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', // Các dòng tổng phụ
    '3.1.3', '3.1.4', '3.1.7', // Gạch WC, Keo ron
    '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6', '3.3.7', '3.3.8', '3.3.9', '3.3.16', // Thiết bị điện
    '3.4.1', '3.4.2', '3.4.3', '3.4.4', '3.4.5', '3.4.7', '3.4.8', // Thiết bị vệ sinh
    '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', // Cửa
    '4.2.1', '4.3.1', '4.3.5', '4.4.1', // Cầu thang, trần
    '4.3.2', '4.3.4', '4.5.1', // Granite, lan can
    '4.7.1', '4.7.4', '4.7.5', '4.7.6', '4.7.7', '4.7.8', // Chi phí khác, dịch vụ
      	'2.1.1', // Thép xây dựng
        '2.1.2', // Xi măng
        '2.1.3', // Đá 1x2
        '2.1.4', // Đá 4x6
        '2.1.5', // Cát vàng bê tông hạt lớn
        '2.1.6', // Cát xây tô hạt mịn
        '2.1.7', // Cát nền
        '2.1.8', // Gạch xây
      	'1.2.1', // Chi phí quản lý nhà thầu
     	'1.2.2', // Chi phí hỗ trợ thi công
      	'1.2.3', // Chi phí dự phòng rủi ro
]);
      
 // --- 23 - HÀM KHAI BÁO ĐIỀU CHỈNH ĐƠN GIÁ------------------------------>    
let coefficients = {
    baseLaborCost: 1800000,
    baseRoughCost: 4000000,
    baseFullCost: 6500000,
    buildingType: 0,
    facade: 0,
    road: 0,
    architecture: 0,
  	smallFloorAreaExtraCost: 0,
    neighborSupportPrice: 30000000,
    pilePrice: 320000,
    elevatorPrice: 280000000,
    elevatorStopsPrice: 15000000,
    BVXPXDPrice: 15000,
    DVXPXDPrice: 3500000,
    TKPrice: 150000,
    poolPrice: 5000000
};

 // --- 24 - HÀM TÍNH TỔNG DỰ TOÁN CHI TIẾT------------------------------>    
function calculateTotalEstimate() {
  let total = 0;
  if (!estimateData || !Array.isArray(estimateData)) return 0;
 estimateData.forEach(row => {
                if (dataMap.has(row.category)) {
                    const sheetRow = dataMap.get(row.category);
                    // 1. CẬP NHẬT TÊN HẠNG MỤC (ITEM)
                    // Thêm điều kiện `row.category.includes('.')` để đảm bảo an toàn,
                    // chỉ cập nhật tên cho các hạng mục chi tiết, không đụng đến dòng tổng.
                    if (sheetRow.item && sheetRow.item.trim() !== '' && row.category.includes('.')) {
                        row.item = sheetRow.item;
                    }
                    // 2. CẬP NHẬT ĐƠN GIÁ (UNIT_PRICE) - Giữ nguyên như cũ
                    // Chỉ cập nhật đơn giá nếu nó có trong sheet và không phải là số 0
                    if (sheetRow.unit_price && sheetRow.unit_price > 0) {
                        row.unit_price = sheetRow.unit_price;
                    }
                }
            });
  return total;
}
      
 // --- 25 - HÀM ĐIỀN ĐƠN GIÁ NGƯỜI DÙNG NHẬP VÀO FORM NHẬP THÔNG TIN CÔNG TRÌNH------------------------------>    
function saveCoefficients() {
  const keys = [
    "LaborCost", "RoughCost", "FullCost", "facade",
    "road", "buildingType","smallFloorAreaExtraCost",
    "architecture", "neighborSupportprice", "pilePrice", "elevatorprice",
    "elevatorStopsprice", "BVXPXDprice", "DVXPXDprice", "TKprice", "poolprice"
  ];
  keys.forEach(key => {
    const modalValue = document.getElementById(`modal${key}`)?.value;
    const mainInput = document.getElementById(key.charAt(0).toLowerCase() + key.slice(1));
    if (modalValue && mainInput) {
      mainInput.value = modalValue;
    }
    // Đồng bộ với biến coefficients (nếu cần)
    const coeffKey = Object.keys(coefficients).find(k => k.toLowerCase().includes(key.toLowerCase()));
    if (coeffKey) coefficients[coeffKey] = parseFloat(modalValue);
  });
  closeCoefficientsModal();
}
      
 // --- 26 - HÀM KHAI BÁO HỆ SỐ HAO HỤT VẬT LIỆU------------------------------>    
const defaultCoefficientsMap = {
 	'3.1.1': 1.1, // Ví dụ: Thép xây dựng, mặc định hệ số hao hụt là 1.1
    '3.1.2': 1.1,  // Ví dụ: Gạch xây, mặc định hệ số vỡ, hao hụt là 1.1
    '3.1.3': 1.1, // Gạch lát nền các tầng, hệ số 1.1 như bạn yêu cầu
    '3.1.4': 1.1,
  	'3.1.5': 1.1,
    '3.1.6': 1.1,
  	'3.1.8': 1.1,
  '3.1.9': 1.1,
  '3.1.10': 1.1,
  '3.1.11': 1.1,
  '3.1.12': 1.1,
  '3.1.13': 1.1,
  '3.1.14': 1.1,
  '3.1.15': 1.1,
  '3.1.16': 1.1,
  '3.1.17': 1.1,
  '3.1.18': 1.1,
  '3.1.19': 1.1,
};
              
 // --- 27 - HÀM KHAI BÁO DANH MỤC CÔNG TÁC TRONG DỰ TOÁN CHI TIẾT------------------------------>    
        let estimateData = [
    { category: '1', item: 'Chi phí tổ chức sản xuất', unit: 'vnđ', type_origin: '', total_cost: 1305558220, note: '', is_edited: false },
    { category: '1.1', item: 'Chi phí lao động', unit: 'vnđ', type_origin: '', total_cost: 970129429, note: '', is_edited: false },
    { category: '1.1.1', item: 'Nhân công xây dựng trực tiếp', unit: 'vnđ', type_origin: 'Tổng diện tích xây dựng x Đơn giá nhân công', unit_price: 1850000, total_cost: 918525000, note: '', is_edited: false },
    { category: '1.1.2', item: 'Lương kỹ sư hiện trường', unit: 'vnđ', type_origin: 'Tổng chi phí trực tiếp x Tỷ lệ %', quantity: 0.03, unit_price: 2580221474, total_cost: 51604429, note: '', is_edited: false },
	{ category: '1.2', item: 'Chi phí quản lý', unit: 'vnđ', type_origin: '', total_cost: 335428791, note: '', is_edited: false },
    { category: '1.2.1', item: 'Chi phí quản lý của nhà thầu', unit: 'vnđ', type_origin: 'Tổng chi phí trực tiếp x Tỷ lệ %', unit_price: 2580221474, total_cost: 2064177180, note: '', is_edited: false },
    { category: '1.2.2', item: 'Chi phí hỗ trợ thi công', unit: 'vnđ', type_origin: 'Tổng chi phí trực tiếp x Tỷ lệ %', unit_price: 2580221474, total_cost: 77406644, note: '', is_edited: false },
    { category: '1.2.3', item: 'Chi phí dự phòng rủi ro', unit: 'vnđ', type_origin: 'Tổng chi phí trực tiếp x Tỷ lệ %', unit_price: 2580221474, total_cost: 51604429, note: '', is_edited: false },
    { category: '2', item: 'Chi phí vật liệu thô', unit: 'vnđ', type_origin: '', total_cost: 973406045, note: '', is_edited: false },
    { category: '2.1', item: 'Chi phí vật liệu xây dựng', unit: 'vnđ', type_origin: '', note: '', is_edited: false },
    { category: '2.1.1', item: 'Thép xây dựng', unit: 'kg', type_origin: 'Việt Nhật/ Pomina', quantity: 5023.5138, unit_price: 15300, total_cost: 265875750, note: '- Mác thép chính: CB300 (SD290)\n- Mác thép sàn: CB245; CN300 (SD290)\n- Thép sàn lớp dưới: D6,D8\n- Thép sàn lớp trên: Mũ D8;10\n- Cục kê chuyên dụng', is_edited: false },
    { category: '2.1.2', item: 'Xi măng', unit: 'kg', type_origin: 'INSEE/Hà Tiên', quantity: 27797.8968, unit_price: 1680, total_cost: 93421440, note: '- Trộn bê tông: Xi măng đa dụng PCB40\n- Trộn vữa: Xi măng xây tô chuyên dụng\n- Chân tường WC\n- Bảo dưỡng bê tông: Trải thảm, tưới nước', is_edited: false },
    { category: '2.1.3', item: 'Đá 1 x 2', unit: 'm3', type_origin: 'Đồng Nai/ Địa phương', quantity: 41.0857, unit_price: 378000, total_cost: 15530394, note: 'Đá rửa sạch', is_edited: false },
    { category: '2.1.4', item: 'Đá 4x6', unit: 'm3', type_origin: 'Đồng Nai/ Địa phương', quantity: 0.6873, unit_price: 378000, total_cost: 259799, note: 'Đá rửa sạch', is_edited: false },
    { category: '2.1.5', item: 'Cát vàng bê tông hạt lớn', unit: 'm3', type_origin: 'Đồng Nai/ Địa phương', quantity: 25.8348, unit_price: 432000, total_cost: 11160634, note: '', is_edited: false },
    { category: '2.1.6', item: 'Cát xây tô hạt mịn', unit: 'm3', type_origin: 'Đồng Nai/ Địa phương', quantity: 46.3706, unit_price: 324000, total_cost: 15024074, note: '', is_edited: false },
    { category: '2.1.7', item: 'Cát nền', unit: 'm3', type_origin: 'Đồng Nai/ Địa phương', quantity: 47.519, unit_price: 302400, total_cost: 14369746, note: '', is_edited: false },
    { category: '2.1.8', item: 'Gạch xây', unit: 'viên', type_origin: 'Tuynen/ Địa phương', quantity: 40440.742, unit_price: 1350, total_cost: 54595001, note: '- Liên kết tường & cột: Bát kẽm hoặc râu thép\n- Đóng lưới mắt cáo tô tường: Dầm và tường; đường điện\n- Đổ bê tông chân tường WC, Lan can, Sân thượng: 10cm', is_edited: false },
    { category: '2.1.9', item: 'Dung dịch chống thấm', unit: 'kg', type_origin: 'Kova CT11A/ Sika latex', quantity: 314.9964, unit_price: 43200, total_cost: 13607844, note: '- Vị trí sàn mái, sàn sân thượng, ban công, WC\n- Hố ga, bể phốt: Hồ dầu', is_edited: false },
    { category: '2.2', item: 'Chi phí vật liệu âm tường', unit: 'vnđ', type_origin: '', note: '', is_edited: false },
    { category: '2.2.1', item: 'Ống thoát nước PVC các loại', unit: 'm', type_origin: 'Bình Minh/ Tiền Phong', quantity: 259.195, unit_price: 110000, total_cost: 28511450, note: '- Chống mùi hôi hố ga', is_edited: false },
    { category: '2.2.2', item: 'Ống cấp nước lạnh PPR các loại', unit: 'm', type_origin: 'Bình Minh/ Tiền Phong', quantity: 258.635, unit_price: 108000, total_cost: 27932580, note: '', is_edited: false },
    { category: '2.2.3', item: 'Dây điện các loại', unit: 'm', type_origin: 'Cadivi', quantity: 3212.81, unit_price: 24620, total_cost: 79099778, note: '- Cấp đèn: 1,5mm2\n- Cấp ổ cắm: 2,5mm\n- Cáp trục chính theo thiết kế', is_edited: false },
    { category: '2.2.4', item: 'Tủ điện chống giật', unit: 'cái', type_origin: 'ELCB Panasonic', quantity: 4, unit_price: 3000000, total_cost: 12000000, note: '', is_edited: false },
    { category: '2.2.5', item: 'Ống ruột gà', unit: 'cuộn 50m', type_origin: 'Sino/ MPE', quantity: 6, unit_price: 200000, total_cost: 1200000, note: '', is_edited: false },
    { category: '2.2.6', item: 'Ống cứng luồn dây điện âm sàn', unit: 'm', type_origin: 'VEGA', quantity: 653.005, unit_price: 10000, total_cost: 6530050, note: '', is_edited: false },
    { category: '2.2.7', item: 'Cáp điện thoại, truyền hình', unit: 'm', type_origin: 'Sino/ MPE', quantity: 70.4175, unit_price: 3000, total_cost: 211253, note: '', is_edited: false },
    { category: '2.2.8', item: 'Cáp internet AMP CAT5', unit: 'm', type_origin: 'Sino/ MPE', quantity: 305, unit_price: 5900, total_cost: 1799500, note: '', is_edited: false },
    { category: '2.2.9', item: 'Tôn lợp', unit: 'm2', type_origin: 'Hoa Sen', unit_price: 126000, total_cost: 0, note: '', is_edited: false },
    { category: '2.2.10', item: 'Phụ kiện nước các loại', unit: 'cái', type_origin: 'Bình Minh/ Tiền Phong', quantity: 370.92, unit_price: 5000, total_cost: 1854600, note: '', is_edited: false },
    { category: '2.2.11', item: 'Hộp nối', unit: 'cái', type_origin: 'Sino/ MPE', quantity: 83, unit_price: 3500, total_cost: 290500, note: '', is_edited: false },
    { category: '2.2.12', item: 'Bể tự hoại', unit: 'cái', type_origin: '', quantity: 1, unit_price: 6500000, total_cost: 6500000, note: '', is_edited: false },
    { category: '2.2.13', item: 'Ống đồng máy lạnh', unit: 'm', type_origin: 'Ống Thái Lan 7gem', quantity: 51, unit_price: 220000, total_cost: 11220000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '2.2.14', item: 'Ống thoát nước ngưng máy lạnh', unit: 'm', type_origin: 'Bình Minh', quantity: 29.29, unit_price: 50000, total_cost: 1464500, note: '', is_edited: false },
    { category: '2.2.15', item: 'Ngói lợp', unit: 'm2', type_origin: 'Đồng tâm/ Khác', unit_price: 250000, total_cost: 0, note: '', is_edited: false },
    { category: '2.2.16', item: 'Khung kèo mái', unit: 'm2', type_origin: 'Thép nhẹ', unit_price: 350000, total_cost: 0, note: '', is_edited: false },
    { category: '3', item: 'Chi phí vật liệu hoàn thiện', unit: 'vnđ', type_origin: '', total_cost: 187602308, note: '', is_edited: false },
    { category: '3.1', item: 'Gạch ốp lát', unit: '', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '3.1.1', item: 'Gạch lát nền các tầng', unit: 'm2', type_origin: 'Bạch Mã, Viglacera, Taca, Taicera', quantity: 88.531, unit_price: 175000, total_cost: 15492925, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.2', item: 'Gạch nền sân thượng, sân trước sau, ban công', unit: 'm2', type_origin: 'Bạch Mã, Viglacera, Taca, Taicera', quantity: 61.434, unit_price: 145000, total_cost: 8907930, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.3', item: 'Gạch nền WC', unit: 'm2', type_origin: 'Bạch Mã, Viglacera, Taca, Taicera', quantity: 15.303, unit_price: 160000, total_cost: 2448480, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.4', item: 'Gạch ốp tường WC', unit: 'm2', type_origin: 'Bạch Mã, Viglacera, Taca, Taicera', quantity: 48.867, unit_price: 150000, total_cost: 7330050, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.5', item: 'Gạch ốp tường khu bếp', unit: 'm2', type_origin: 'Bạch Mã, Viglacera, Taca, Taicera', quantity: 20, unit_price: 150000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.6', item: 'Gạch ốp tường mặt tiền, cửa chính', unit: 'm2', type_origin: 'Bạch Mã, Viglacera, Taca, Taicera', quantity: 20, unit_price: 180000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.7', item: 'Keo chà ron', unit: 'kg', type_origin: 'Weber', quantity: 11.73625, unit_price: 20000, total_cost: 234725, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.8', item: 'Gạch ốp trang trí khác (sân vườn)', unit: 'm2', type_origin: 'Granite, Hoa cương', quantity: 20, unit_price: 180000, total_cost: 4435560, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.1.9', item: 'Xoa nền hầm', unit: 'm2', type_origin: 'Xoa nền Hadener', quantity: 20, unit_price: 350000, total_cost: 4435560, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.2', item: 'Sơn nước', unit: 'vnđ', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '3.2.1', item: 'Sơn ngoài trời (02 lớp Matit, 01 lót, 02 phủ)', unit: 'm2', type_origin: 'Maxilite/ Expo bột trét Việt Mỹ ngoài nhà', quantity: 350.76, unit_price: 90000, total_cost: 31568400, note: '', is_edited: false },
    { category: '3.2.2', item: 'Sơn trong nhà (02 lớp Matit, 01 lót, 02 phủ)', unit: 'm2', type_origin: 'Maxilite/ Expo bột trét Việt Mỹ trong nhà', quantity: 603.34, unit_price: 60000, total_cost: 36200400, note: '', is_edited: false },
    { category: '3.3', item: 'Thiết bị điện', unit: 'vnđ', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '3.3.1', item: 'MCB các loại', unit: 'cái', type_origin: 'Sino/ MPE', quantity: 23, unit_price: 350000, total_cost: 8050000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.2', item: 'Công tắc các loại', unit: 'cái', type_origin: 'Sino/ MPE', quantity: 22, unit_price: 105000, total_cost: 2310000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.3', item: 'Ổ cắm các loại', unit: 'cái', type_origin: 'Sino/ MPE', quantity: 23, unit_price: 105000, total_cost: 2415000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.4', item: 'Ổ cắm điện thoại, internet, truyền hình cáp', unit: 'cái', type_origin: 'Sino/ MPE', quantity: 5, unit_price: 120000, total_cost: 600000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.5', item: 'Đèn chiếu sáng trong phòng, ngoài sân', unit: 'cái', type_origin: 'Philips/ Led', quantity: 20, unit_price: 95000, total_cost: 1900000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.6', item: 'Đèn cầu thang', unit: 'cái', type_origin: 'Philips/ Led', quantity: 2, unit_price: 350000, total_cost: 700000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.7', item: 'Đèn ốp trần ban công, sân thượng', unit: 'cái', type_origin: 'Philips/ Led', quantity: 1, unit_price: 350000, total_cost: 350000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.8', item: 'Đèn hắt trang trí trần thạch cao', unit: 'md', type_origin: 'Led', quantity: 6, unit_price: 120000, total_cost: 720000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.9', item: 'Đèn downlight âm trần', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 41, unit_price: 200000, total_cost: 8200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.10', item: 'Đèn chùm', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 1, unit_price: 1200000, total_cost: 1200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.11', item: 'Switch 12 port 10/100/1000', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 1, unit_price: 1000000, total_cost: 1000000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.12', item: 'Bộ phận sóng Wifi', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 3, unit_price: 350000, total_cost: 1050000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.13', item: 'Camera gắn tường', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 4, unit_price: 950000, total_cost: 1900000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.14', item: 'Đầu thu hồi hình 512Gb', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 1, unit_price: 2500000, total_cost: 2500000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.15', item: 'Quạt trần', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 3, unit_price: 650000, total_cost: 650000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.3.16', item: 'Quạt hút âm trần WC', unit: 'cái', type_origin: 'Việt Nam/ Trung Quốc', quantity: 4, unit_price: 400000, total_cost: 1600000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4', item: 'Thiết bị vệ sinh - nước', unit: 'vnđ', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '3.4.1', item: 'Bàn Cầu', unit: 'cái', type_origin: 'Inax, Viglacera, Caesar, …', quantity: 4, unit_price: 3300000, total_cost: 13200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.2', item: 'Lavabo + bộ xả', unit: 'cái', type_origin: 'Inax, Viglacera, Caesar, …', quantity: 4, unit_price: 1550000, total_cost: 6200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.3', item: 'Vòi xả lavabo nóng lạnh', unit: 'cái', type_origin: 'Vòi lạnh Viglacera, Caesar, Javic', quantity: 4, unit_price: 650000, total_cost: 2600000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.4', item: 'Vòi sen tắm đứng WC', unit: 'cái', type_origin: 'Vòi lạnh Viglacera, Caesar, Javic', quantity: 4, unit_price: 1700000, total_cost: 6800000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.5', item: 'Vòi xịt WC', unit: 'cái', type_origin: 'Vòi lạnh Viglacera, Caesar, Javic', quantity: 4, unit_price: 250000, total_cost: 1000000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.6', item: 'Vòi xả sân thượng, ban công, sân', unit: 'cái', type_origin: 'Vòi lạnh Viglacera, Caesar, Javic', quantity: 5, unit_price: 120000, total_cost: 600000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.7', item: 'Các phụ kiện WC (Gương, móc đồ, kệ xà bông)', unit: 'bộ', type_origin: 'Việt Nam', quantity: 4, unit_price: 800000, total_cost: 3200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.8', item: 'Phễu thu sàn', unit: 'cái', type_origin: 'Inox chống hôi', quantity: 8, unit_price: 150000, total_cost: 1200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.9', item: 'Cầu chắn rác', unit: 'cái', type_origin: 'Inox', quantity: 1, unit_price: 150000, total_cost: 600000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.10', item: 'Chậu rửa chén 2 ngăn', unit: 'cái', type_origin: 'Đại Thành, Luxta, Javic', quantity: 1, unit_price: 1650000, total_cost: 1650000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.11', item: 'Vòi rửa chén nóng lạnh', unit: 'cái', type_origin: 'Đại Thành, Luxta, Erowin', quantity: 1, unit_price: 800000, total_cost: 800000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.12', item: 'Bồn nước inox và chân bồn', unit: 'cái', type_origin: 'Tân Á Đại Thành 1000 lít', quantity: 1, unit_price: 5500000, total_cost: 5500000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '3.4.13', item: 'Máy bơm nước', unit: 'cái', type_origin: 'Panasonic - 200W', quantity: 1, unit_price: 1250000, total_cost: 1250000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4', item: 'Chi phí giao khoán (vật liệu và nhân công)', unit: '', type_origin: '', total_cost: 340366230, note: '', is_edited: false },
    { category: '4.1', item: 'Cửa đi - cửa sổ - vách kính', unit: 'vnđ', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.1.1', item: 'Cửa phòng 1 cánh', unit: 'm2', type_origin: 'Nhôm/ nhựa lõi thép/ gỗ', quantity: 6.74, unit_price: 1750000, total_cost: 11793600, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.2', item: 'Cửa WC', unit: 'm2', type_origin: 'Nhôm/ nhựa lõi thép', quantity: 6.30, unit_price: 1750000, total_cost: 11025000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.3', item: 'Cửa đi 4 cánh cửa chính', unit: 'm2', type_origin: 'Nhôm/ nhựa lõi thép/ gỗ', quantity: 7.13, unit_price: 2200000, total_cost: 12468750, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.4', item: 'Cửa sau, hông, ban công, sân thượng', unit: 'm2', type_origin: 'Nhôm/ nhựa lõi thép/ gỗ', quantity: 10.89, unit_price: 1750000, total_cost: 19057500, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.5', item: 'Cửa sổ các loại', unit: 'm2', type_origin: 'Nhôm/ nhựa lõi thép', quantity: 7.08, unit_price: 1550000, total_cost: 10974000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.6', item: 'Cửa Cổng', unit: 'm2', type_origin: 'Cửa sắt sơn dầu, mẫu đơn giản', quantity: 8.10, unit_price: 1400000, total_cost: 11340000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.7', item: 'Cửa cuốn, cửa kéo', unit: 'm2', type_origin: 'Việt Nam/ Trung quốc', unit_price: 950000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.8', item: 'Khung sắt bảo vệ ô cửa sổ mặt tiền', unit: 'm2', type_origin: 'Sắt hộp mạ kẽm gia công theo thiết kế', unit_price: 550000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.9', item: 'Vách kính cố định', unit: 'm2', type_origin: 'Nhôm/ nhựa lõi thép', unit_price: 1400000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.10', item: 'Khóa cửa phòng, chính, ban công, sân thượng', unit: 'cái', type_origin: 'Khóa tay nắm tròn hoặc gạt', unit_price: 250000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.11', item: 'Khóa cửa WC', unit: 'cái', type_origin: 'Khóa tay nắm tròn hoặc gạt', unit_price: 200000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.12', item: 'Khóa cửa cổng', unit: 'cái', type_origin: 'Khóa móc hoặc khác', unit_price: 200000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.1.13', item: 'Vách kính phòng tắm', unit: 'm2', type_origin: 'Theo thiết kế', unit_price: 900000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.2', item: 'Cầu thang (Bao gồm vật tư và nhân công)', unit: 'vnđ', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.2.1', item: 'Lan can cầu thang', unit: 'md', type_origin: 'Kính cường lực/ Sắt/ Gỗ/ Inox', quantity: 15.86, unit_price: 1250000, total_cost: 19826250, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.2.2', item: 'Tay vịn cầu thang', unit: 'md', type_origin: 'Tay vịn gỗ sồi D50', unit_price: 450000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.2.3', item: 'Trụ cầu thang', unit: 'cái', type_origin: 'Gỗ sồi', unit_price: 1200000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.3', item: 'Đá granite (bao gồm vật tư và nhân công)', unit: 'vnđ', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.3.1', item: 'Đá Granite mặt cầu thang, len cầu thang', unit: 'm2', type_origin: 'Đá Trắng Suối Lau, Hồng Phan Rang, Tím Hoa Cà', quantity: 18.01, unit_price: 800000, total_cost: 14404800, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.3.2', item: 'Đá Granite tam cấp, ngạnh cửa', unit: 'm2', type_origin: 'Đá Trắng Suối Lau, Hồng Phan Rang, Tím Hoa Cà', quantity: 5.48, unit_price: 800000, total_cost: 4382400, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.3.3', item: 'Đá Granite ốp thang máy', unit: 'm2', type_origin: 'Đá Trắng Suối Lau, Hồng Phan Rang, Tím Hoa Cà', unit_price: 850000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.3.4', item: 'Đá Granite mặt tiền tầng trệt', unit: 'm2', type_origin: 'Đá Trắng Suối Lau, Hồng Phan Rang, Tím Hoa Cà', quantity: 2.98, unit_price: 1000000, total_cost: 2984000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.3.5', item: 'Len bậc cầu thang', unit: 'md', type_origin: 'Đá Trắng Suối Lau, Hồng Phan Rang, Tím Hoa Cà', unit_price: 150000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.4', item: 'Đóng trần', unit: '', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.4.1', item: 'Thạch cao trang trí', unit: 'm2', type_origin: 'khung M29 Vĩnh Tường , Tấm Gyproc Vĩnh Tường', quantity: 97.53, unit_price: 150000, total_cost: 14629500, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.4.2', item: 'Trần nhựa', unit: 'm2', type_origin: 'Theo y/c thiết kế', unit_price: 120000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.5', item: 'Hệ kim khí (sắt, gỗ, inox,…)', unit: '', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.5.1', item: 'Lan can ban công', unit: 'm', type_origin: 'Lan can sắt hộp , mẫu đơn giản', quantity: 1.70, unit_price: 1100000, total_cost: 1870000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.5.2', item: 'Khung sắt mái lấy sáng cầu thang, lỗ thông tầng', unit: 'm2', type_origin: 'Sắt hộp 20x20x1.0mm sơn dầu/ Tấm lợp kính cường lực 8ly', quantity: 15.42, unit_price: 1150000, total_cost: 17728400, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.5.3', item: 'Lam trang trí mặt tiền, sân thượng', unit: 'm2', type_origin: 'Gia công theo thiết kế', unit_price: 750000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.5.4', item: 'Mái đón khung thép', unit: 'm2', type_origin: 'Khung thép sơn hoàn thiện theo thiết kế', quantity: 17.71, unit_price: 1100000, total_cost: 19481000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.5.5', item: 'Mái Poly lấy sáng', unit: 'm2', type_origin: 'Gia công theo thiết kế', quantity: 7.50, unit_price: 800000, total_cost: 6000000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6', item: 'Thiết bị và nội thất', unit: '', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.6.1', item: 'Tủ kệ bếp, tủ âm tường', unit: 'md', type_origin: 'Theo y/c thiết kế', unit_price: 2800000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.2', item: 'Nội thất (giường, tủ, kệ, quầy bar)', unit: 'món', type_origin: 'Tính riêng từng món', total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.3', item: 'Thang máy', unit: 'vnđ', type_origin: 'Theo y/c thiết kế', quantity: 1, unit_price: 280000000, total_cost: 280000000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.4', item: 'Thang máy tăng thêm mỗi tầng', unit: 'điểm dừng', type_origin: 'Theo y/c thiết kế', quantity: 4, unit_price: 15000000, total_cost: 60000000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.5', item: 'Máy nước nóng trực tiếp', unit: 'cái', type_origin: 'Panasosic/Khác', quantity: 4,  unit_price: 4500000, total_cost: 0, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.6', item: 'Máy điều hòa cục bộ 1 chiều lạnh 1.0HP', unit: 'cái', type_origin: 'Daikin/ Panasonic', quantity: 4, unit_price: 10590000, total_cost: 31770000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.7', item: 'Máy điều hòa cục bộ 1 chiều lạnh 1.5HP', unit: 'cái', type_origin: 'Daikin/ Panasonic', quantity: 1, unit_price: 14000000, total_cost: 14000000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.8', item: 'Giá đỡ cục nóng điều hòa', unit: 'cái', type_origin: 'Việt Nam', quantity: 5, unit_price: 650000, total_cost: 2600000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.9', item: 'Máy nước nóng năng lượng mặt trời', unit: 'cái', type_origin: 'Tân Á Đại Thành, Hướng Dương 130L', quantity: 1.00, unit_price: 6200000, total_cost: 6200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.6.10', item: 'Mô tơ bình lưu điện cửa cuốn', unit: 'cái', type_origin: 'Việt Nam/ Trung quốc', quantity: 1, unit_price: 8000000, total_cost: 6200000, note: 'Đơn giá tối đa, CĐT lựa mẫu', is_edited: false },
    { category: '4.7', item: 'Khác', unit: '', type_origin: '', total_cost: 0, note: '', is_edited: false },
    { category: '4.7.1', item: 'Hồ bơi', unit: 'm2', type_origin: 'Theo y/c thiết kế', unit_price: 5000000, total_cost: 0, note: '', is_edited: false },
    { category: '4.7.2', item: 'Hòn non bộ và tiểu cảnh', unit: 'm2', type_origin: 'Theo y/c thiết kế', total_cost: 0, note: '', is_edited: false },
    { category: '4.7.3', item: 'Sơn hiệu ứng bê tông', unit: 'm2', type_origin: 'Theo y/c thiết kế', unit_price: 350000, total_cost: 6550950, note: '', is_edited: false },
    { category: '4.7.4', item: 'Ép cọc', unit: 'md', type_origin: 'Theo y/c thiết kế', quantity: 216.00, unit_price: 330000, total_cost: 71280000, note: '', is_edited: false },
    { category: '4.7.5', item: 'Chi phí cừ chống đổ nhà hàng xóm', unit: 'vnđ', type_origin: 'Trọn gói (nếu có)', quantity: 1.00, unit_price: 30000000, total_cost: 30000000, note: '', is_edited: false },
    { category: '4.7.6', item: 'Chi phí bản vẽ xin phép xây dựng', unit: 'vnđ', type_origin: 'Trọn gói (nếu có)', quantity: 234.73, unit_price: 15000, total_cost: 3520950, note: '', is_edited: false },
    { category: '4.7.7', item: 'Chi phí dịch vụ xin phép xây dựng', unit: 'vnđ', type_origin: 'Trọn gói (nếu có)', quantity: 1, unit_price: 3500000, total_cost: 3500000, note: '', is_edited: false },
    { category: '4.7.8', item: 'Chi phí thiết kế bản vẽ 2D', unit: 'vnđ', type_origin: 'Trọn gói (nếu có)', quantity: 234.73, unit_price: 150000, total_cost: 35209500, note: '', is_edited: false },
    { category: '4.7.9', item: 'Chi phí nâng nền', unit: 'm3', type_origin: 'Theo khối lượng nâng nền thực tế (nếu có)', quantity:'', unit_price: 450000, total_cost: 35209500, note: 'Nhà thầu hỗ trợ CĐT chi phí nâng nền 300mm so với mặt bằng hiện hữu, phần chênh lệch cao hơn sẽ phát sinh chi phí', is_edited: false },
    { category: '4.7.10', item: 'Chi phí nguồn điện 3 pha cho thang máy', unit: 't/b', type_origin: 'Trọn gói (nếu có)', quantity:'', unit_price: 10000000, total_cost: 35209500, note: 'Cấp nguồn điện 3 pha từ tủ điện tổng tới buồng kỹ thuật thang máy', is_edited: false },
    { category: '4.7.11', item: 'Chi phí dây TE, cọc tiếp địa', unit: 't/b', type_origin: 'Trọn gói (nếu có)', quantity:'', unit_price: 12000000, total_cost: 35209500, note: 'Hệ thống tiếp địa đảm bảo an toàn điện cho thang máy hoặc các thiết bị có tính năng chống giật, giúp triệt tiêu dòng điện rò rỉ, tuân thủ tiêu chuẩn an toàn điện.', is_edited: false },
 	{ category: '4.7.12', item: 'Chi phí ép cừ gia cố vách hầm', unit: 'm', type_origin: 'Tính theo chu vi hầm', quantity:'', unit_price: 3300000, total_cost: 35209500, note: 'Gia cố vách hầm để đảm bảo an toàn công trình và nhà kế bên, tránh nguy cơ sụt lún, nứt nẻ do đào đất sâu.', is_edited: false }, 
    { category: '4.7.13', item: 'Chi phí chống mối cho công trình', unit: 'm2', type_origin: 'Tính theo diện tích đất (nếu có)', quantity:'', unit_price: 200000, total_cost: 35209500, note: '', is_edited: false }, 
    { category: '4.7.14', item: 'Chi phí vệ sinh công nghiệp', unit: 'm2', type_origin: 'Tính theo m2 sàn (nếu có)', quantity:'', unit_price: 200000, total_cost: 35209500, note: 'Sử dụng thiết bị chuyên dụng để vệ sinh sàn, các vật dụng, khử mùi', is_edited: false }, 
	{ category: '4.7.15', item: 'Chi phí tháo dỡ nhà, cũ', unit: 't/b', type_origin: '(nếu có)', quantity:'', unit_price: 15000000, total_cost: 35209500, note: '', is_edited: false }, 
     
        ];
		let estimateTable = null;
      	let dataJustImported = false; // <-- THÊM DÒNG NÀY
document.addEventListener('DOMContentLoaded', async () => { 
    // Tải dữ liệu từ Google Sheets
    const sheetData = await fetchDataFromSheet();

    if (sheetData) {
        // Chuyển dữ liệu từ mảng sang một Map để tra cứu nhanh hơn
        const dataMap = new Map(sheetData.map(item => [item.category, item]));

        // Cập nhật mảng estimateData với tên, đơn giá từ Sheets
        estimateData.forEach(row => {
            if (dataMap.has(row.category)) {
                const sheetRow = dataMap.get(row.category);
               // 1. CẬP NHẬT TÊN HẠNG MỤC (ITEM)
                // Điều kiện an toàn: chỉ cập nhật khi có tên mới và là hạng mục chi tiết
                if (sheetRow.item && sheetRow.item.trim() !== '' && row.category.includes('.')) {
                    row.item = sheetRow.item;
                }
                // 2. CẬP NHẬT ĐƠN VỊ TÍNH (UNIT)
                if (sheetRow.unit && sheetRow.unit.trim() !== '') {
                    row.unit = sheetRow.unit;
                }
                // 3. CẬP NHẬT CHỦNG LOẠI/ QUY CÁCH (TYPE_ORIGIN)
                if (sheetRow.type_origin && sheetRow.type_origin.trim() !== '') {
                    row.type_origin = sheetRow.type_origin;
                }
                // 4. CẬP NHẬT ĐƠN GIÁ (UNIT_PRICE)
                if (sheetRow.unit_price && sheetRow.unit_price > 0) {
                    row.unit_price = sheetRow.unit_price;
                }
                // 5. CẬP NHẬT GHI CHÚ (NOTE) - PHẦN MỚI THÊM VÀO
                // Dùng `'note' in sheetRow` để cho phép cập nhật cả ghi chú rỗng (xóa ghi chú cũ)
                if ('note' in sheetRow) {
                    row.note = sheetRow.note;
                }
            }
        });
        // Lưu các định mức vào một object riêng để hàm calculateCosts sử dụng
        window.consumptionRates = {};
        sheetData.forEach(item => {
            if (item.consumption_rate && item.consumption_rate > 0) {
                window.consumptionRates[item.category] = item.consumption_rate;
            }
        });
        
        console.log('Đã cập nhật đơn giá và định mức từ hê thống!');
    }
    //alert('Đã cập nhật đơn giá và định mức từ hệ thống!');
    // Phần code gốc còn lại giữ nguyên
    estimateData.forEach(row => {
    // KIỂM TRA: Vật tư có nằm trong danh sách hao hụt mặc định không?
    if (defaultCoefficientsMap.hasOwnProperty(row.category)) {
        // CÓ: Gán hệ số hao hụt từ danh sách.
        row.coefficient = defaultCoefficientsMap[row.category];
    } else {
        // KHÔNG: Gán hệ số mặc định là 1.
        row.coefficient = 1;
    }
        const quantity = Number(row.quantity) || 0;
        const coefficient = Number(row.coefficient) || 1;
        const unitPrice = Number(row.unit_price) || 0;
        row.total_quantity = quantity * coefficient;
        if (row.category && row.category.includes('.')) {
             row.total_cost = Math.round(row.total_quantity * unitPrice);
        }
    });
    calculateAllSubTotals();
    updateAndRenderGrandTotal();
    localStorage.removeItem('estimateData');
    try {
        const savedData = localStorage.getItem('estimateData');
        if (savedData) {
            estimateData = JSON.parse(savedData);
            if (estimateTable) {
                estimateTable.loadData(estimateData);
                estimateTable.render();
            }
        }
    } catch (error) {
        alert('Lỗi khi tải dữ liệu: ' + error.message);
    }
    changeFloors(0);
});
      
  // --- 28 - HÀM ẨN HIỆN DÒNG TRONG DỰ TOÁN CHI TIẾT------------------------------>   
function applyFilters() {
    const hideEmptyToggle = document.getElementById('hideEmptyRowsToggle');
    const showRoughOnlyToggle = document.getElementById('showRoughOnlyToggle');

    if (!estimateTable || !hideEmptyToggle || !showRoughOnlyToggle) {
        return; // Dừng lại nếu bảng hoặc các nút chưa tồn tại
    }
    const hiddenRowsPlugin = estimateTable.getPlugin('hiddenRows');
    const allData = estimateTable.getSourceData();
    const rowsToHide = new Set(); // Dùng Set để tránh ẩn trùng lặp
    // Điều kiện 1: Ẩn các dòng trống (Thành tiền = 0)
    if (hideEmptyToggle.checked) {
        allData.forEach((row, index) => {
            if (!row.total_cost || row.total_cost === 0) {
                rowsToHide.add(index);
            }
        });
    }
    // Điều kiện 2: Chỉ hiện phần thô (ẩn mục 3 và 4)
    if (showRoughOnlyToggle.checked) {
        allData.forEach((row, index) => {
            const category = String(row.category || '');
            // Ẩn tất cả các mục chính 3, 4 và các mục con của chúng (ví dụ: '3.1', '4.5.1')
            if (category.startsWith('3') || category.startsWith('4')) {
                rowsToHide.add(index);
            }
        });
    }
    // Áp dụng bộ lọc kết hợp
    // Hiện tất cả các dòng trước để reset trạng thái cũ
    const allRowIndexes = Array.from({ length: allData.length }, (_, i) => i);
    hiddenRowsPlugin.showRows(allRowIndexes);
    // Ẩn các dòng đã được tổng hợp trong Set
    if (rowsToHide.size > 0) {
        hiddenRowsPlugin.hideRows(Array.from(rowsToHide));
    }
    // Render lại bảng và cập nhật tổng tiền
    estimateTable.render();
    updateAndRenderGrandTotal();
}

      
  // --- 29 - HÀM QUẢN LÝ GIAO DIỆN NGƯỜI DÙNG------------------------------>   
// Hiển thị hoặc ẩn chi tiết chi phí
function toggleDetails() {
    const details = document.getElementById('costDetails');
    details.classList.toggle('hidden');
}
// Mở modal chỉnh sửa hệ số chi phí
function openCoefficientsModal() {
    const modal = document.getElementById('coefficientsModal');
    // Điền giá trị hiện tại vào modal
    document.getElementById('modalLaborCost').value = coefficients.baseLaborCost;
    document.getElementById('modalRoughCost').value = coefficients.baseRoughCost;
    document.getElementById('modalFullCost').value = coefficients.baseFullCost;
    modal.classList.remove('hidden');
}
// Đóng modal hệ số chi phí
function closeCoefficientsModal() {
    const modal = document.getElementById('coefficientsModal');
    modal.classList.add('hidden');
}
// Lưu hệ số chi phí từ modal
function saveCoefficients() {
    coefficients.baseLaborCost = parseFloat(document.getElementById('modalLaborCost').value) || 1800000;
    coefficients.baseRoughCost = parseFloat(document.getElementById('modalRoughCost').value) || 3900000;
    coefficients.baseFullCost = parseFloat(document.getElementById('modalFullCost').value) || 6500000;
    coefficients.neighborSupportPrice = parseFloat(document.getElementById('neighborSupportprice').value) || 30000000;
    coefficients.pilePrice = parseFloat(document.getElementById('pilePrice').value) || 320000;
    coefficients.elevatorPrice = parseFloat(document.getElementById('elevatorprice').value) || 280000000;
    coefficients.elevatorStopsPrice = parseFloat(document.getElementById('elevatorStopsprice').value) || 15000000;
    coefficients.BVXPXDPrice = parseFloat(document.getElementById('BVXPXDprice').value) || 15000;
    coefficients.DVXPXDPrice = parseFloat(document.getElementById('DVXPXDprice').value) || 3500000;
    coefficients.TKPrice = parseFloat(document.getElementById('TKprice').value) || 150000;
    coefficients.poolPrice = parseFloat(document.getElementById('poolprice').value) || 5000000;
  // Cập nhật unit_price trong estimateData cho Chi phí nhân công
    const laborRowIndex = estimateData.findIndex(row => row.category === '1.1.1');
    if (laborRowIndex !== -1) {
        estimateData[laborRowIndex].unit_price = coefficients.baseLaborCost;
        estimateData[laborRowIndex].total_cost = Math.round(estimateData[laborRowIndex].quantity * coefficients.baseLaborCost);
        if (estimateTable) {
            estimateTable.loadData(estimateData);
            estimateTable.render();
        }
    }
    closeCoefficientsModal();
    calculateCosts(); // Cập nhật lại chi phí sau khi lưu hệ số
}

  // --- 30 - HÀM NHÂN HỆ SỐ BẤT LỢI------------------------------>   
function getCombinedAdjustmentFactor() {
    let combinedFactor = 1.0; // Bắt đầu với hệ số cơ sở là 1
    // 1. Điều chỉnh theo kiến trúc (Cổ điển, tân cổ điển)
    const architecturePercent = parseFloat(document.getElementById('architecture').value) || 0;
    if (architecturePercent !== 0) {
        combinedFactor *= (1 + (architecturePercent / 100));
    }
    // 2. Điều chỉnh theo hẻm nhỏ
    const roadPercent = parseFloat(document.getElementById('road').value) || 0;
    if (roadPercent !== 0) {
        combinedFactor *= (1 + (roadPercent / 100));
    }
    // 3. Điều chỉnh theo loại công trình (Biệt thự, nhà cấp 4)
    const buildingTypePercent = parseFloat(document.getElementById('buildingType').value) || 0;
    if (buildingTypePercent !== 0) {
        combinedFactor *= (1 + (buildingTypePercent / 100));
    }
    // 4. Điều chỉnh theo số mặt tiền
    const facadePercent = parseFloat(document.getElementById('facade').value) || 0;
    if (facadePercent !== 0) {
        combinedFactor *= (1 + (facadePercent / 100));
    }
    // 5. Điều chỉnh theo diện tích sàn nhỏ
    const smallAreaPercent = parseFloat(document.getElementById('smallFloorAreaExtraCost').value) || 0;
    if (smallAreaPercent !== 0) {
        combinedFactor *= (1 + (smallAreaPercent / 100));
    }
    // 6. Điều chỉnh theo điều kiện thi công khó khăn
    if (document.getElementById('isDifficultConstruction').checked) {
        combinedFactor *= 1.04; // +4%
    }
    // 7. Điều chỉnh theo nhà lệch tầng
    if (document.getElementById('isSplitLevel').checked) {
        combinedFactor *= 1.02; // +2%
    }
    return combinedFactor;
}
      
  // --- 30 - HÀM TÍNH TOÁN ĐƠN GIÁ ĐÃ ĐIỀU CHỈNH HỆ SỐ BẤT LỢI------------------------------>   
function getAdjustedCosts() {
    // Lấy các giá trị đơn giá gốc từ object coefficients
    let labor = coefficients.baseLaborCost;
    let rough = coefficients.baseRoughCost;
    let full = coefficients.baseFullCost;
    // Đọc các giá trị từ các ô lựa chọn
    const architecture = document.getElementById('architecture').value;
    const road = document.getElementById('road').value;
    const buildingType = document.getElementById('buildingType').value;
    const facade = document.getElementById('facade').value;
    const smallFloorAreaExtraCost = document.getElementById('smallFloorAreaExtraCost').value;
    // 1. Điều chỉnh theo kiến trúc
    // Lấy giá trị % + trực tiếp từ ô lựa chọn 'road'
    const extraCostPercent3 = parseFloat(document.getElementById('architecture').value) || 0;
    // Nếu có % + (giá trị đã chọn lớn hơn 0)
    if (extraCostPercent3 !== 0) {
        // Tính hệ số nhân (ví dụ: chọn option value="5" thì increaseFactor = 1.05)
        const increaseFactor3 = 1 + (extraCostPercent3 / 100);
        // Áp dụng + cho cả ba loại đơn giá
        labor *= increaseFactor3;
        rough *= increaseFactor3;
        full *= increaseFactor3;
    }
    // 2. Điều chỉnh theo hệ số bất lợi hẻm nhỏ
    // Lấy giá trị % + trực tiếp từ ô lựa chọn 'road'
    const extraCostPercent = parseFloat(document.getElementById('road').value) || 0;
    // Nếu có % + (giá trị đã chọn lớn hơn 0)
    if (extraCostPercent !== 0) {
        // Tính hệ số nhân (ví dụ: chọn option value="5" thì increaseFactor = 1.05)
        const increaseFactor = 1 + (extraCostPercent / 100);
        // Áp dụng + cho cả ba loại đơn giá
        labor *= increaseFactor;
        rough *= increaseFactor;
        full *= increaseFactor;
    }
    // 3. Điều chỉnh theo loại công trình
    // Lấy giá trị % điều chỉnh (có thể âm hoặc dương) trực tiếp từ ô lựa chọn
    const adjustmentPercent = parseFloat(document.getElementById('buildingType').value) || 0;
    // Nếu có sự điều chỉnh (giá trị khác 0)
    if (adjustmentPercent !== 0) {
        // Tính hệ số điều chỉnh. Công thức này đúng cho cả tăng và -.
        // Ví dụ: 15% -> 1.15 (tăng). -15% -> 0.85 (giảm).
        const adjustmentFactor = 1 + (adjustmentPercent / 100);
        // Áp dụng điều chỉnh giá cho cả ba loại đơn giá
        labor *= adjustmentFactor;
        rough *= adjustmentFactor;
        full *= adjustmentFactor;
    }
     // 4. Điều chỉnh theo số mặt tiền
    // Lấy giá trị % điều chỉnh (có thể âm hoặc dương) trực tiếp từ ô lựa chọn
    const adjustmentPercent1 = parseFloat(document.getElementById('facade').value) || 0;
    // Nếu có sự điều chỉnh (giá trị khác 0)
    if (adjustmentPercent1!== 0) {
        // Tính hệ số điều chỉnh. Công thức này đúng cho cả tăng và -.
        // Ví dụ: 15% -> 1.15 (tăng). -15% -> 0.85 (giảm).
        const adjustmentFactor1 = 1 + (adjustmentPercent1 / 100);
        // Áp dụng điều chỉnh giá cho cả ba loại đơn giá
        labor *= adjustmentFactor1;
        rough *= adjustmentFactor1;
        full *= adjustmentFactor1;
    }
    // 5. Điều chỉnh theo diện tích sàn nhỏ
    const referenceFloorArea = parseFloat(document.getElementById('smallFloorAreaExtraCost').value) || 0;
    if (referenceFloorArea!== 0) {
            const increaseFactor2= 1 + (referenceFloorArea / 100);
            labor *= increaseFactor2;
            rough *= increaseFactor2;
            full *= increaseFactor2;
        }
  // 6. Điều chỉnh theo điều kiện thi công khó khăn
    if (document.getElementById('isDifficultConstruction').checked) {
        const increaseFactor = 1.04; // Tăng 4%
        labor *= increaseFactor;
        rough *= increaseFactor;
        full *= increaseFactor;
    }
    // 7. Điều chỉnh theo nhà lệch tầng
    if (document.getElementById('isSplitLevel').checked) {
        const increaseFactor = 1.02; // Tăng 2%
        labor *= increaseFactor;
        rough *= increaseFactor;
        full *= increaseFactor;
    }
    // Trả về một object chứa 3 giá trị đơn giá đã được điều chỉnh
    return {
        laborCost: labor,
        roughCost: rough,
        fullCost: full
    };
}
      
  // --- 31 - HÀM VẼ SƠ ĐỒ TẦNG------------------------------>  
function drawBuilding() {
    const building = document.getElementById('building');
    building.innerHTML = ''; // Xóa sơ đồ cũ
    // --- CẤU HÌNH CHO CỠ CHỮ ---
    const baseFontSize = 22; // Cỡ chữ lớn nhất (px) cho tầng rộng nhất
    const minFontSize = 10;  // Cỡ chữ nhỏ nhất (px) để tránh chữ quá nhỏ
    // ----------------------------
    // 1. Thu thập diện tích của tất cả các tầng vào một mảng
    const areas = [];
    const numFloors = parseInt(document.getElementById('numFloors').value) || 0;
    areas.push(parseFloat(document.getElementById('roofArea').value) || 0);
    areas.push(parseFloat(document.getElementById('basementArea').value) || 0);
    areas.push(parseFloat(document.getElementById('mezzanineArea').value) || 0);
    areas.push(parseFloat(document.getElementById('groundFloorArea').value) || 0);
    for (let i = 2; i <= numFloors + 1; i++) {
        const floorAreaInput = document.getElementById(`floor${i}Area`);
        if (floorAreaInput) {
            areas.push(parseFloat(floorAreaInput.value) || 0);
        }
    }
    // 2. Tìm diện tích lớn nhất để làm chuẩn 100%
    const maxArea = Math.max(1, ...areas);
    // Lấy các giá trị từ input một lần nữa để vẽ
    const tumArea = parseFloat(document.getElementById('roofArea').value) || 0;
    const basementArea = parseFloat(document.getElementById('basementArea').value) || 0;
    const mezzanineArea = parseFloat(document.getElementById('mezzanineArea').value) || 0;
    const groundFloorArea = parseFloat(document.getElementById('groundFloorArea').value) || 0;
    // --- HÀM TRỢ GIÚP ĐỂ ÁP DỤNG STYLE ---
    const applyStyles = (element, area) => {
        const proportionalWidth = (area / maxArea) * 100;
        element.style.width = `${proportionalWidth}%`;
        // Tính toán và áp dụng cỡ chữ tự động
        let calculatedFontSize = baseFontSize * (proportionalWidth / 100);
        calculatedFontSize = Math.max(minFontSize, calculatedFontSize); // Đảm bảo không nhỏ hơn cỡ chữ tối thiểu
        element.style.fontSize = `${calculatedFontSize}px`;
        // Điều chỉnh chiều cao dòng để chữ luôn ở giữa theo chiều dọc
        element.style.lineHeight = '1.2'; 
    };
    // Vẽ Tum
    if (tumArea > 0) {
        const tum = document.createElement('div');
        tum.className = 'floor tum';
        applyStyles(tum, tumArea);
        tum.innerHTML = `TUM <br> <span style="font-size: 0.7em;">(${tumArea} m²)</span>`; // Dùng em để span co giãn theo
        building.appendChild(tum);
    }
    // Vẽ các tầng từ trên xuống
    for (let i = numFloors + 1; i >= 2; i--) {
        const floorAreaInput = document.getElementById(`floor${i}Area`);
        if (floorAreaInput) {
            const floorArea = parseFloat(floorAreaInput.value) || 0;
            const floor = document.createElement('div');
            floor.className = 'floor';
            applyStyles(floor, floorArea);
            floor.innerHTML = `TẦNG ${i} <br> <span style="font-size: 0.7em;">(${floorArea} m²)</span>`;
            building.appendChild(floor);
        }
    }
    // Vẽ Tầng Lửng
    if (mezzanineArea > 0) {
        const lung = document.createElement('div');
        lung.className = 'floor'; 
        applyStyles(lung, mezzanineArea);
        lung.innerHTML = `TẦNG LỬNG <br> <span style="font-size: 0.7em;">(${mezzanineArea} m²)</span>`;
        building.appendChild(lung);
    }
    // Vẽ Tầng 1
    if (groundFloorArea > 0) {
        const floor1 = document.createElement('div');
        floor1.className = 'floor';
        applyStyles(floor1, groundFloorArea);
        floor1.innerHTML = `TẦNG 1 <br> <span style="font-size: 0.7em;">(${groundFloorArea} m²)</span>`;
        building.appendChild(floor1);
    }
    // Vẽ Vỉa hè
    const viahe = document.createElement('div');
    viahe.className = 'floor viahe';
    viahe.style.width = '100%'; 
    building.appendChild(viahe);
    // Vẽ Tầng hầm
    if (basementArea > 0) {
        const ham = document.createElement('div');
        ham.className = 'floor basement';
        applyStyles(ham, basementArea);
        ham.innerHTML = `TẦNG HẦM <br> <span style="font-size: 0.7em;">(${basementArea} m²)</span>`;
        building.appendChild(ham);
    }
    // Vẽ Móng
    const foundationWrap = document.createElement('div');
    foundationWrap.className = 'foundation-container';
    foundationWrap.innerHTML = `
        <div class="foundation"></div>
        <div class="foundation"></div>
    `;
    building.appendChild(foundationWrap);
}
function changeFloors(delta) {
    const numFloorsInput = document.getElementById('numFloors');
    let numFloors = parseInt(numFloorsInput.value) || 0;
    
    // Lưu lại giá trị của các tầng hiện có
    const savedValues = {};
    const floorInputsContainer = document.getElementById('floorInputs');
    const currentInputs = floorInputsContainer.querySelectorAll('input[type="number"]');
    currentInputs.forEach(input => {
        savedValues[input.id] = input.value;
    });
    // Cập nhật số tầng mới
    numFloors = Math.max(0, Math.min(10, numFloors + delta));
    numFloorsInput.value = numFloors;
    // Xóa và tạo lại các ô nhập liệu cho các tầng
    floorInputsContainer.innerHTML = '';
    for (let i = 2; i <= numFloors + 1; i++) {
        const floorDiv = document.createElement('div');
        floorDiv.id = `floor${i}`;
        floorDiv.className = 'mb-4';
        const inputId = `floor${i}Area`;
        const oldValue = savedValues[inputId] !== undefined ? savedValues[inputId] : 0; // Đặt giá trị mặc định là 0 cho tầng mới
        floorDiv.innerHTML = `
            <label class="block text-2xl font-medium text-gray-700">Tầng ${i} (lầu ${i - 1}, m²)</label>
            <input type="number" id="${inputId}" value="${oldValue}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" oninput="drawBuilding()">
        `;
        floorInputsContainer.appendChild(floorDiv);
    }
    // Vẽ lại sơ đồ và tính toán lại chi phí
    drawBuilding();
    calculateCosts();
}

      
  // --- 32 - KHỞI TẠO MODUL DỰ TOÁN CHI TIẾT------------------------------>  
function openEstimateModal() {
    const modal = document.getElementById('estimateModal');
    const container = document.getElementById('estimateTable');
    modal.classList.remove('hidden');
    if (!estimateTable) {
        estimateTable = new Handsontable(container, {
            data: estimateData,
            colHeaders: ['STT', 'Hạng mục', 'ĐVT', 'Chủng loại/ Quy cách', 'Số lượng', 'Hệ số', 'Tổng số lượng', 'Đơn giá', 'Thành tiền', 'Ghi chú'],
columns: [
    { data: 'category', type: 'text', readOnly: false },
    { data: 'item', type: 'text', readOnly: false },
    { data: 'unit', type: 'text', readOnly: false },
    { data: 'type_origin', type: 'text', readOnly: false },
    { data: 'quantity', type: 'numeric', numericFormat: { pattern: '0,0.000' }, readOnly: false }, // Số lượng gốc
    { data: 'coefficient', type: 'numeric', numericFormat: { pattern: '0,0.00' }, readOnly: false }, // Cột Hệ số MỚI
    { data: 'total_quantity', type: 'numeric', numericFormat: { pattern: '0,0.000' }, readOnly: true }, // Cột Tổng số lượng MỚI (chỉ đọc)
    { data: 'unit_price', type: 'numeric', numericFormat: { pattern: '0,0' }, readOnly: false },
    { data: 'total_cost', type: 'numeric', numericFormat: { pattern: '0,0' }, readOnly: true },
    { data: 'note', type: 'text', readOnly: false }
],
           undo: true,
           rowHeaders: true,
           hiddenRows: true,
           // stretchH: 'all', // <-- ĐÃ VÔ HIỆU HÓA ĐỂ DÙNG ĐỘ RỘNG CỐ ĐỊNH
           height: 400,
           width: '100%',
           autoRowSize: true, // <-- THÊM DÒNG NÀY ĐỂ DÒNG TỰ CAO LÊN KHI CHỮ XUỐNG DÒNG
           manualRowResize: true,
           manualColumnResize: true, // <-- THUỘC TÍNH NÀY CHO PHÉP KÉO THỦ CÔNG
           colWidths: [60, 300, 50, 200, 80, 50, 80, 100, 150, 200], // <-- Độ rộng ban đầu
           autoWrapRow: true,
           autoWrapCol: true,
           rowHeaders: true,
           filters: true,
           dropdownMenu: true,
           minRows: estimateData.length,
           licenseKey: 'non-commercial-and-evaluation',
           selectionMode: 'multiple',
           outsideClickDeselects: false,
           persistentState: true, 
           currentRowClassName: 'currentRow',
           currentColClassName: 'currentCol',
           afterSelection: function(row, col, row2, col2) {
               console.log(`Đã chọn từ dòng ${row}, cột ${col} đến dòng ${row2}, cột ${col2}`);
           },
afterChange: function(changes, source) {
    if (source === 'edit') {
        changes.forEach(([row, prop, oldValue, newValue]) => {
            // Kiểm tra và khởi tạo các thuộc tính mới nếu chưa có
            if (estimateData[row].coefficient === undefined) {
                estimateData[row].coefficient = 1;
            }
            if (estimateData[row].total_quantity === undefined) {
                estimateData[row].total_quantity = estimateData[row].quantity;
            }
            // Cập nhật giá trị khi người dùng sửa
           if (prop === 'quantity' || prop === 'coefficient' || prop === 'unit_price') {
                estimateData[row].is_edited = true;
                let parsedValue;
                if (typeof newValue === 'string' && (newValue.includes('+') || newValue.includes('-') || newValue.includes('*') || newValue.includes('/'))) {
                    try {
                       let expression = newValue.replace(/,/g, '.').replace(/.(?=\d{3})/g, '');
                        // Nếu chuỗi bắt đầu bằng dấu '=', hãy loại bỏ nó
                        if (expression.trim().startsWith('=')) {
                            expression = expression.trim().slice(1);
                        }
                        parsedValue = eval(expression);
                        if (isNaN(parsedValue)) {
                            throw new Error("Invalid expression");
                        }
                    } catch (e) {
                        parsedValue = parseFloat(newValue) || 0;
                    }
                } else {
                    parsedValue = parseFloat(newValue) || 0;
                }

                if (prop === 'unit_price') {
                    parsedValue = Math.round(parsedValue);
                }
                estimateData[row][prop] = parsedValue;
                // Lấy các giá trị cần thiết, đảm bảo là số
                const quantity = parseFloat(estimateData[row].quantity) || 0;
                const coefficient = parseFloat(estimateData[row].coefficient) || 1;
                const unitPrice = parseFloat(estimateData[row].unit_price) || 0; // Đơn giá giờ đã được làm tròn
                // Tính toán lại
                const totalQuantity = quantity * coefficient;
                const totalCost = Math.round(totalQuantity * unitPrice); // **LÀM TRÒN THÀNH TIỀN**
                // Cập nhật dữ liệu trong mảng estimateData
                estimateData[row].total_quantity = totalQuantity;
                estimateData[row].total_cost = totalCost;
            }
        });
        calculateAllSubTotals();
      	updateAndRenderGrandTotal();
        this.render(); // Render lại toàn bộ bảng để hiển thị các thay đổi
     	refreshTableDisplay();
    }
},
	// bắt đầu không cho nhập các STT đã khóa
    beforeChange: function(changes, source) {
	// Chỉ kiểm tra khi người dùng tự tay chỉnh sửa
        if (source !== 'edit') {
            return true;
        }
        for (let i = 0; i < changes.length; i++) {
            const [row, prop, oldValue, newValue] = changes[i];
	// Chỉ thực hiện kiểm tra nếu cột được sửa là cột 'STT' (category)
            if (prop === 'category') {
                // Bỏ qua nếu giá trị mới là rỗng hoặc không thay đổi
                if (!newValue || newValue === oldValue) {
                    return true;
                }
	// Kiểm tra STT mới nhập có bị khóa hay không
                if (readOnlyCategories.has(newValue)) {
                    alert(`Lỗi: STT "${newValue}" là mã hệ thống hoặc được tính toán tự động. Bạn không thể sử dụng mã này.`);
                    return false; // Hủy bỏ thay đổi
                }
                // Lấy chỉ số của dòng đang được sửa
                const currentRowIndex = row; 
	// Tìm trong toàn bộ bảng dữ liệu xem có dòng nào khác có STT trùng với giá trị mới không
                const duplicateIndex = estimateData.findIndex((item, index) => {
                    // Điều kiện là: 
                    // 1. STT của mục trong bảng (`item.category`) bằng với giá trị mới (`newValue`).
                    // 2. Chỉ số của mục đó (`index`) phải khác với chỉ số của dòng đang sửa (`currentRowIndex`).
                    return item.category === newValue && index !== currentRowIndex;
                });
	// Nếu `duplicateIndex` khác -1, nghĩa là đã tìm thấy một dòng khác bị trùng
                if (duplicateIndex !== -1) {
                    alert(`Lỗi: STT "${newValue}" đã tồn tại ở dòng ${duplicateIndex + 1}. Vui lòng nhập mã duy nhất.`);
                    return false; // Hủy bỏ thay đổi
                }
            }
        }
	// Nếu tất cả kiểm tra đều qua, cho phép thay đổi
        return true;
    },
	// Kết thúc không cho nhập STT đã khóa
	// Định dạng dòng in đậm
cells: function(row, col, prop) {
    const cellProperties = {};
    cellProperties.className = 'htMiddle'; 
    const rowData = this.instance.getSourceDataAtRow(row);
    if (!rowData) return cellProperties;
    const category = rowData.category || '';
    const isEdited = rowData.is_edited || false;
   // Khóa các ô STT nằm trong danh sách readOnlyCategories
    if (prop === 'category' && readOnlyCategories.has(category)) {
        cellProperties.readOnly = true;
    }
    // Khóa các ô không cho chỉnh sửa trong dòng TỔNG CỘNG
    if (category === 'TONG') {
        cellProperties.readOnly = true;
    }
	// Định dạng cho dòng TỔNG CHI PHÍ XÂY DỰNG
if (category === 'TONG') {
    cellProperties.className = (cellProperties.className || '') + ' grand-total-row';
    cellProperties.readOnly = true; // Khóa không cho sửa
}
    // Định dạng cho các dòng tổng chính
    const mainSummaryCategories = ['1', '2', '3', '4','5,','6','7','8','9','10'];
    if (mainSummaryCategories.includes(category)) {
        cellProperties.className = (cellProperties.className || '') + ' finished-material-summary';
    }
    // Định dạng cho các dòng nhóm con (in đậm, nền xám)
    if (summaryCategories.has(category)) {
        cellProperties.className = (cellProperties.className || '') + ' summary-group-row';
    }
    // Tô màu dòng đã chỉnh sửa
    if (isEdited) {
        cellProperties.className = (cellProperties.className || '') + ' edited-row';
    }
    // Căn lề trái cho cột Hạng mục và Ghi chú
    if (col === 1|| col === 9) {
        cellProperties.className = (cellProperties.className || '') + ' align-left';
    }
    // Khóa cột Thành tiền
    if (prop === 'total_cost') {
        cellProperties.readOnly = true;
    }
    return cellProperties;
},
            afterBeginEditing: function(row, col) {
                console.log(`Bắt đầu chỉnh sửa ô tại dòng ${row}, cột ${col}`);
            },
            afterSelection: function(row, col, row2, col2) {
                console.log(`Đã chọn ô tại dòng ${row}, cột ${col}`);
            },
            licenseKey: 'non-commercial-and-evaluation'
        });
        // Gắn sự kiện cho ô nhập tài khoản để tự động tải danh sách dự án
        const userIDInput = document.getElementById('userID');
        if (userIDInput) {
            // Đảm bảo sự kiện chỉ được gắn một lần duy nhất
            if (!userIDInput.hasAttribute('data-listener-attached')) {
                userIDInput.addEventListener('blur', function() {
                    // Khi người dùng nhập xong và rời khỏi ô input
                    if (this.value.trim() !== '') {
                        listCloudProjects(); // Tự động gọi hàm tải danh sách
                      loadMyPriceSetList(); // <-- THÊM DÒNG NÀY để tải luôn danh sách bộ giá
                    }
                });
                // Đánh dấu là đã gắn sự kiện để không bị lặp lại
                userIDInput.setAttribute('data-listener-attached', 'true'); 
            }
        }
    }
}
	// Đóng modal dự toán chi tiết
function closeEstimateModal() {
    const modal = document.getElementById('estimateModal');
    modal.classList.add('hidden');
}
	// Thêm dòng mới vào bảng dự toán
function insertRow() {
    if (!estimateTable) {
        return;
    }
    const selected = estimateTable.getSelectedLast();
    let rowIndex = estimateData.length;
    if (selected && selected[0] >= 0) {
        rowIndex = selected[0];
    }
    const newRow = {
    category: '',
    item: '',
    unit: '',
    type_origin: '',
    quantity: 0,
    coefficient: 1, // <-- Hệ số mặc định là 1
    total_quantity: 0, // <-- Tổng số lượng ban đầu là 0 (vì Số lượng là 0)
    unit_price: 0,
    total_cost: 0,
    note: '',
    is_edited: true // Đánh dấu là dòng mới để có thể nhận biết
};
    estimateData.splice(rowIndex, 0, newRow);
    estimateTable.loadData(estimateData);
    estimateTable.selectCell(rowIndex, 0);
}
	// Xóa dòng được chọn trong bảng dự toán
function deleteRow() {
    if (!estimateTable) {
        alert('Bảng dữ liệu chưa được khởi tạo!');
        return;
    }
    const selected = estimateTable.getSelected();
    console.log('Vùng chọn:', selected);

    if (!selected || selected.length === 0) {
        alert('Vui lòng chọn ít nhất một dòng bằng cách nhấp vào tiêu đề dòng bên trái hoặc bôi đen các ô trong dòng!');
        return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa các dòng đã chọn?')) {
        return;
    }
    const rowsToDelete = new Set();
    selected.forEach(([startRow, startCol, endRow, endCol]) => {
        console.log(`Chọn từ dòng ${startRow} đến ${endRow}, cột ${startCol} đến ${endCol}`);
        for (let i = Math.min(startRow, endRow); i <= Math.max(startRow, endRow); i++) {
            if (i >= 0 && i < estimateData.length) {
                rowsToDelete.add(i);
            }
        }
    });
    if (rowsToDelete.size === 0) {
        alert('Không tìm thấy dòng hợp lệ để xóa. Vui lòng kiểm tra lại vùng chọn.');
        return;
    }
    [...rowsToDelete].sort((a, b) => b - a).forEach(i => {
        estimateData.splice(i, 1);
    });
    estimateTable.loadData(estimateData);
    estimateTable.render();
    if (estimateData.length > 0) {
        const nextRow = Math.min(...rowsToDelete, estimateData.length - 1);
        estimateTable.selectCell(nextRow >= estimateData.length ? estimateData.length - 1 : nextRow, 0);
    } else {
        estimateTable.deselectCell();
    }
}
	// Tự động tính tổng thành tiền khi bấm lưu
function updateGroupedTotalCost(groupItem) {
    const groupIndex = estimateData.findIndex(row => row.item === groupItem);
    if (groupIndex === -1) return;
    const groupPrefix = estimateData[groupIndex].category.split('.')[0];
    let sum = 0;
    estimateData.forEach((row, idx) => {
        const cat = row.category || '';
        const isChild = cat.startsWith(groupPrefix + '.') && idx !== groupIndex;
        if (isChild && !isNaN(row.total_cost)) {
            sum += Number(row.total_cost);
        }
    });
    estimateData[groupIndex].total_cost = Math.round(sum);
}
	// Lưu dữ liệu bảng dự toán vào localStorage
function saveEstimate() {
    if (estimateTable) {
        try {
            const rawData = estimateTable.getSourceData();
            // Cập nhật estimateData từ bảng, giữ lại is_edited
            estimateData = rawData.map((row, index) => ({
    category: row.category || '',
    item: row.item || '',
    unit: row.unit || '',
    type_origin: row.type_origin || '',
    quantity: Number(row.quantity) || 0,
    // --- BỔ SUNG DỮ LIỆU BỊ THIẾU KHI LƯU ---
    coefficient: Number(row.coefficient) || 1, // Lấy giá trị Hệ số, nếu rỗng thì mặc định là 1
    total_quantity: Number(row.total_quantity) || 0, // Lấy giá trị Tổng khối lượng
    // --- KẾT THÚC BỔ SUNG ---
    unit_price: Math.round(Number(row.unit_price)) || 0, // Đảm bảo đơn giá cũng được làm tròn khi lưu
    total_cost: Math.round(Number(row.total_cost)) || 0, // Đảm bảo thành tiền được làm tròn khi lưu
    note: row.note || '',
    is_edited: estimateData[index]?.is_edited === true
}));
            // 🔁 Cập nhật lại tổng cho các nhóm sau khi lấy estimateData mới
            updateGroupedTotalCost('Chi phí vật liệu thô');
            updateGroupedTotalCost('Chi phí vật liệu hoàn thiện');
            updateGroupedTotalCost('Chi phí giao khoán (vật liệu và nhân công)');
         	calculateAllSubTotals(); 
          	updateAndRenderGrandTotal();
            // 💾 Lưu lại vào localStorage
            localStorage.setItem('estimateData', JSON.stringify(estimateData));
            // 🔄 Cập nhật lại bảng để hiển thị giá trị vừa tính
            if (estimateTable) {
                estimateTable.loadData(estimateData);
                estimateTable.render();
            }
            alert('Đã lưu dữ liệu vào bộ nhớ tạm, nếu bạn load lại web sẽ bị mất. Hãy "Lưu/ Mở Cloud"');
        } catch (error) {
            alert('Lỗi khi lưu dữ liệu: ' + error.message);
        }
    }
}
	// Danh sách các category của dòng cần in đậm và tính tổng
const summaryCategories = new Set([
    '1.1', '1.2','1.3','1.4','1.5','1.6','1.7','1.8', '2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','3.1','3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10',
    '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10'
]);
function calculateAllSubTotals() {
    if (!estimateData) return;
    //Danh sách các đầu mục STT dòng cần tính tổng
    const summaryCategories = new Set([
        '1.1', '1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','1.10', '2.1', '2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','2.10', '3.1', '3.2', '3.3', '3.4','3.5','3.6','3.7','3.8','3.9','3.10', 
        '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10'
    ]);
    // Các mục tổng hạng mục chính
    const mainCategories = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    summaryCategories.forEach(parentCategory => {
        let subTotal = 0;
        const grandChildRegex = new RegExp(`^${parentCategory}\\.\\d+`);
        estimateData.forEach(row => {
            if (row.category && grandChildRegex.test(row.category)) {
                subTotal += (Number(row.total_cost) || 0);
            }
        });
        const parentRowIndex = estimateData.findIndex(row => row.category === parentCategory);
        if (parentRowIndex !== -1) {
            estimateData[parentRowIndex].total_cost = Math.round(subTotal);
        }
    });
    mainCategories.forEach(mainCat => {
        let mainTotal = 0;
        // Biểu thức Regex này tìm tất cả các mục là "con trực tiếp" của mục đang xét.
        // Dấu $ ở cuối là quan trọng nhất, nó đảm bảo chỉ khớp với '1.1' mà không khớp với '1.1.1'.
        const childRegex = new RegExp(`^${mainCat}\\.\\d+$`);

        estimateData.forEach(row => {
            if (row.category && childRegex.test(row.category)) {
                mainTotal += (Number(row.total_cost) || 0);
            }
        });
        const mainParentIndex = estimateData.findIndex(row => row.category === mainCat);
        if (mainParentIndex !== -1) {
            estimateData[mainParentIndex].total_cost = Math.round(mainTotal);
        }
    });
}
	//Hiển thị dòng tổng cộng cuối bảng
function updateAndRenderGrandTotal() {
    if (!estimateData) return 0;

    const showRoughOnlyToggle = document.getElementById('showRoughOnlyToggle');
    const isRoughOnly = showRoughOnlyToggle ? showRoughOnlyToggle.checked : false;

    // Loại bỏ dòng tổng cũ để tính lại
    const existingTotalIndex = estimateData.findIndex(row => row.category === 'TONG');
    if (existingTotalIndex > -1) {
        estimateData.splice(existingTotalIndex, 1);
    }

    let grandTotal = 0;
    const mainCategoriesToSum = isRoughOnly ? ['1', '2'] : ['1', '2', '3', '4'];

    estimateData.forEach(row => {
        if (row.category && mainCategoriesToSum.includes(row.category)) {
            grandTotal += (Number(row.total_cost) || 0);
        }
    });

    grandTotal = Math.round(grandTotal);

    // Thêm dòng tổng mới vào mảng dữ liệu
    estimateData.push({
        category: 'TONG',
        item: 'TỔNG CHI PHÍ XÂY DỰNG',
        unit: 'vnđ',
        type_origin: '',
        quantity: '', coefficient: '', total_quantity: '', unit_price: '',
        total_cost: grandTotal,
        note: ''
    });

    // Cập nhật các ô hiển thị riêng biệt trong modal
    const totalFullCostDisplay = document.getElementById('modalTotalFullCostDisplay');
    const grandTotalDisplay = document.getElementById('modalGrandTotalDisplay');
    const profitDisplay = document.getElementById('modalProfitDisplay');

    if (grandTotalDisplay) {
        grandTotalDisplay.textContent = grandTotal.toLocaleString('vi-VN');
    }

    if (profitDisplay && totalFullCostDisplay) {
        const totalFullText = totalFullCostDisplay.textContent.replaceAll('.', '').replace(' vnđ', '');
        const totalFull = parseFloat(totalFullText) || 0;
        const profit = totalFull - grandTotal;
        let profitText = profit.toLocaleString('vi-VN') + ' vnđ';
        if (grandTotal > 0) {
            const profitPercentage = (profit / grandTotal) * 100;
            profitText += ` (${profitPercentage.toFixed(2)}%)`;
        }
        profitDisplay.textContent = profitText;
    }

    return grandTotal;
}
	// === HÀM exportData NÂNG CẤP - LƯU CẢ TRẠNG THÁI FORM ===
function exportData() {
    if (!estimateData || !Array.isArray(estimateData)) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    // 1. Định nghĩa danh sách ID của tất cả các ô input cần lưu
    const inputIdsToSave = [
        'location', 'buildingType', 'facade', 'architecture', 'smallFloorAreaExtraCost',
        'road', 'bedrooms', 'bathrooms', 'mezzanineCount', 'balconies','altarRooms', 
        'familyRooms', 'readingRooms', 'dressingRooms', 'foundationType', 'foundationArea',
        'basementType', 'basementArea', 'groundFloorType', 'groundFloorArea', 'mezzanineArea', 
        'numFloors', 'terraceArea','uncoveredBalconyArea', 'roofArea', 'roofType2', 'roofType4', 'roofType5', 'roofArea2', 'roofArea4', 'roofArea5', 'roofType3', 
        'roofArea3', 'frontYardType', 'frontYardArea', 'backYardType', 'backYardArea',
        'pileLength', 'elevatorStops', 'poolArea'
    ];
    const checkboxIdsToSave = [
        'isDifficultConstruction', 'isSplitLevel', 'neighborSupport', 
        'pileDriving', 'elevator', 'pool', 'BVXPXD', 'TK'
    ];

    // 2. Thu thập giá trị từ các ô input và checkbox
    const formState = {};
    inputIdsToSave.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            formState[id] = element.value;
        }
    });
    checkboxIdsToSave.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            formState[id] = element.checked;
        }
    });
    // Thu thập giá trị của các tầng động (floor2Area, floor3Area,...)
    const numFloors = parseInt(formState['numFloors']) || 0;
    for (let i = 2; i <= numFloors + 1; i++) {
        const floorId = `floor${i}Area`;
        const floorElement = document.getElementById(floorId);
        if (floorElement) {
            formState[floorId] = floorElement.value;
        }
    }
    // 3. Tạo một đối tượng "snapshot" chứa cả trạng thái form và dữ liệu bảng
    const snapshot = {
        formState: formState,
        estimateData: estimateData
    };
    // 4. Lưu đối tượng snapshot này thành file JSON
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    saveAs(blob, `DuToan_${new Date().toISOString().slice(0, 10)}.json`);
}
	// === HÀM importData PHIÊN BẢN HOÀN CHỈNH NHẤT ===
function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const snapshot = JSON.parse(e.target.result);

            if (!snapshot.formState || !snapshot.estimateData) {
                throw new Error('File JSON không đúng định dạng. Vui lòng chọn file đã được lưu từ phiên bản mới nhất.');
            }
            // --- BƯỚC 1: KHÔI PHỤC TRẠNG THÁI FORM (Giữ nguyên như cũ) ---
            const formState = snapshot.formState;
            for (const id in formState) {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = formState[id];
                    } else {
                        element.value = formState[id];
                    }
                }
            }
            const numFloors = parseInt(formState['numFloors']) || 0;
            const numFloorsInput = document.getElementById('numFloors');
            numFloorsInput.value = 0;
            changeFloors(numFloors);

            for (let i = 2; i <= numFloors + 1; i++) {
                const floorId = `floor${i}Area`;
                const floorElement = document.getElementById(floorId);
                if (floorElement && formState[floorId] !== undefined) {
                    floorElement.value = formState[floorId];
                }
            }
            
            drawBuilding();
            // --- BƯỚC 2: TẢI DỮ LIỆU BẢNG VÀ KHÔI PHỤC ĐÚNG TRẠNG THÁI "IS_EDITED" ---
            // Lấy dữ liệu bảng từ file đã lưu
            const importedEstimateData = snapshot.estimateData;
            // **THAY ĐỔI QUAN TRỌNG Ở ĐÂY**
            // Chúng ta không gán is_edited = true cho tất cả nữa,
            // mà sẽ khôi phục lại đúng giá trị is_edited đã được lưu trong file.
            const restoredData = importedEstimateData.map(row => ({
                ...row, // Giữ lại tất cả các thuộc tính cũ
                // Đảm bảo is_edited là true/false, tránh các giá trị không mong muốn
                is_edited: row.is_edited === true 
            }));
            // Tải dữ liệu đã được khôi phục đúng trạng thái vào ứng dụng
            estimateData = restoredData;
            if (estimateTable) {
                estimateTable.loadData(estimateData);
                estimateTable.render();
            }
            // Chạy lại toàn bộ hàm tính toán MỘT LẦN để cập nhật các giá trị tổng
            // và các giá trị tự động dựa trên form vừa khôi phục.
            calculateCosts();
            alert('Đã khôi phục toàn bộ dự án thành công!');
        } catch (error) {
            alert('Lỗi khi mở tệp dự án: ' + error.message);
        }
    };
    reader.readAsText(file);
}
//Bắt đầu hàm xuất dự toán chi tiết ra excel ======================================================================      
async function exportToExcel() {
    if (!estimateTable) {
        alert('Bảng dữ liệu chưa được khởi tạo!');
        return;
    }
    // 1. Lọc để chỉ giữ lại những dòng đang hiển thị
    const allData = estimateTable.getSourceData();
    const hiddenRowsPlugin = estimateTable.getPlugin('hiddenRows');
    const hiddenRowIndexes = new Set(hiddenRowsPlugin.getHiddenRows());
    const dataToExport = allData.filter((row, index) => !hiddenRowIndexes.has(index));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('DuToanChiTiet');
    // --- Phần tạo tiêu đề và thông tin công trình (Giữ nguyên) ---
    ws.addRow([]);
    const titleRow = ws.addRow(['BẢNG DỰ TOÁN CHI TIẾT']);
    titleRow.getCell(1).font = { size: 16, bold: true };
    titleRow.getCell(1).alignment = { horizontal: 'center' };
    ws.mergeCells('A2:J2');
    ws.addRow(['Địa điểm xây dựng:', document.getElementById('location').value]);
    ws.mergeCells('B4:D4');
    ws.getRow(4).getCell(1).font = { bold: true };
    ws.addRow(['Ngày lập:', new Date().toLocaleDateString('vi-VN')]);
    ws.mergeCells('B5:D5');
    ws.getRow(5).getCell(1).font = { bold: true };
    ws.addRow([]);
    const headerRowIndex = 7;
    const headers = ['STT', 'Hạng mục', 'ĐVT', 'Chủng loại/ Quy cách', 'Số lượng', 'Hệ số', 'Tổng số lượng', 'Đơn giá', 'Thành tiền', 'Ghi chú'];
    const headerRow = ws.getRow(headerRowIndex);
    headerRow.values = headers;
    // --- Phần định dạng tiêu đề (Giữ nguyên) ---
    headerRow.font = { color: { argb: 'FFFFFF' }, bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '004080' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    const startRow = headerRowIndex + 1;
    // 2. Tạo "Bản đồ vị trí" HOÀN CHỈNH trước khi ghi dữ liệu
    const categoryRowMap = new Map();
    dataToExport.forEach((row, index) => {
        if (row.category) {
            // Gán STT với số dòng thực tế sẽ được ghi trong Excel
            categoryRowMap.set(row.category, startRow + index);
        }
    });
    // 3. Bắt đầu ghi dữ liệu và công thức (giờ đã có bản đồ đầy đủ)
    dataToExport.forEach((row, index) => {
        const currentRowIndex = startRow + index;
        if (row.category === 'TONG') return;
        const isMainCategory = row.category && /^\d+$/.test(row.category);
        const isSubCategory = row.category && /^\d+\.\d+$/.test(row.category) && !/^\d+\.\d+\.\d+$/.test(row.category);
        const excelRow = ws.addRow([
            row.category, row.item, row.unit, row.type_origin,
            (isMainCategory || isSubCategory) ? '' : (Number(row.quantity) || 0),
            (isMainCategory || isSubCategory) ? '' : (Number(row.coefficient) || 0),
            null, null, null, row.note
        ]);
        // Tạo công thức
        if (!isMainCategory && !isSubCategory) {
            excelRow.getCell('G').value = { formula: `E${currentRowIndex}*F${currentRowIndex}` };
            excelRow.getCell('H').value = Number(row.unit_price) || 0;
            excelRow.getCell('I').value = { formula: `ROUND(G${currentRowIndex}*H${currentRowIndex}, 0)` };
        } else {
            const childrenAddresses = [];
            dataToExport.forEach(childRow => {
                if (childRow.category && childRow.category.startsWith(row.category + '.') && childRow.category.split('.').length === row.category.split('.').length + 1) {
                    const childExcelRowNumber = categoryRowMap.get(childRow.category);
                    if (childExcelRowNumber) {
                        childrenAddresses.push(`I${childExcelRowNumber}`);
                    }
                }
            });
            if (childrenAddresses.length > 0) {
                excelRow.getCell('I').value = { formula: `SUM(${childrenAddresses.join(',')})` };
            } else {
                excelRow.getCell('I').value = 0;
            }
        }
        // --- Phần định dạng (Giữ nguyên) ---
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', wrapText: true };
            if ([5, 6, 7].includes(colNumber)) { cell.numFmt = '#,##0.00'; }
            else if ([8, 9].includes(colNumber)) { cell.numFmt = '#,##0'; }
        });
        excelRow.getCell('B').alignment.horizontal = 'left';
        excelRow.getCell('J').alignment.horizontal = 'left';
        if (isMainCategory) {
            excelRow.font = { bold: true };
            excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } };
        } else if (isSubCategory) {
            excelRow.font = { bold: true };
            excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
        }
    });
    // Thêm dòng tổng cộng cuối cùng
    const grandTotalRowIndex = startRow + dataToExport.length;
    ws.addRow([]);
    const grandTotalRow = ws.addRow(['', 'TỔNG CHI PHÍ XÂY DỰNG']);
    const totalCostCell = grandTotalRow.getCell(9);
    // Tạo công thức SUM cho dòng tổng cộng
    const mainCategoriesToSum = ['1', '2', '3', '4'].filter(cat => categoryRowMap.has(cat));
    const mainCategoriesAddresses = mainCategoriesToSum.map(cat => `I${categoryRowMap.get(cat)}`);
    if(mainCategoriesAddresses.length > 0) {
        totalCostCell.value = { formula: `SUM(${mainCategoriesAddresses.join(',')})` };
    }
    totalCostCell.numFmt = '#,##0';
    // --- Phần định dạng cuối file (Giữ nguyên) ---
    ws.mergeCells(`B${grandTotalRow.number}:H${grandTotalRow.number}`);
    grandTotalRow.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    grandTotalRow.height = 30;
    grandTotalRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '004080' } };
        cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
        cell.alignment = { vertical: 'middle' };
    });
    grandTotalRow.getCell(1).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' } };
  // Thêm đoạn này để định dạng cho ô cuối cùng của dòng tổng cộng
const finalCell = grandTotalRow.getCell(10); // Cột "Ghi chú" là cột thứ 10
finalCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '004080' } // Tô màu xanh đậm
};
finalCell.border = {
    top: { style: 'medium' },
    bottom: { style: 'medium' },
    right: { style: 'medium' } // Thêm đường viền bên phải
};
    grandTotalRow.getCell(10).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    ws.columns = [ { width: 8 }, { width: 45 }, { width: 10 }, { width: 25 }, { width: 15 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 40 } ];
    ws.views = [{ state: 'frozen', ySplit: headerRowIndex }];
    ws.autoFilter = `A${headerRowIndex}:J${grandTotalRowIndex -1}`;
    // Xuất file
    try {
        const buffer = await wb.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `DuToanChiTiet_DTC_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
        console.error('Lỗi khi xuất file Excel:', error);
        alert('Có lỗi xảy ra khi xuất file Excel.');
    }
}
// === Tính toán chi phí xây dựng ===
function calculateTotalEstimate() {
  let total = 0;
  if (!estimateData || !Array.isArray(estimateData)) return 0;
  estimateData.forEach(row => {
    if (!readOnlyCategories.has(row.category)) {
      const cost = parseFloat(row.total_cost || 0);
      total += cost;
    }
  });
  return total;
}
//Kết thúc hàm xuất dự toán chi tiết ra excel =====================
//Xuất báo giá gửi chủ nhà================================
function printQuote(isPreview = false) {
    calculateCosts(); // Đảm bảo các chi phí được tính toán mới nhất
    // 1. Lấy trạng thái của nút tick "Chỉ hiện phần thô"
    const showRoughOnlyToggle = document.getElementById('showRoughOnlyToggle');
    const isRoughOnly = showRoughOnlyToggle ? showRoughOnlyToggle.checked : false;
    // 2. Lấy tất cả các giá trị cần thiết từ giao diện
    const location = document.getElementById('location').value;
    const buildingType = document.getElementById('buildingType').options[document.getElementById('buildingType').selectedIndex].text;
    const bedrooms = document.getElementById('bedrooms').value;
    const bathrooms = document.getElementById('bathrooms').value;
    const altarRooms = document.getElementById('altarRooms').value;
    const familyRooms = document.getElementById('familyRooms').value;
    const readingRooms = document.getElementById('readingRooms').value;
    const dressingRooms = document.getElementById('dressingRooms').value;
    const balconies = document.getElementById('balconies').value;
    const mezzanineCount = document.getElementById('mezzanineCount').value;
    const areaBreakdown = document.getElementById('areaBreakdownContainer').textContent;
    const totalLaborCost = document.getElementById('totalLaborCost').value;
    const laborUnitPrice = document.getElementById('laborCost').value;
    const totalRoughCost = document.getElementById('totalRoughCost').value;
    const roughUnitPrice = document.getElementById('roughCost').value;
    const fullUnitPrice = document.getElementById('fullCost').value;
    const fulltotalArea = document.getElementById('totalArea').value;
    const houseCost = document.getElementById('houseCost').textContent;
    const pileCost = document.getElementById('pileCost').textContent;
    const neighborCost = document.getElementById('neighborCost').textContent;
    const elevatorCost = document.getElementById('elevatorCost').textContent;
    const poolCost = document.getElementById('poolCost').textContent;
    const BVXPXDCost = document.getElementById('BVXPXDCost').textContent;
    const TKCost = document.getElementById('TKCost').textContent;
    const totalFullCost = document.getElementById('totalFullCost').value;
    // 3. Quyết định nội dung và giá trị sẽ hiển thị dựa vào lựa chọn của người dùng
    let titleForTableD;
    let mainBuildCost;
    let finalTotalCost;
    if (isRoughOnly) {
        // Nếu chỉ xem phần thô
        titleForTableD = "BẢNG TỔNG HỢP CHI PHÍ (GÓI PHẦN THÔ & NHÂN CÔNG HOÀN THIỆN)";
        mainBuildCost = totalRoughCost; // Chi phí chính là chi phí phần thô
        // Tính lại tổng cộng dự kiến chỉ bao gồm phần thô và các hạng mục khác
        const roughNum = parseFloat(totalRoughCost.replace(/\D/g, '')) || 0;
        const pileNum = parseFloat(pileCost.replace(/\D/g, '')) || 0;
        const neighborNum = parseFloat(neighborCost.replace(/\D/g, '')) || 0;
        const elevatorNum = parseFloat(elevatorCost.replace(/\D/g, '')) || 0;
        const poolNum = parseFloat(poolCost.replace(/\D/g, '')) || 0;
        const bvxpxdNum = parseFloat(BVXPXDCost.replace(/\D/g, '')) || 0;
        const tkNum = parseFloat(TKCost.replace(/\D/g, '')) || 0;
        const totalRoughPackage = roughNum + pileNum + neighborNum + elevatorNum + poolNum + bvxpxdNum + tkNum;
        finalTotalCost = totalRoughPackage.toLocaleString('vi-VN');
    } else {
        // Nếu xem trọn gói (như cũ)
        titleForTableD = "BẢNG TỔNG HỢP CHI PHÍ (GÓI TRỌN GÓI)";
        mainBuildCost = houseCost;
        finalTotalCost = totalFullCost;
    }
    // 4. Lọc dữ liệu cho bảng vật tư
    let dataForQuote = window.estimateData;
    if (estimateTable) {
        const allData = estimateTable.getSourceData();
        const hiddenRowsPlugin = estimateTable.getPlugin('hiddenRows');
        const hiddenRowIndexes = new Set(hiddenRowsPlugin.getHiddenRows());
        dataForQuote = allData.filter((row, index) => !hiddenRowIndexes.has(index));
    }
    // Hàm generateMaterialTable được giữ nguyên
    function generateMaterialTable(categoryPrefix, title, dataToUse) {
        let tableHTML = `<h2 class="section-title">${title}</h2><table class="materials-table"><tr><th style="width: 50px;">STT</th><th>Hạng mục / Vật tư</th><th>Chủng loại / Quy cách / Thương hiệu</th><th style="width: 80px;">Đơn vị</th><th style="width: 120px; text-align: right;">Đơn giá (vnđ)</th></tr>`;
        const data = dataToUse || window.estimateData;
        if (data && Array.isArray(data)) {
            data.forEach(row => {
                if (row.category && String(row.category).startsWith(categoryPrefix + '.') && !String(row.category).match(/^\d+\.\d+$/)) { // Bổ sung điều kiện để loại bỏ dòng tổng phụ
                    const formattedPrice = (Math.round(row.unit_price) || 0).toLocaleString('vi-VN');
                    tableHTML += `<tr><td>${row.category}</td><td>${row.item}</td><td>${row.type_origin || 'Theo quy cách tiêu chuẩn'}</td><td>${row.unit || ''}</td><td style="text-align: right;">${formattedPrice}</td></tr>`;
                }
            });
        }
        tableHTML += `</table>`;
        return tableHTML;
    }
    // 5. Tạo các bảng vật tư một cách có điều kiện
    const roughMaterialsHTML = generateMaterialTable('2', 'E. DANH MỤC VẬT TƯ THÔ SỬ DỤNG', dataForQuote);
    let finishingMaterialsHTML = '';
    let outsourcedWorksHTML = '';
    if (!isRoughOnly) {
        finishingMaterialsHTML = generateMaterialTable('3', 'F. DANH MỤC VẬT TƯ HOÀN THIỆN', dataForQuote);
        outsourcedWorksHTML = generateMaterialTable('4', 'G. DANH MỤC CÔNG TÁC GIAO KHOÁN', dataForQuote);
    }
    // 6. Xây dựng nội dung HTML cuối cùng cho file báo giá
    let quoteHTML = `
        <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo Giá Thi Công Xây Dựng</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; } .header h1 { color: #004080; margin: 0; }
            .info-table, .summary-table, .materials-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11pt; }
            .info-table td { padding: 8px; border: 1px solid #ddd; } .info-table td:first-child { font-weight: bold; width: 200px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #004080; color: white; text-align: center;}
            .total-row td { font-weight: bold; font-size: 1.1em; background-color: #f2f2f2; }
            .section-title { font-size: 1.2em; color: #004080; margin-top: 25px; margin-bottom: 10px; border-bottom: 2px solid #004080; padding-bottom: 5px; }
            pre { font-family: 'Courier New', Courier, monospace; background-color: #f5f5f5; padding: 10px; border: 1px solid #eee; white-space: pre-wrap; font-size: 10pt; line-height: 1.4; }
        </style></head><body>
            <div class="header">
                <h2>CÔNG TY TNHH TƯ VẤN VÀ ĐÀO TẠO DTC</h2>
                <p>Địa chỉ: 143A/36 Ung Văn Khiêm, P. 25, Q. Bình Thạnh, TP. HCM</p>
                <p>Hotline: 0913.009.112 - Email: dutoandtc@gmail.com</p><hr>
                <h1>BÁO GIÁ THI CÔNG XÂY DỰNG</h1>
                <p>Ngày: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <h2 class="section-title">A. THÔNG TIN DỰ ÁN</h2>
            <table class="info-table">
                <tr><td>Địa điểm xây dựng:</td><td>${location}</td></tr>
                <tr><td>Loại công trình:</td><td>${buildingType}</td></tr>
                <tr><td>Quy mô:</td><td> ${bedrooms > 0 ? `${bedrooms} phòng ngủ, ` : ''}${bathrooms > 0 ? `${bathrooms} phòng WC, ` : ''}${altarRooms > 0 ? `${altarRooms} phòng thờ, ` : ''}${familyRooms > 0 ? `${familyRooms} sinh hoạt chung, ` : ''}${readingRooms > 0 ? `${readingRooms} phòng đọc sách, ` : ''}${dressingRooms > 0 ? `${dressingRooms} phòng thay đồ, ` : ''}${balconies > 0 ? `${balconies} ban công, ` : ''}${mezzanineCount > 0 ? `${mezzanineCount} tầng lửng` : ''}</td></tr>
            </table>
            <h2 class="section-title">B. DIỄN GIẢI CÁCH TÍNH DIỆN TÍCH XÂY DỰNG</h2><pre>${areaBreakdown}</pre>
            <h2 class="section-title">C. CÁC GÓI CHI PHÍ THI CÔNG ĐỂ LỰA CHỌN</h2>
            <table class="summary-table">
                <tr><th>Gói thi công</th><th style="text-align: center;">Diện tích (m²)</th><th style="text-align: center;">Đơn giá (vnđ/m²)</th><th style="text-align: center;">Thành tiền (vnđ)</th></tr>
                <tr><td>1. Gói Nhân công xây dựng</td><td style="text-align: right;">${fulltotalArea}</td><td style="text-align: right;">${(parseInt(laborUnitPrice.replace(/\D/g,'')) || 0).toLocaleString('vi-VN')}</td><td style="text-align: right;">${totalLaborCost}</td></tr>
                <tr><td>2. Gói Phần thô & Nhân công hoàn thiện</td><td style="text-align: right;">${fulltotalArea}</td><td style="text-align: right;">${(parseInt(roughUnitPrice.replace(/\D/g,'')) || 0).toLocaleString('vi-VN')}</td><td style="text-align: right;">${totalRoughCost}</td></tr>
                ${!isRoughOnly ? `<tr><td>3. Gói Thi công trọn gói (Chìa khóa trao tay)</td><td style="text-align: right;">${fulltotalArea}</td><td style="text-align: right;">${(parseInt(fullUnitPrice.replace(/\D/g,'')) || 0).toLocaleString('vi-VN')}</td><td style="text-align: right;">${totalFullCost}</td></tr>` : ''}
            </table>
            <h2 class="section-title">D. ${titleForTableD}</h2>
            <table class="summary-table">
                <tr><th>Hạng mục</th><th style="text-align: right;">Chi phí (vnđ)</th></tr>
                <tr><td>- Chi phí xây dựng ngôi nhà</td><td style="text-align: right;">${mainBuildCost}</td></tr>
                ${pileCost !== '0' ? `<tr><td>- Chi phí ép cọc</td><td style="text-align: right;">${pileCost}</td></tr>` : ''}
                ${neighborCost !== '0' ? `<tr><td>- Chi phí cừ chống đổ</td><td style="text-align: right;">${neighborCost}</td></tr>` : ''}
                ${elevatorCost !== '0' ? `<tr><td>- Chi phí thang máy</td><td style="text-align: right;">${elevatorCost}</td></tr>` : ''}
                ${poolCost !== '0' ? `<tr><td>- Chi phí thi công hồ bơi</td><td style="text-align: right;">${poolCost}</td></tr>` : ''}
                ${BVXPXDCost !== '0' ? `<tr><td>- Chi phí bản vẽ & dịch vụ XPXD</td><td style="text-align: right;">${BVXPXDCost}</td></tr>` : ''}
                ${TKCost !== '0' ? `<tr><td>- Chi phí thiết kế kỹ thuật 2D</td><td style="text-align: right;">${TKCost}</td></tr>` : ''}
                <tr class="total-row"><td style="text-align: right;">TỔNG CỘNG DỰ KIẾN:</td><td style="text-align: right;">${finalTotalCost}</td></tr>
            </table>
            ${roughMaterialsHTML}
            ${finishingMaterialsHTML}
            ${outsourcedWorksHTML}
            <div style="margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; text-align: center;">
                <div><strong>Khách hàng</strong><br>(Ký và ghi rõ họ tên)</div>
                <div><strong>Đại diện nhà thầu</strong><br>(Ký và ghi rõ họ tên)</div>
            </div>
        </body></html>
    `;
    // **Logic điều khiển Tải file hoặc Xem trước**
    if (isPreview) {
        // Nếu là xem trước, chỉ trả về chuỗi HTML để hiển thị
        return quoteHTML;
    } else {
        // Nếu là tải thật, thực hiện tải file như cũ
        const blob = new Blob([quoteHTML], { type: 'application/msword' });
        saveAs(blob, 'BaoGiaThiCong.doc');
    }
}
<!-- Bắt đầu hàm định dạng thẳng hàng cho diễn giải công thức tính toán------------> 
function formatBreakdownLine(label, area, factor, result) {
    // Sử dụng padEnd để thêm khoảng trắng, đảm bảo các cột thẳng hàng
    const labelPart = `${label}:`.padEnd(40, ' ');
    const areaPart = `${area.toFixed(2)} m²`.padEnd(12, ' ');
    const factorPart = `x ${factor.toFixed(2)}`.padEnd(8, ' ');
    const resultPart = `= ${result.toFixed(2)} m²`;
    return `${labelPart}${areaPart}${factorPart}${resultPart}\n`;
}
<!-- Kết thúc hàm định dạng thẳng hàng cho diễn giải công thức tính toán------------>  
       function updateOverheadCosts() {
    const showRoughOnlyToggle = document.getElementById('showRoughOnlyToggle');
    const isRoughOnly = showRoughOnlyToggle ? showRoughOnlyToggle.checked : false;

    // Lấy chi phí nền tảng để tính toán
    const directLaborCost = estimateData.find(row => row.category === '1.1.1')?.total_cost || 0;
    const roughMaterialCost = estimateData.find(row => row.category === '2')?.total_cost || 0;

    let baseCostForOverhead;

    if (isRoughOnly) {
        // YÊU CẦU MỚI: Khi tick chọn, đơn giá = tổng thành tiền của mục 1.1.1 và mục 2
        baseCostForOverhead = directLaborCost + roughMaterialCost;
    } else {
        // Logic cũ: Đơn giá = tổng chi phí trực tiếp
        const finishingMaterialCost = estimateData.find(row => row.category === '3')?.total_cost || 0;
        const outsourcedCost = estimateData.find(row => row.category === '4')?.total_cost || 0;
        baseCostForOverhead = directLaborCost + roughMaterialCost + finishingMaterialCost + outsourcedCost;
    }
    // Hàm trợ giúp để cập nhật từng mục chi phí quản lý
    function updateOverheadItem(categoryCode, percentage) {
        const rowIndex = estimateData.findIndex(row => row.category === categoryCode);
        if (rowIndex !== -1) { // <--- Bỏ điều kiện is_edited
            const row = estimateData[rowIndex];
            row.quantity = percentage;
            row.unit_price = Math.round(baseCostForOverhead);
            row.total_quantity = row.quantity * (row.coefficient || 1);
            row.total_cost = Math.round(row.total_quantity * row.unit_price);
        }
    }
    // Áp dụng tính toán cho các mục liên quan
    updateOverheadItem('1.1.2', 0.04); // Lương kỹ sư
    updateOverheadItem('1.2.1', 0.043); // Chi phí quản lý của nhà thầu
    updateOverheadItem('1.2.2', 0.036); // Chi phí hỗ trợ thi công
    updateOverheadItem('1.2.3', 0.02); // Chi phí dự phòng rủi ro
}     
<!-- Bắt đầu hàm tính toán đơn giá sau hệ số điều chỉnh------------> 
function calculateCosts() {
    if (dataJustImported) {
        dataJustImported = false;
        return;
    }
    const { laborCost, roughCost, fullCost } = getAdjustedCosts();
    document.getElementById('laborCost').value = Math.round(laborCost);
    document.getElementById('roughCost').value = Math.round(roughCost);
    document.getElementById('fullCost').value = Math.round(fullCost);
    let breakdown = '';
    let totalArea = 0;
    // Thêm một biến để tự động đánh số thứ tự
    let breakdownCounter = 1;
    // Móng
    const foundationType = document.getElementById('foundationType').value;
    const foundationArea = parseFloat(document.getElementById('foundationArea').value) || 0;
    if (foundationArea > 0) {
        let foundationFactor = foundationType === 'Móng đơn' ? 0.2 : foundationType === 'Móng cọc' ? 0.3 : foundationType === 'Móng băng' ? 0.4 : 0.6;
        if (document.getElementById('groundFloorType').value === 'Nền BTCT') foundationFactor += 0.2;
        const foundationCalc = foundationArea * foundationFactor;
        totalArea += foundationCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Móng (${foundationType})`, foundationArea, foundationFactor, foundationCalc);
        breakdownCounter++;
    }
    // Hầm
    const basementType = document.getElementById('basementType').value;
    const basementArea = parseFloat(document.getElementById('basementArea').value) || 0;
    if (basementArea > 0) {
        const basementFactor = basementType === 'DT lớn 70m2 & Hầm sâu 1-1.3m' ? 1.5 : basementType === 'DT bé 70m2 & Hầm sâu 1-1.3m' ? 1.7 : basementType === 'DT lớn 70m2 & Hầm sâu 1.3-1.7m' ? 1.7 : basementType === 'DT bé 70m2 & Hầm sâu 1.3-1.7m' ? 1.9 : basementType === 'DT lớn 70m2 & Hầm sâu 1.7-2m' ? 2.0 : basementType === 'DT bé 70m2 & Hầm sâu 1.7-2m' ? 2.2 : 2.4;
        const basementFactor2 = basementArea < 70 ? 0.2 : 0;
        const totalBasementFactor = basementFactor + basementFactor2;
        const basementCalc = basementArea * totalBasementFactor;
        totalArea += basementCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Hầm (${basementType})`, basementArea, totalBasementFactor, basementCalc);
        breakdownCounter++;
    }
    // Tầng 1
    const groundFloorArea = parseFloat(document.getElementById('groundFloorArea').value) || 0;
    if (groundFloorArea > 0) {
        totalArea += groundFloorArea;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Tầng 1 (trệt)`, groundFloorArea, 1.0, groundFloorArea);
        breakdownCounter++;
    }
    // Tầng lửng
    const mezzanineArea = parseFloat(document.getElementById('mezzanineArea').value) || 0;
    if (mezzanineArea > 0) {
        totalArea += mezzanineArea;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Tầng lửng`, mezzanineArea, 1.0, mezzanineArea);
        breakdownCounter++;
    }
    // Tầng 2 trở lên
    const numFloors = parseInt(document.getElementById('numFloors').value) || 0;
    for (let i = 2; i <= numFloors + 1; i++) {
        const floorArea = parseFloat(document.getElementById(`floor${i}Area`)?.value) || 0;
        if (floorArea > 0) {
            totalArea += floorArea;
            breakdown += formatBreakdownLine(`${breakdownCounter}. Tầng ${i}`, floorArea, 1.0, floorArea);
            breakdownCounter++;
        }
    }
  // Ban công không mái che
const uncoveredBalconyArea = parseFloat(document.getElementById('uncoveredBalconyArea').value) || 0;
if (uncoveredBalconyArea > 0) {
    const balconyCalc = uncoveredBalconyArea * 0.5;
    totalArea += balconyCalc;
    breakdown += formatBreakdownLine(`${breakdownCounter}. Ban công không mái che`, uncoveredBalconyArea, 0.5, balconyCalc);
    breakdownCounter++;
}
    // Sân thượng
    const terraceArea = parseFloat(document.getElementById('terraceArea').value) || 0;
    if (terraceArea > 0) {
        const terraceCalc = terraceArea * 0.5;
        totalArea += terraceCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Sân thượng`, terraceArea, 0.5, terraceCalc);
        breakdownCounter++;
    }
    // Tum
    const tumArea = parseFloat(document.getElementById('roofArea').value) || 0;
    if (tumArea > 0) {
        const tumCalc = tumArea * 1.0;
        totalArea += tumCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Tum`, tumArea, 1.0, tumCalc);
        breakdownCounter++;
    }
    // Mái loại 1
    const roofArea2 = parseFloat(document.getElementById('roofArea2').value) || 0;
    if (roofArea2 > 0) {
        const roofType2 = document.getElementById('roofType2').value;
        const roofFactor2 = roofType2 === 'Mái tôn' ? 0.3 : roofType2 === 'Mái BTCT' ? 0.5 : roofType2 === 'Mái BTCT nghiêng' ? 0.7 : roofType2 === 'Vì kèo lợp ngói 30 độ' ? 0.91 : roofType2 === 'Vì kèo lợp ngói 45 độ' ? 0.98 : roofType2 === 'Mái BTCT lợp ngói 30 độ' ? 1.3 : 1.4;
        const roofCalc = roofArea2 * roofFactor2;
        totalArea += roofCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Mái (${roofType2})`, roofArea2, roofFactor2, roofCalc);
        breakdownCounter++;
    }
    // Mái loại 2
    const roofArea4 = parseFloat(document.getElementById('roofArea4').value) || 0;
    if(roofArea4 > 0) {
        const roofType4 = document.getElementById('roofType4').value;
        const roofFactor4 = roofType4 === 'Mái tôn' ? 0.3 : roofType4 ==='Mái BTCT' ? 0.5 : roofType4 === 'Mái BTCT nghiêng' ? 0.7 : roofType4 === 'Vì kèo lợp ngói 30 độ' ? 0.91 :roofType4 === 'Vì kèo lợp ngói 45 độ' ? 0.98 :roofType4 === 'Mái BTCT lợp ngói 30 độ' ? 1.3 : 1.4;
        const roof4Calc = roofArea4 * roofFactor4;
        totalArea += roof4Calc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Mái (${roofType4})`, roofArea4, roofFactor4, roof4Calc);
        breakdownCounter++;
    }
    // Mái loại 3
    const roofArea5 = parseFloat(document.getElementById('roofArea5').value) || 0;
    if(roofArea5 > 0) {
        const roofType5 = document.getElementById('roofType5').value;
        const roofFactor5 = roofType5 === 'Mái tôn' ? 0.3 : roofType5 ==='Mái BTCT' ? 0.5 : roofType5 === 'Mái BTCT nghiêng' ? 0.7 : roofType5 === 'Vì kèo lợp ngói 30 độ' ? 0.91 :roofType5 === 'Vì kèo lợp ngói 45 độ' ? 0.98 :roofType5 === 'Mái BTCT lợp ngói 30 độ' ? 1.3 : 1.4 ;
        const roof5Calc = roofArea5 * roofFactor5;
        totalArea += roof5Calc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Mái (${roofType5})`, roofArea5, roofFactor5, roof5Calc);
        breakdownCounter++;
    }
    // Thông tầng
    const roofArea3 = parseFloat(document.getElementById('roofArea3').value) || 0;
    if (roofArea3 > 0) {
        const roofType3 = document.getElementById('roofType3').value;
        const roofFactor3 = roofType3 === 'Nhỏ hơn bằng 8m2' ? 1.0 : 0.5;
        const roof3Calc = roofArea3 * roofFactor3;
        totalArea += roof3Calc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Thông tầng`, roofArea3, roofFactor3, roof3Calc);
        breakdownCounter++;
    }
    // Sân trước
    const frontYardArea = parseFloat(document.getElementById('frontYardArea').value) || 0;
    if (frontYardArea > 0) {
        const frontYardType = document.getElementById('frontYardType').value;
        const frontYardFactor = frontYardType === 'Có mái che' ? 1.0 : 0.7;
        const frontYardCalc = frontYardArea * frontYardFactor;
        totalArea += frontYardCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Sân trước (${frontYardType})`, frontYardArea, frontYardFactor, frontYardCalc);
        breakdownCounter++;
    }
    // Sân sau
    const backYardArea = parseFloat(document.getElementById('backYardArea').value) || 0;
    if (backYardArea > 0) {
        const backYardType = document.getElementById('backYardType').value;
        const backYardFactor = backYardType === 'Có mái che' ? 1.0 : 0.7;
        const backYardCalc = backYardArea * backYardFactor;
        totalArea += backYardCalc;
        breakdown += formatBreakdownLine(`${breakdownCounter}. Sân sau (${backYardType})`, backYardArea, backYardFactor, backYardCalc);
        breakdownCounter++;
    }
    const totalLabel = 'TỔNG CỘNG:'.padEnd(35, ' ');
    const emptyArea = ''.padEnd(12, ' ');
    const emptyFactor = ''.padEnd(8, ' ');
    const totalResult = `= ${totalArea.toFixed(2)} m²`;
    breakdown += `${totalLabel}${emptyArea}${emptyFactor}${totalResult}`;
    document.getElementById('areaBreakdownContainer').innerHTML = breakdown;
    //Bắt đầu liên kết hệ số vào các vật liệu thô ===
    // 1. Lấy hệ số điều chỉnh tổng hợp từ các lựa chọn của người dùng.
const combinedAdjustmentFactor = getCombinedAdjustmentFactor();
// 2. DANH SÁCH CÁC VẬT LIỆU CẦN ÁP DỤNG HỆ SỐ (ĐÃ ĐƯỢC MỞ RỘNG)
const materialsToAdjust = new Set([
    // === NHÓM NHÂN CÔNG ===
    // === NHÓM VẬT LIỆU THÔ ===
    '2.1.1', // Thép xây dựng
    '2.1.2', // Xi măng
    '2.1.3', // Đá 1x2
    '2.1.4', // Đá 4x6
    '2.1.5', // Cát vàng bê tông hạt lớn
    '2.1.6', // Cát xây tô hạt mịn
    '2.1.7', // Cát nền
    '2.1.8', // Gạch xây
    // === NHÓM VẬT LIỆU HOÀN THIỆN (THÊM CÁC MÃ BẠN MUỐN) ===
    '3.2.1', // Sơn ngoài
    '3.2.2', // Sơn trong
    // ==> Thêm các mã vật liệu hoàn thiện khác bạn muốn áp dụng hệ số vào đây
]);
// 3. Lặp qua toàn bộ dự toán để cập nhật cột "Hệ số" (Giữ nguyên, không thay đổi)
estimateData.forEach(row => {
    if (materialsToAdjust.has(row.category)) {
        if (!row.is_edited) {
             row.coefficient = combinedAdjustmentFactor;
        }
    }
});
    //Kết thúc liên kết hệ số vào các vật liệu thô ===
<!-- Kết thúc hàm tính toán đơn giá sau hệ số điều chỉnh------------>
  
<!-- Bắt đầu tính số lượng vật tư tại bảng dự toán chi tiết------------> 
    // Bước 1: Nhân công
const laborRowIndex = estimateData.findIndex(row => row.category === '1.1.1'); // Tìm dòng có category là '1' (Chi phí nhân công)
if (laborRowIndex !== -1) { // Đảm bảo tìm thấy dòng
    const newQuantity = isNaN(totalArea) || totalArea < 0 ? 0 : totalArea; // Lấy tổng diện tích xây dựng đã quy đổi
    estimateData[laborRowIndex].quantity = newQuantity; // Cập nhật số lượng (diện tích)
    estimateData[laborRowIndex].unit_price = Math.round(laborCost); // Cập nhật đơn giá nhân công
    estimateData[laborRowIndex].total_cost = Math.round(newQuantity * estimateData[laborRowIndex].unit_price); // Tính lại thành tiền
}
  // Bước 2: Cập nhật estimateData khối lượng cơ bản theo diện tích sàn
function updateMaterial(categoryCode, quantityFormula) {
    const index = estimateData.findIndex(row => row.category === categoryCode);
    if (index !== -1 && !estimateData[index].is_edited) {
        const qty = Math.round(quantityFormula * 100) / 100;
        const unitPrice = estimateData[index].unit_price || 0;
        const coefficient = estimateData[index].coefficient || 1;
        const totalQuantity = qty * coefficient;
        const totalCost = Math.round(totalQuantity * unitPrice);
        estimateData[index].quantity = qty;
        estimateData[index].total_quantity = totalQuantity;
        estimateData[index].total_cost = totalCost;
    }
}
		// Danh sách các vật liệu cần tính toán
const materialConfigs = [
  	//{ category: '2.1.1', formula: totalArea * 35 }, // Thép xây dựng
  	//{ category: '2.1.2', formula: totalArea * 112 }, // Xi măng
  	//{ category: '2.1.3', formula: totalArea * 0.25 }, // Đá 1x2
  	//{ category: '2.1.4', formula: totalArea * 0.01 }, // Đá 4x6
  	//{ category: '2.1.5', formula: totalArea * 0.15 }, // Cát vàng bê tông
  	//{ category: '2.1.6', formula: totalArea * 0.2 },  // Cát xây tô hạt mịn
  	//{ category: '2.1.7', formula: totalArea * 0.2 },  // Cát nền
  	//{ category: '2.1.8', formula: totalArea * 150 },   // Gạch xây
    //{ category: '2.1.9', formula: totalArea * 1.3 } ,  // Dung dịch chống thấm
    //{ category: '2.2.1', formula: totalArea * 1.1 },   // Ống thoát nước PVC các loại
	//{ category: '2.2.2', formula: totalArea * 1.2 },   // Ống cấp nước lạnh PPR các loại
	//{ category: '2.2.3', formula: totalArea * 13 },   // Dây điện các loại
	//{ category: '2.2.5', formula: totalArea * 0.026 },  // Ống ruột gà
	//{ category: '2.2.6', formula: totalArea * 3 }, // Ống cứng luồn dây điện âm sàn
	//{ category: '2.2.7', formula: totalArea * 0.3 }, // Cáp điện thoại, truyền hình
	//{ category: '2.2.8', formula: totalArea * 1.3 }, // Cáp internet AMP CAT5
	//{ category: '2.2.10', formula: totalArea * 1.6 }, // Phụ kiện nước các loại
	//{ category: '2.2.11', formula: totalArea * 0.4 }, // Hộp nối
	//{ category: '2.2.13', formula: totalArea * 0.2 }, // Ống đồng máy lạnh
	//{ category: '2.2.14', formula: totalArea * 0.15 }, // Ống thoát nước ngưng máy lạnh
  	//{ category: '3.1.1', formula: totalArea * 0.4 }, // Gạch lát nền các tầng
  	//{ category: '3.1.1', formula: totalFlooringArea * 1 }, // Sơn ngoài
  	//{ category: '3.1.2', formula: totalFlooringArea * 3 }, // Sơn trong
];
		// Lặp qua danh sách và cập nhật
if (window.consumptionRates) {
  Object.keys(window.consumptionRates).forEach(categoryCode => {
    const rate = window.consumptionRates[categoryCode];
    if (rate > 0) {
      const quantityFormula = totalArea * rate;
      // Tái sử dụng hàm updateMaterial đã có sẵn
      updateMaterial(categoryCode, quantityFormula);
    }
  });
}
		// Cập nhật estimateData cho Tủ điện chống giật
const electricCabinetRowIndex = estimateData.findIndex(row => row.category === '2.2.4');
		// Giữ lại câu lệnh 'if' để đảm bảo không ghi đè lên dữ liệu người dùng đã sửa tay
if (electricCabinetRowIndex !== -1 && !estimateData[electricCabinetRowIndex].is_edited) {
    let numElectricCabinets = 0;
    const numFloors = parseInt(document.getElementById('numFloors').value) || 0;
    numElectricCabinets += (numFloors); // SL tầng
    const basementArea = parseFloat(document.getElementById('basementArea').value) || 0;
    if (basementArea > 0) {
        numElectricCabinets += 1;
    }
    const mezzanineArea = parseFloat(document.getElementById('mezzanineArea').value) || 0;
    if (mezzanineArea > 0) {
        numElectricCabinets += 1;
    }
    const roofArea = parseFloat(document.getElementById('roofArea').value) || 0;
    if (roofArea > 0) {
        numElectricCabinets += 1;
    }
    updateDeviceQuantity('2.2.4', numElectricCabinets);
}
		// Tính tổng diện tích sân thượng, ban công, sân trước, sau link vào dự toán chi tiết
const tileAreaRowIndex = estimateData.findIndex(row => row.category === '3.1.2');
if (tileAreaRowIndex !== -1 && !estimateData[tileAreaRowIndex].is_edited) {
    // Lấy giá trị diện tích từng khu vực
    const terraceArea = parseFloat(document.getElementById('terraceArea')?.value) || 0;
  	const uncoveredBalconyArea = parseFloat(document.getElementById('uncoveredBalconyArea')?.value) || 0;
    const frontYardArea = parseFloat(document.getElementById('frontYardArea')?.value) || 0;
    const backYardArea = parseFloat(document.getElementById('backYardArea')?.value) || 0;
    // Tính tổng diện tích thực tế từ các ô nhập liệu
    const totalTileArea = terraceArea + frontYardArea + backYardArea + uncoveredBalconyArea;
    // Cập nhật số lượng (m2) vào bảng dự toán
    estimateData[tileAreaRowIndex].quantity = Math.round(totalTileArea * 100) / 100;
   // Lấy các giá trị liên quan để tính toán lại một cách chính xác
    const tileUnitPrice = estimateData[tileAreaRowIndex].unit_price || 0;
    const tileCoefficient = estimateData[tileAreaRowIndex].coefficient || 1; // Lấy hệ số 1.1
    // Tính lại Tổng số lượng và Thành tiền dựa trên hệ số
    const totalQuantityWithCoeff = totalTileArea * tileCoefficient;
    estimateData[tileAreaRowIndex].total_quantity = Math.round(totalQuantityWithCoeff * 100) / 100;
    estimateData[tileAreaRowIndex].total_cost = Math.round(totalQuantityWithCoeff * tileUnitPrice);
    if (estimateTable) {
        estimateTable.loadData(estimateData);
        estimateTable.render();
    }
}
	// Bước 5: Tính diện tích gạch nền WC dựa trên số lượng WC
const wcTileAreaRowIndex = estimateData.findIndex(row => row.category === '3.1.3'); // Tìm dòng Gạch nền WC
if (wcTileAreaRowIndex !== -1 && !estimateData[wcTileAreaRowIndex].is_edited) {
    // Lấy số lượng phòng WC từ input
    const numBathrooms = parseInt(document.getElementById('bathrooms')?.value) || 0;
    // Tính tổng diện tích, mỗi WC trung bình 4m2
    const totalWCArea = numBathrooms * 4;
    // Cập nhật số lượng (m2) vào bảng dự toán
    estimateData[wcTileAreaRowIndex].quantity = totalWCArea;
    // Lấy các giá trị liên quan để tính toán lại
    const wcTileUnitPrice = estimateData[wcTileAreaRowIndex].unit_price || 0;
    const wcCoefficient = estimateData[wcTileAreaRowIndex].coefficient || 1; // Lấy hệ số đã được gán
    // Tính lại Tổng số lượng và Thành tiền dựa trên hệ số
    const totalQuantityWithCoeff = totalWCArea * wcCoefficient;
    estimateData[wcTileAreaRowIndex].total_quantity = totalQuantityWithCoeff;
    estimateData[wcTileAreaRowIndex].total_cost = Math.round(totalQuantityWithCoeff * wcTileUnitPrice);
}
  // Bước 6: Tính diện tích gạch ốp tường WC dựa trên số lượng WC
const wcWallTileRowIndex = estimateData.findIndex(row => row.category === '3.1.4'); // Tìm dòng Gạch ốp tường WC
if (wcWallTileRowIndex !== -1 && !estimateData[wcWallTileRowIndex].is_edited) {
    // Lấy số lượng phòng WC từ input
    const numBathrooms = parseInt(document.getElementById('bathrooms')?.value) || 0;
    // Tính tổng diện tích, mỗi WC trung bình 17m2 gạch ốp tường
    const totalWCWallArea = numBathrooms * 15;
    // Cập nhật số lượng (m2) vào bảng dự toán
    estimateData[wcWallTileRowIndex].quantity = totalWCWallArea;
    // Lấy các giá trị liên quan để tính toán lại
    const wcWallTileUnitPrice = estimateData[wcWallTileRowIndex].unit_price || 0;
    const wcWallCoefficient = estimateData[wcWallTileRowIndex].coefficient || 1; // Lấy hệ số đã được gán
    // Tính lại Tổng số lượng và Thành tiền dựa trên hệ số
    const totalWallQuantityWithCoeff = totalWCWallArea * wcWallCoefficient;
    estimateData[wcWallTileRowIndex].total_quantity = totalWallQuantityWithCoeff;
    estimateData[wcWallTileRowIndex].total_cost = Math.round(totalWallQuantityWithCoeff * wcWallTileUnitPrice);
}
  // Bước 7: Tính khối lượng keo chà ron dựa trên tổng diện tích ốp lát
const groutRowIndex = estimateData.findIndex(row => row.category === '3.1.7'); // Tìm dòng Keo chà ron
if (groutRowIndex !== -1 && !estimateData[groutRowIndex].is_edited) {
    // Danh sách các mã category của vật tư ốp lát cần tính tổng diện tích
    const tileCategories = [
        '3.1.1', // Gạch lát nền các tầng
        '3.1.2', // Gạch nền sân thượng, sân trước sau, ban công
        '3.1.3', // Gạch nền WC
        '3.1.4', // Gạch ốp tường WC
        '3.1.5', // Gạch ốp tường khu bếp
        '3.1.6', // Gạch ốp tường mặt tiền, cửa chính
        '3.1.8'  // Gạch ốp trang trí khác
    ];
    let totalTiledArea = 0;
    // Vòng lặp để tính tổng diện tích của tất cả các loại gạch
    tileCategories.forEach(categoryCode => {
        const tileRow = estimateData.find(row => row.category === categoryCode);
        if (tileRow) {
            // Cộng dồn 'Số lượng' (là diện tích m2) của từng loại gạch
            totalTiledArea += (Number(tileRow.quantity) || 0);
        }
    });
    // Tính khối lượng keo chà ron cần thiết (0.2 kg/m2)
    const totalGroutQuantity = totalTiledArea * 0.2;
    // Cập nhật số lượng (kg) vào bảng dự toán cho dòng keo chà ron
    estimateData[groutRowIndex].quantity = totalGroutQuantity;
    // Lấy các giá trị liên quan để tính toán lại
    const groutUnitPrice = estimateData[groutRowIndex].unit_price || 0;
    const groutCoefficient = estimateData[groutRowIndex].coefficient || 1;
    // Tính lại Tổng số lượng và Thành tiền dựa trên hệ số
    const totalGroutWithCoeff = totalGroutQuantity * groutCoefficient;
    estimateData[groutRowIndex].total_quantity = totalGroutWithCoeff;
    estimateData[groutRowIndex].total_cost = Math.round(totalGroutWithCoeff * groutUnitPrice);
}
  
 // --- BẮT ĐẦU: Tính số lượng Gạch lát nền các tầng (3.1.1)---
// 1. Tìm vị trí của hàng "Gạch lát nền các tầng" để cập nhật kết quả vào
const floorTileRowIndex = estimateData.findIndex(row => row.category === '3.1.1');
// 2. Kiểm tra an toàn: chỉ chạy khi tìm thấy hàng và nó chưa bị sửa thủ công
if (floorTileRowIndex !== -1 && !estimateData[floorTileRowIndex].is_edited) {
    // 3. Khởi tạo biến để tính tổng diện tích lát sàn
    let totalFlooringArea = 0;
    // 4. Lấy và cộng dồn diện tích THÔ (chưa nhân hệ số) từ các ô nhập liệu được bôi đỏ
    // Cộng diện tích Tầng 1 (trệt)
    totalFlooringArea += parseFloat(document.getElementById('groundFloorArea').value) || 0;
    // Cộng diện tích Tầng lửng
    totalFlooringArea += parseFloat(document.getElementById('mezzanineArea').value) || 0;
    // Cộng diện tích Tum
    totalFlooringArea += parseFloat(document.getElementById('roofArea').value) || 0;
    // Dùng vòng lặp để cộng diện tích của tất cả các tầng trên (Tầng 2, Tầng 3,...)
    const numFloors = parseInt(document.getElementById('numFloors').value) || 0;
    for (let i = 2; i <= numFloors + 1; i++) {
        // Lấy diện tích của từng tầng (ví dụ: floor2Area, floor3Area,...)
        const floorArea = parseFloat(document.getElementById(`floor${i}Area`)?.value) || 0;
        totalFlooringArea += floorArea;
    }
  // 5. TÍNH VÀ TRỪ ĐI DIỆN TÍCH SÀN WC 
    // Lấy số lượng phòng WC từ ô nhập liệu
    const numBathrooms = parseInt(document.getElementById('bathrooms').value) || 0;
    // Tính tổng diện tích sàn WC (giả sử mỗi WC lát sàn trung bình 4m2)
    const totalWCArea = numBathrooms * 4; 
    // Trừ diện tích WC ra khỏi tổng diện tích lát sàn
    totalFlooringArea -= totalWCArea;
    // Đảm bảo diện tích không bao giờ bị âm
    if (totalFlooringArea < 0) {
        totalFlooringArea = 0;
    }  
      // 5. Lấy ra hàng mục tiêu trong mảng estimateData
    const targetRow = estimateData[floorTileRowIndex];
    // 6. Cập nhật số lượng (quantity) cho hàng mục tiêu bằng tổng diện tích vừa tính
    targetRow.quantity = totalFlooringArea;
    // 7. Lấy các giá trị liên quan để tính toán lại
    const coefficient = targetRow.coefficient || 1;
    const unitPrice = targetRow.unit_price || 0;
    // 8. Tính lại "Tổng số lượng" và "Thành tiền" cho hàng này
    targetRow.total_quantity = targetRow.quantity * coefficient;
    targetRow.total_cost = Math.round(targetRow.total_quantity * unitPrice);
}
// --- KẾT THÚC: Tính số lượng Gạch lát nền các tầng --- 
   
  // --- BẮT ĐẦU: Tính số lượng cho Xoa nền hầm (3.1.9) ---
// 1. Tìm vị trí của hàng "Xoa nền hầm" trong bảng dữ liệu
const powerFloatRowIndex = estimateData.findIndex(row => row.category === '3.1.9');
// 2. Kiểm tra an toàn: chỉ chạy khi tìm thấy hàng và nó chưa bị sửa thủ công
if (powerFloatRowIndex !== -1 && !estimateData[powerFloatRowIndex].is_edited) {
    // 3. Lấy diện tích THÔ (chưa nhân hệ số) của hầm từ ô nhập liệu
    const rawBasementArea = parseFloat(document.getElementById('basementArea').value) || 0; 
    // 4. Lấy ra hàng mục tiêu trong mảng estimateData
    const targetRow = estimateData[powerFloatRowIndex];
    // 5. Cập nhật số lượng (quantity) cho hàng mục tiêu bằng diện tích hầm vừa lấy được
    targetRow.quantity = rawBasementArea;
    // 6. Lấy các giá trị liên quan để tính toán lại
    const coefficient = targetRow.coefficient || 1;
    const unitPrice = targetRow.unit_price || 0;
    // 7. Tính lại "Tổng số lượng" và "Thành tiền" cho hàng này
    targetRow.total_quantity = targetRow.quantity * coefficient;
    targetRow.total_cost = Math.round(targetRow.total_quantity * unitPrice);
}
// --- KẾT THÚC: Tính số lượng cho Xoa nền hầm ---
  // --- BẮT ĐẦU: Tính số lượng cho Sơn ngoài (3.2.1) ---
// 1. Tìm vị trí của hàng "Sơn ngoài" để cập nhật kết quả
const exteriorPaintRowIndex = estimateData.findIndex(row => row.category === '3.2.1');
// Tìm hàng "Gạch lát nền các tầng" để lấy số lượng làm đầu vào
const floorTileRowForPaint = estimateData.find(row => row.category === '3.1.1');
// 2. Kiểm tra an toàn: chỉ chạy khi tìm thấy cả hai hàng và hàng đích chưa bị sửa thủ công
if (exteriorPaintRowIndex !== -1 && floorTileRowForPaint && !estimateData[exteriorPaintRowIndex].is_edited) {
    // 3. Lấy số lượng từ hàng "Gạch lát nền các tầng"
    const sourceQuantity = Number(floorTileRowForPaint.quantity) || 0;
    // 4. Áp dụng công thức: Số lượng sơn ngoài = Diện tích lát sàn x 1
    const exteriorPaintQuantity = sourceQuantity * 1.5;
    // 5. Lấy ra hàng mục tiêu trong mảng estimateData
    const targetRow = estimateData[exteriorPaintRowIndex];
    // 6. Cập nhật số lượng (quantity) cho hàng mục tiêu
    targetRow.quantity = exteriorPaintQuantity;
    // 7. Lấy các giá trị liên quan để tính toán lại
    const coefficient = targetRow.coefficient || 1;
    const unitPrice = targetRow.unit_price || 0;
    // 8. Tính lại "Tổng số lượng" và "Thành tiền"
    targetRow.total_quantity = targetRow.quantity * coefficient;
    targetRow.total_cost = Math.round(targetRow.total_quantity * unitPrice);
}
// --- KẾT THÚC: Tính số lượng cho Sơn ngoài ---
  
  // --- BẮT ĐẦU: Tính số lượng cho Sơn trong (3.2.2) ---
// 1. Tìm vị trí của hàng "Sơn trong" để cập nhật kết quả
const interiorPaintRowIndex = estimateData.findIndex(row => row.category === '3.2.2');
// Tìm lại hàng "Gạch lát nền các tầng" để lấy số lượng (đã có ở biến floorTileRowForPaint trên)
// 2. Kiểm tra an toàn: chỉ chạy khi tìm thấy cả hai hàng và hàng đích chưa bị sửa thủ công
if (interiorPaintRowIndex !== -1 && floorTileRowForPaint && !estimateData[interiorPaintRowIndex].is_edited) {
    // 3. Lấy số lượng từ hàng "Gạch lát nền các tầng"
    const sourceQuantity = Number(floorTileRowForPaint.quantity) || 0;
    // 4. Áp dụng công thức: Số lượng sơn trong = Diện tích lát sàn x 3
    const interiorPaintQuantity = sourceQuantity * 4;
    // 5. Lấy ra hàng mục tiêu trong mảng estimateData
    const targetRow = estimateData[interiorPaintRowIndex];
    // 6. Cập nhật số lượng (quantity) cho hàng mục tiêu
    targetRow.quantity = interiorPaintQuantity;
    // 7. Lấy các giá trị liên quan để tính toán lại
    const coefficient = targetRow.coefficient || 1;
    const unitPrice = targetRow.unit_price || 0;
    // 8. Tính lại "Tổng số lượng" và "Thành tiền"
    targetRow.total_quantity = targetRow.quantity * coefficient;
    targetRow.total_cost = Math.round(targetRow.total_quantity * unitPrice);
}
// --- KẾT THÚC: Tính số lượng cho Sơn trong ---

  // Bắt đầu Bước 8: Tính tổng số lượng thiết bị điện
		// 8.1: Thu thập các thông số chung cho tất cả thiết bị
const numBedrooms = parseInt(document.getElementById('bedrooms')?.value) || 0;
const numBathrooms = parseInt(document.getElementById('bathrooms')?.value) || 0;
const numBalconies = parseInt(document.getElementById('balconies').value) || 0;
const numMezzanines = parseInt(document.getElementById('mezzanineCount').value) || 0;
const numAltarRooms = parseInt(document.getElementById('altarRooms').value) || 0;
const numFamilyRooms = parseInt(document.getElementById('familyRooms').value) || 0;
const numReadingRooms = parseInt(document.getElementById('readingRooms').value) || 0;
const numDressingRooms = parseInt(document.getElementById('dressingRooms').value) || 0;
		// Tính tổng số tầng/cấp độ của ngôi nhà để tính toán cho chính xác
let totalLevels = 0;
if ((parseFloat(document.getElementById('groundFloorArea').value) || 0) > 0) totalLevels++; // Tầng trệt
totalLevels += parseInt(document.getElementById('numFloors').value) || 0; // Các tầng lầu
if ((parseFloat(document.getElementById('mezzanineArea').value) || 0) > 0) totalLevels++; // Tầng lửng
if ((parseFloat(document.getElementById('basementArea').value) || 0) > 0) totalLevels++; // Hầm
		// 8.2: Hàm trợ giúp để cập nhật số lượng cho từng thiết bị
function updateDeviceQuantity(categoryCode, calculatedQuantity) {
    const rowIndex = estimateData.findIndex(row => row.category === categoryCode);
    if (rowIndex !== -1 && !estimateData[rowIndex].is_edited) {
        const coefficient = estimateData[rowIndex].coefficient || 1;
        const unitPrice = estimateData[rowIndex].unit_price || 0;
        const totalQuantity = calculatedQuantity * coefficient;
        const totalCost = Math.round(totalQuantity * unitPrice);
        estimateData[rowIndex].quantity = calculatedQuantity;
        estimateData[rowIndex].total_quantity = totalQuantity;
        estimateData[rowIndex].total_cost = totalCost;
    }
}
		// 8.3: Áp dụng công thức tính cho từng thiết bị
			// MCB các loại (3.3.1)
			const totalMCB = numBedrooms + numBathrooms+ totalLevels +numAltarRooms+numFamilyRooms+ numReadingRooms+numDressingRooms+ 1 + 1; // 1* SL  phòng ngủ + 1*SLWC+1*SL phòng đọc sách + 1*SL phòng thờ + 1 *SL Phòng SHC + 1 * SL phòng thay đồ  * 1*SLtầng + 1 tổng + 1 bếp
			updateDeviceQuantity('3.3.1', totalMCB);
			// Công tắc các loại (3.3.2)
            const totalSwitches = numBedrooms + numBathrooms+ numBalconies +numAltarRooms+numFamilyRooms+ numReadingRooms+numDressingRooms+totalLevels+ 1 + 1 + 1; // 1* SL  phòng ngủ + 1*SLWC+1*SL phòng đọc sách + 1*SL phòng thờ + 1 *SL Phòng SHC + 1 * SL phòng thay đồ + 1*SL ban công + Sl cầu thang + 1 phòng khách + 1 bếp + 1 trước nhà
			updateDeviceQuantity('3.3.2', totalSwitches);
			// Ổ cắm các loại (3.3.3)
			const totalOutlets = (2*numBedrooms) + numBathrooms+ (2*numAltarRooms)+(3*numFamilyRooms)+ (2*numReadingRooms)+(2*numDressingRooms)+ 5 + 5; // 2* SL  phòng ngủ + 1*SLWC+2*SL phòng đọc sách + 2*SL phòng thờ + 3 *SL Phòng SHC + 2 * SL phòng thay đồ + 5 phòng khách + 5 bếp 
			updateDeviceQuantity('3.3.3', totalOutlets);
			// Ổ cắm data/tv (3.3.4)
			const totalDataOutlets =  (numBedrooms) +(numAltarRooms)+(numFamilyRooms)+(numReadingRooms)+1 + 1; // SL  phòng ngủ + SL phòng đọc sách + SL phòng thờ + SL Phòng SHC + phòng khách + bếp 
			updateDeviceQuantity('3.3.4', totalDataOutlets);
			// Đèn chiếu sáng (3.3.5)
			const totalLights = (numBedrooms)+ (numBathrooms)+ 1 + 1 + 1 ; // SL phòng ngủ + SL WC + 1 bếp + 1khách + 1 sân
			updateDeviceQuantity('3.3.5', totalLights);
			// Đèn cầu thang (3.3.6)
			const totalStairLights = totalLevels ; // SL tầng
			updateDeviceQuantity('3.3.6', totalStairLights);
			// Đèn ốp trần ban công, sân thượng (3.3.7)
			const totalBalconyLights = numBalconies+1; // SL ban công + 1
			updateDeviceQuantity('3.3.7', totalBalconyLights);
			// Đèn hắt leb hắt trang trí trần thạch cao (3.3.8)
			const totalLedStrips =  (numBedrooms*30) +(numAltarRooms*30)+(numFamilyRooms*30)+(numReadingRooms*30) + 50 +50; // 30*Phòng ngủ + 30*Phòng thờ + 30*Phòng SHC + 30*Phòng đọc sách + 50*Phòng Khách + 50*Phòng bếp
			updateDeviceQuantity('3.3.8', totalLedStrips);
			// Đèn downlight (3.3.9)
			const totalDownlights = (numBedrooms*6) +(numAltarRooms*6)+(numFamilyRooms*10)+(numReadingRooms*6) + 10 +10; // 6*Phòng ngủ + 6*Phòng thờ + 10*Phòng SHC + 6*Phòng đọc sách + 10*Phòng Khách + 10*Phòng bếp
			updateDeviceQuantity('3.3.9', totalDownlights);
 			// Phát sóng WIFI (3.3.12)
			const totalwifi = totalLevels * 1; // SL tầng
  			updateDeviceQuantity('3.3.12', totalwifi);
  			// Camera (3.3.13)
			const totalcamera = totalLevels * 1; // SL tầng
  			updateDeviceQuantity('3.3.13', totalcamera);
 			// Quạt hút âm trần WC (3.3.16)
			const totalExhaustFans = numBathrooms * 1; // SL WC
			updateDeviceQuantity('3.3.16', totalExhaustFans);
	// Kết thúc Bước 8: Tính tổng số lượng thiết bị điện
  
	// Bắt đầu bước 9: Tính số lượng thiết bị vệ sinh
		// 9.1: Lấy thông số chung (biến totalLevels đã có từ Bước 8)
		const numBathroomsForSanitary = parseInt(document.getElementById('bathrooms')?.value) || 0;
		// 9.2: Danh sách các thiết bị có số lượng = số phòng WC
		const sanitaryDeviceCategories = [
	    '3.4.1', // Bàn Cầu
 	   '3.4.2', // Lavabo + bộ xả
	    '3.4.3', // Vòi xả lavabo
	    '3.4.4', // Vòi sen tắm
	    '3.4.5', // Vòi xịt WC
	    '3.4.7'  // Bộ phụ kiện WC
		];
		// 9.3: Lặp qua danh sách và cập nhật số lượng
		sanitaryDeviceCategories.forEach(categoryCode => {
			// Tái sử dụng hàm trợ giúp đã tạo ở Bước 8
  		  updateDeviceQuantity(categoryCode, numBathroomsForSanitary);// 1/tầng + 1/WC
		});
		// 9.5: Bắt đầu tính số lượng vòi xả sân thượng, ban công, sân, wc
		const totalvoixa = numBalconies + numBathrooms + 1 +1; // 1/ban công + 1/WC + 1 sân + 1 sân thượng
		updateDeviceQuantity('3.4.6', totalvoixa);
  		// 9.4: Tính số lượng Phễu thu sàn
		const totalFloorDrains =numBalconies + numBathrooms + 1 +1; // 1/ban công + 1/WC + 1 sân + 1 sân thượng
		updateDeviceQuantity('3.4.8', totalFloorDrains);
 		// 9.6: Bắt đầu tính số lượng cầu chắn rác
		const totalchanrac = numBalconies + 1; // SLban công +1 sân thượng
		updateDeviceQuantity('3.4.9', totalchanrac);
		// Kết thúc bước 9: Tính số lượng thiết bị vệ sinh

	// Bắt đầu bước 10: Tính khối lượng cửa đi cửa sổ
		// 10.1: Cửa phòng 1 cánh (mã 4.1.1)
		// Công thức: Số phòng ngủ * (0.8m * 2.2m)
		const totalBedroomDoorArea = (numBedrooms * 0.8 * 2.2)+(numDressingRooms * 0.8 * 2.2)+(numReadingRooms * 0.8 * 2.2)+(numAltarRooms * 0.8 * 2.2);// SL Phòng ngủ + SL phòng thay đồ + SL phòng đọc sách + sl phòng thờ
		updateDeviceQuantity('4.1.1', totalBedroomDoorArea);
		// 10.2: Cửa WC (mã 4.1.2)
		// Công thức: Số WC * (0.7m * 2.0m)
		const totalWcDoorArea = numBathrooms * 0.7 * 2.0;// Số WC (0.7m * 2.0m)
		updateDeviceQuantity('4.1.2', totalWcDoorArea);
		// 10.3: Cửa đi chính (mã 4.1.3)
		// Công thức: 1 cái * (3.2m * 2.8m)
		const mainDoorArea = 1 * 3.2 * 2.8;
		updateDeviceQuantity('4.1.3', mainDoorArea);
		// 10.4: Cửa phụ (sau, hông, ban công, sân thượng) (mã 4.1.4)
		const secondaryDoorArea = numBalconies * 0.7 * 2.0 ;// Số ban công (0.7m * 2.0m)
		updateDeviceQuantity('4.1.4', secondaryDoorArea);
		// 10.5: Cửa sổ các loại (mã 4.1.5)
		const windowArea = numBalconies * 1.8 * 2.1 ;// Số ban công (1,8m * 2.2m)
		updateDeviceQuantity('4.1.5', windowArea);
		// 10.6: Cửa cổng (mã 4.1.6)
		const gateArea = 1 * 3.0 * 3.6;// (3m * 3.6m)
		updateDeviceQuantity('4.1.6', gateArea);
	// Kết thúc bước 10: Tính khối lượng cửa đi cửa sổ
  
	// Bắt đầu bước 11: Tính khối lượng cầu thang, trần
		// 11.1: Lan can cầu thang (md) (mã 4.2.1)
		const railingLength = totalLevels * 4.5;// Số tầng * 4,5
		updateDeviceQuantity('4.2.1', railingLength);
		// 11.2: Đá Granite ốp mặt bậc thang (m2) (mã 4.3.1)
		// Công thức: Số tầng x 10m2
		const graniteStairArea = totalLevels * 10; // Số tầng * 10
		updateDeviceQuantity('4.3.1', graniteStairArea);
		// 11.3: Len đá chân tường cầu thang (md) (mã 4.3.5)
		// Công thức: Số tầng x 6m
		const graniteSkirtingLength = totalLevels * 6;// Số tầng * 6
		updateDeviceQuantity('4.3.5', graniteSkirtingLength);
// --- BẮT ĐẦU: Tính số lượng cho Trần thạch cao (4.4.1) theo công thức mới ---
// 1. Tìm vị trí của hàng "Trần thạch cao" để cập nhật kết quả
const ceilingRowIndex = estimateData.findIndex(row => row.category === '4.4.1');
// 2. Tìm các hàng NGUỒN để lấy dữ liệu
const floorTileRow = estimateData.find(row => row.category === '3.1.1'); // Hàng Gạch lát nền
const wcTileRow = estimateData.find(row => row.category === '3.1.3');    // Hàng Gạch nền WC
// 3. Kiểm tra an toàn: chỉ chạy khi tìm thấy tất cả các hàng cần thiết và hàng đích chưa bị sửa
if (ceilingRowIndex !== -1 && floorTileRow && wcTileRow && !estimateData[ceilingRowIndex].is_edited) {
    // 4. Lấy số lượng từ các hàng nguồn
    const floorTileQuantity = Number(floorTileRow.quantity) || 0;
    const wcTileQuantity = Number(wcTileRow.quantity) || 0;
    // 5. Áp dụng công thức: Số lượng trần thạch cao = (Số lượng 3.1.1) + (Số lượng 3.1.3)
    const totalCeilingArea = floorTileQuantity + wcTileQuantity;
    // 6. Lấy ra hàng mục tiêu trong mảng estimateData
    const targetRow = estimateData[ceilingRowIndex];
    // 7. Cập nhật số lượng (quantity) cho hàng mục tiêu
    targetRow.quantity = totalCeilingArea;
    // 8. Lấy các giá trị liên quan để tính toán lại
    const coefficient = targetRow.coefficient || 1;
    const unitPrice = targetRow.unit_price || 0;
    // 9. Tính lại "Tổng số lượng" và "Thành tiền"
    targetRow.total_quantity = targetRow.quantity * coefficient;
    targetRow.total_cost = Math.round(targetRow.total_quantity * unitPrice);
}
// --- KẾT THÚC: Tính số lượng cho Trần thạch cao ---
	// Kết thúc bước 11: Tính khối lượng cầu thang, trần
	// Bắt đầu bước 12: Tính khối lượng đá granite lan can ban công
		// 12.1: Đá granite tam cấp, ngạnh cửa (m2) (mã 4.3.2)
		const graniteThresholdArea =  (numBedrooms * 0.8 * 0.1)+(numDressingRooms * 0.8 * 0.1)+(numReadingRooms * 0.8 * 0.1)+(numAltarRooms * 0.8 * 0.1) + 6 ;// (SL Phòng ngủ + SL phòng thay đồ + SL phòng đọc sách + sl phòng thờ)*0,8*0,1 + 6 m2 tam cấp
		updateDeviceQuantity('4.3.2', graniteThresholdArea);
		// 12.2: Đá granite mặt tiền (m2) (mã 4.3.4)
		const graniteFacadeArea = 10;
		updateDeviceQuantity('4.3.4', graniteFacadeArea);
		// 12.3: Lan can ban công (m) (mã 4.5.1)
		const balconyRailingLength = numBalconies*3.5 + numMezzanines *3.5;// SL ban công * 3.5 + SL tầng lửng * 3.5
		updateDeviceQuantity('4.5.1', balconyRailingLength);
	// Kết thúc bước 12: Tính khối lượng đá granite lan can ban công
  
	// Bắt đầu bước 13: Chi phí khác
		// 13.1: Hồ bơi (mã 4.7.1)
			if (document.getElementById('pool').checked) {
 	   		const poolQty = parseFloat(document.getElementById('poolArea').value) || 0;
	    	updateServiceCost('4.7.1', poolQty, coefficients.poolPrice);
			} else {
	    	updateServiceCost('4.7.1', 0, 0); // Xóa chi phí nếu không chọn
			}
		// 13.2: Ép cọc (mã 4.7.4)
			if (document.getElementById('pileDriving').checked) {
    		const pileQty = parseFloat(document.getElementById('pileLength').value) || 0; // Lấy từ ô nhập liệu
    		updateServiceCost('4.7.4', pileQty, coefficients.pilePrice);
			} else {
    		updateServiceCost('4.7.4', 0, 0); // Xóa chi phí nếu không chọn
			}
		// 13.3: Chi phí cừ chống đổ (mã 4.7.5)
			if (document.getElementById('neighborSupport').checked) {
    		updateServiceCost('4.7.5', 1, coefficients.neighborSupportPrice);
			} else {
    		updateServiceCost('4.7.5', 0, 0); // Xóa chi phí nếu không chọn
			}
		// 13.4: Chi phí bản vẽ XPXD (mã 4.7.6)
			if (document.getElementById('BVXPXD').checked) {
    		updateServiceCost('4.7.6', totalArea, coefficients.BVXPXDPrice);
			} else {
    		updateServiceCost('4.7.6', 0, 0); // Xóa chi phí nếu không chọn
			}
		// 13.5: Chi phí dịch vụ XPXD (mã 4.7.7)
			if (document.getElementById('BVXPXD').checked) {
    		updateServiceCost('4.7.7', 1, coefficients.DVXPXDPrice);
			} else {
   			updateServiceCost('4.7.7', 0, 0); // Xóa chi phí nếu không chọn
			}
		// 13.6: Chi phí thiết kế 2D (mã 4.7.8)
			if (document.getElementById('TK').checked) {
   			updateServiceCost('4.7.8', totalArea, coefficients.TKPrice);
			} else {
    		updateServiceCost('4.7.8', 0, 0); // Xóa chi phí nếu không chọn
			}
	// Kết thúc bước 13: Chi phí khác
  
	// Bắt đầu bước 14: Chi phí thiết bị nội thất
		// 14.1: Thang máy (mã 4.6.3 và 4.6.4)
			if (document.getElementById('elevator').checked) {
    		const elevatorStops = parseInt(document.getElementById('elevatorStops').value) || 0;
   			// Cập nhật chi phí thang máy cơ bản (1 cái)
   			// Dùng updateServiceCost vì cần cập nhật cả Đơn giá
   	 		updateServiceCost('4.6.3', 1, coefficients.elevatorPrice);
    		// Cập nhật chi phí cho các điểm dừng tăng thêm
    		updateServiceCost('4.6.4', elevatorStops, coefficients.elevatorStopsPrice);
			} else {
    		// Xóa chi phí nếu không có thang máy
    		updateServiceCost('4.6.3', 0, 0);
    		updateServiceCost('4.6.4', 0, 0);
			}
		// 14.2: Máy nước nóng trực tiếp (mã 4.6.5)
			// Số lượng = Số WC. Dùng updateDeviceQuantity vì chỉ cần cập nhật Số lượng.
			updateDeviceQuantity('4.6.5', numBathrooms);
		// 14.3: Máy điều hòa 1.0HP (mã 4.6.6)
			// Số lượng = Số phòng ngủ
			updateDeviceQuantity('4.6.6', numBedrooms);
		// 14.4: Giá đỡ cục nóng điều hòa (mã 4.6.8)
			// Số lượng = Số phòng ngủ + 1 (cho phòng khách/khác)
			const totalBrackets = numBedrooms ;
			updateDeviceQuantity('4.6.8', totalBrackets);
	// Kết thúc bước 14: Chi phí thiết bị nội thất
  
	// Bắt đầu bước 15: Chi phí quản lý
		// Hàm trợ giúp để cập nhật chi phí dịch vụ
		function updateServiceCost(categoryCode, quantity, unitPrice) {
  	  	const rowIndex = estimateData.findIndex(row => row.category === categoryCode);
   		if (rowIndex !== -1 && !estimateData[rowIndex].is_edited) {
        const coefficient = estimateData[rowIndex].coefficient || 1;
        const totalQuantity = quantity * coefficient;
        const totalCost = Math.round(totalQuantity * unitPrice);
        estimateData[rowIndex].quantity = quantity;
        estimateData[rowIndex].unit_price = unitPrice;
        estimateData[rowIndex].total_quantity = totalQuantity;
        estimateData[rowIndex].total_cost = totalCost;
    	}
		}
		updateOverheadCosts();
	// Kết thúc bước 15: Chi phí quản lý
    // Gọi hàm tính toán lại tất cả các dòng tổng phụ và tổng chính
    calculateAllSubTotals(); 
    // Gọi hàm cập nhật lại dòng TỔNG CỘNG cuối cùng của bảng
    updateAndRenderGrandTotal();
	// RENDER LẠI BẢNG HANDSONTABLE MỘT LẦN NỮA ĐỂ HIỂN THỊ TỔNG CẬP NHẬT
if (estimateTable) {
    estimateTable.loadData(estimateData);
    estimateTable.render();
}
    document.getElementById('totalArea').value = totalArea.toFixed(2);
    let totalLabor = Math.round(totalArea * laborCost);
    let totalRough = Math.round(totalArea * roughCost);
    let houseCost = Math.round(totalArea * fullCost);
  
	// Bắt đầu hiển thị chi phí hạng mục khác tại cửa sổ chính
    let pileCost = 0;
    if (document.getElementById('pileDriving').checked) {
        const pileLength = parseFloat(document.getElementById('pileLength').value) || 0;
        const pilePrice = parseFloat(document.getElementById('pilePrice').value) || 0;
        pileCost = Math.round(pileLength * pilePrice);
    }
    let neighborCost = 0;
    if (document.getElementById('neighborSupport').checked) {
        const neighborSupportprice = parseFloat(document.getElementById('neighborSupportprice').value) || 0;
        neighborCost = neighborSupportprice;
    }
    let elevatorCost = 0;
    if (document.getElementById('elevator').checked) {
        const elevatorStops = parseFloat(document.getElementById('elevatorStops').value) || 0;
        const elevatorprice = parseFloat(document.getElementById('elevatorprice').value) || 0;
        const elevatorStopsprice = parseFloat(document.getElementById('elevatorStopsprice').value) || 0;
        elevatorCost = Math.round(elevatorStops * elevatorStopsprice + elevatorprice);
    }
    let poolCost = 0;
    if (document.getElementById('pool').checked) {
        const poolArea = parseFloat(document.getElementById('poolArea').value) || 0;
        const poolprice = parseFloat(document.getElementById('poolprice').value) || 0;
        poolCost = Math.round(poolArea * poolprice);
    }
    let BVXPXDCost = 0;
    if (document.getElementById('BVXPXD').checked) {
        const BVXPXDprice = parseFloat(document.getElementById('BVXPXDprice').value) || 0;
        const DVXPXDprice = parseFloat(document.getElementById('DVXPXDprice').value) || 0;
        BVXPXDCost = Math.round(totalArea * BVXPXDprice + DVXPXDprice);
    }
    let TKCost = 0;
    if (document.getElementById('TK').checked) {
        const TKprice = parseFloat(document.getElementById('TKprice').value) || 0;
        TKCost = Math.round(totalArea * TKprice);
    }
    // Tổng chi phí trọn gói
    let totalFull = houseCost + pileCost + neighborCost + elevatorCost + poolCost + BVXPXDCost + TKCost;
	// Kết thúc hiển thị chi phí hạng mục khác tại cửa sổ chính
  
    // Bắt đầu: Hiển thị Chào giá, Dự toán, Lợi nhuận
    const grandTotalValue = updateAndRenderGrandTotal(); // Vừa cập nhật bảng vừa lấy giá trị tổng
   // ---- BẮT ĐẦU ĐOẠN CODE SỬA ĐỔI ----

    // 1. Lấy trạng thái của nút tick "Chỉ hiện phần thô"
    const showRoughOnlyToggle = document.getElementById('showRoughOnlyToggle');
    const isRoughOnly = showRoughOnlyToggle ? showRoughOnlyToggle.checked : false;

    // 2. Quyết định giá trị "Chào giá" sẽ được hiển thị
    //    Nếu nút được tick, "Chào giá" (offerPrice) sẽ bằng chi phí phần thô (totalRough).
    //    Nếu không, "Chào giá" sẽ bằng chi phí trọn gói (totalFull).
    const offerPrice = isRoughOnly ? totalRough : totalFull;

    // ---- KẾT THÚC ĐOẠN CODE SỬA ĐỔI ----
    const totalFullCostDisplay = document.getElementById('modalTotalFullCostDisplay');
    if (totalFullCostDisplay) {
        totalFullCostDisplay.textContent = totalFull.toLocaleString('vi-VN');
    }
    const grandTotalDisplay = document.getElementById('modalGrandTotalDisplay');
    if (grandTotalDisplay) {
        grandTotalDisplay.textContent = grandTotalValue.toLocaleString('vi-VN');
    }
    const profitDisplay = document.getElementById('modalProfitDisplay');
    if (profitDisplay) {
        const profit = totalFull - grandTotalValue;
        let profitText = profit.toLocaleString('vi-VN') + ' vnđ';
        if (grandTotalValue > 0) {
            const profitPercentage = (profit / grandTotalValue) * 100;
            profitText += ` (${profitPercentage.toFixed(2)}%)`;
        }
        profitDisplay.textContent = profitText;
        const profitContainer = profitDisplay.parentElement;
        if (profit < 0) {
            profitContainer.className = 'p-2 bg-red-100 border border-red-400 rounded';
            profitDisplay.className = 'text-red-600';
        } else {
            profitContainer.className = 'p-2 bg-purple-100 border border-purple-400 rounded';
            profitDisplay.className = 'text-purple-600';
        }
    }
    // Kết thúc Hiển thị Chào giá, Dự toán, Lợi nhuận
  
    // Hiển thị kết quả
    document.getElementById('totalLaborCost').value = totalLabor.toLocaleString('vi-VN');
    document.getElementById('totalRoughCost').value = totalRough.toLocaleString('vi-VN');
    document.getElementById('totalFullCost').value = totalFull.toLocaleString('vi-VN');
    document.getElementById('houseCost').textContent = houseCost.toLocaleString('vi-VN');
    document.getElementById('pileCost').textContent = pileCost.toLocaleString('vi-VN');
    document.getElementById('neighborCost').textContent = neighborCost.toLocaleString('vi-VN');
    document.getElementById('elevatorCost').textContent = elevatorCost.toLocaleString('vi-VN');
    document.getElementById('poolCost').textContent = poolCost.toLocaleString('vi-VN');
    document.getElementById('BVXPXDCost').textContent = BVXPXDCost.toLocaleString('vi-VN');
    document.getElementById('TKCost').textContent = TKCost.toLocaleString('vi-VN');
    // Luôn tính toán lại TỔNG SỐ LƯỢNG và THÀNH TIỀN cho tất cả các hạng mục
    if (estimateData && Array.isArray(estimateData)) {
        estimateData.forEach(row => {
            // Chỉ thực hiện trên những dòng chi tiết (không phải dòng tổng)
            if (row && row.category && row.category.includes('.')) {
                const quantity = Number(row.quantity) || 0;
                const coefficient = Number(row.coefficient) || 1;
                const unitPrice = Number(row.unit_price) || 0;
                // 1. Tính Tổng số lượng = Số lượng x Hệ số
                row.total_quantity = quantity * coefficient;
                // 2. TÍNH LUÔN Thành tiền = Tổng số lượng (mới) x Đơn giá [cite: 889, 890]
                row.total_cost = Math.round(row.total_quantity * unitPrice);
            }
        });
    }
  // Gọi hàm tính lại các dòng tổng phụ (ví dụ: 3.1, 3.2,...)
    calculateAllSubTotals();
    // Gọi hàm cập nhật lại dòng TỔNG CHI PHÍ XÂY DỰNG
    updateAndRenderGrandTotal();
  	refreshTableDisplay();
  }
<!-- Kết thúc tính số lượng vật tư tại bảng dự toán chi tiết------------>    
