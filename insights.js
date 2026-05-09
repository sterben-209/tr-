document.addEventListener('DOMContentLoaded', async () => {
    // Set current date
    document.getElementById('last-update').innerText = new Date().toLocaleDateString('vi-VN');

    // Chart.js Global Configuration
    Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
    Chart.defaults.font.family = "'Mulish', sans-serif";

    // ==========================================
    // CÔNG TẮC DỮ LIỆU (DATA TOGGLE)
    // ==========================================
    // Chuyển sang `true` khi bạn muốn lấy dữ liệu thật từ Google Sheet.
    // Chuyển sang `false` để dùng dữ liệu ảo (dummy data) cho mục đích test UI.
    const USE_REAL_DATA = false; 
    
    // Đảm bảo URL này giống với CONFIG_GOOGLE_URL trong utils.js của bạn
    const API_URL = 'https://script.google.com/macros/s/AKfycbx-agc_5kZZWy1VVgVGmkxyZAlWOcha80sP0SY7sMVnqgkhbQTlwRZfnJ67B22AVhI/exec';
    // ==========================================

    let dashboardData = getDummyData();

    if (USE_REAL_DATA) {
        try {
            console.log("Đang tải dữ liệu thực từ Google Sheets...");
            const response = await fetch(`${API_URL}?action=GET_INSIGHTS`);
            if (response.ok) {
                const realData = await response.json();
                if (realData.result === "success" && realData.data) {
                    dashboardData = processRealData(realData.data);
                    console.log("Đã tải dữ liệu thực thành công!");
                } else {
                    console.warn("Không có dữ liệu thực hoặc API lỗi. Dùng dữ liệu ảo.");
                }
            }
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu thực:", error);
            console.warn("Chuyển về dùng dữ liệu ảo.");
        }
    } else {
        console.log("Đang hiển thị dữ liệu ảo (Dummy Data).");
    }

    renderDashboard(dashboardData);
});

// --- DATA PROCESSING FUNCTIONS ---

function getDummyData() {
    return {
        summary: {
            total: 1248,
            satisfaction: 96.4,
            buyAgain: 88.2
        },
        needDistribution: [42, 33, 25], // FREE, FRESH, REST
        impact: {
            before: [85, 40, 30], // Stress, Focus, Sleep
            after: [35, 90, 85]
        },
        sensory: [4.2, 4.8, 4.5, 4.0, 4.6], // Taste, Scent, Pack, Trust, Creative
        pricing: [75, 15, 10], // Reasonable, Expensive, Cheap
        recentFeedback: [
            { time: '10 phút trước', status: 'Căng thẳng (FREE)', taste: '4.5/5', comment: 'Vị thanh, dễ uống, không bị gắt.' },
            { time: '1 giờ trước', status: 'Mất ngủ (REST)', taste: '5/5', comment: 'Mùi táo đỏ rất thơm, ấm bụng.' },
            { time: '3 giờ trước', status: 'Quá tải (FRESH)', taste: '4/5', comment: 'Tỉnh táo hơn hẳn cafe mà không bị run tay.' },
            { time: 'Hôm qua', status: 'Căng thẳng (FREE)', taste: '4.8/5', comment: 'Màu sắc hiện đại, bao bì đẹp.' }
        ]
    };
}

function processRealData(rawData) {
    // Hàm này sẽ xử lý rawData (mảng các mảng từ Google Sheet) thành object dashboardData
    // Cấu trúc rawData mong đợi (bỏ qua dòng header): 
    // [ [Ngày giờ, Mô tả, Xu hướng, Thời điểm, Cafe, Tên, Nhu cầu, Điểm Hương, Điểm Mùi, Điểm Bao bì, Cảm nhận, Giá, Mua lại, Email], ... ]
    
    let total = rawData.length;
    if (total === 0) return getDummyData(); // Fallback nếu sheet trống

    let needCount = { 'stop_sad': 0, 'add_joy': 0, 'other': 0 };
    let pricingCount = { 'reasonable': 0, 'expensive': 0, 'cheap': 0 };
    let buyAgainCount = 0;
    
    let totalSensory = { taste: 0, scent: 0, pack: 0, trust: 4.0, creative: 4.5 }; // trust/creative giả lập tạm vì form chưa có
    let validSensoryCount = 0;

    let recentFeedback = [];

    rawData.forEach(row => {
        // Nhu cầu cảm xúc (Cột 6)
        let need = row[6];
        if (need === 'stop_sad') needCount['stop_sad']++;
        else if (need === 'add_joy') needCount['add_joy']++;
        else needCount['other']++;

        // Sẵn sàng mua lại (Cột 12)
        if (row[12] === 'yes') buyAgainCount++;

        // Định giá (Cột 11)
        let price = row[11];
        if (price === 'reasonable') pricingCount['reasonable']++;
        else if (price === 'expensive') pricingCount['expensive']++;

        // Điểm giác quan (Cột 7, 8, 9)
        let taste = parseFloat(row[7]);
        let scent = parseFloat(row[8]);
        let pack = parseFloat(row[9]);
        
        if (!isNaN(taste) && !isNaN(scent) && !isNaN(pack)) {
            totalSensory.taste += taste;
            totalSensory.scent += scent;
            totalSensory.pack += pack;
            validSensoryCount++;
        }

        // Lấy 4 feedback gần nhất có comment
        let comment = row[10];
        if (comment && recentFeedback.length < 4) {
            recentFeedback.push({
                time: row[0], // Lấy ngày giờ làm time
                status: need === 'stop_sad' ? 'REST/FREE' : 'FRESH', // Phỏng đoán trạng thái
                taste: `${taste || 0}/5`,
                comment: comment
            });
        }
    });

    return {
        summary: {
            total: total,
            satisfaction: validSensoryCount > 0 ? (((totalSensory.taste + totalSensory.scent + totalSensory.pack) / (validSensoryCount * 15)) * 100).toFixed(1) : 0, // Tính % dựa trên 3 điểm
            buyAgain: ((buyAgainCount / total) * 100).toFixed(1)
        },
        needDistribution: [needCount['stop_sad'], needCount['add_joy'], needCount['other']], // Phân bổ lại logic nếu cần
        impact: getDummyData().impact, // Ma trận Before/After khó tính toán từ form hiện tại, tạm giữ dummy
        sensory: validSensoryCount > 0 ? [
            (totalSensory.taste / validSensoryCount).toFixed(1),
            (totalSensory.scent / validSensoryCount).toFixed(1),
            (totalSensory.pack / validSensoryCount).toFixed(1),
            4.2, // Dummy trust
            4.5  // Dummy creative
        ] : [0,0,0,0,0],
        pricing: [pricingCount['reasonable'], pricingCount['expensive'], total - pricingCount['reasonable'] - pricingCount['expensive']],
        recentFeedback: recentFeedback.length > 0 ? recentFeedback : getDummyData().recentFeedback
    };
}


// --- RENDER FUNCTIONS ---

let charts = {}; // Lưu trữ instance của các biểu đồ để destroy trước khi vẽ lại nếu cần

function renderDashboard(data) {
    // 1. Update Summary Stats
    document.getElementById('total-surveys').innerText = data.summary.total.toLocaleString();
    
    // Tìm thẻ hiển thị tỷ lệ hài lòng và mua lại (cách lấy này hơi tricky, phụ thuộc cấu trúc DOM, nên update HTML để có ID rõ ràng hơn, ở đây dùng tạm)
    const glassCards = document.querySelectorAll('.glass-card .text-5xl');
    if (glassCards.length >= 3) {
        glassCards[1].innerText = data.summary.satisfaction + '%';
        glassCards[2].innerText = data.summary.buyAgain + '%';
    }

    // Tiện ích hỗ trợ hủy chart cũ trước khi vẽ lại (tránh lỗi đè canvas)
    const initChart = (ctxId, config) => {
        if (charts[ctxId]) charts[ctxId].destroy();
        charts[ctxId] = new Chart(document.getElementById(ctxId).getContext('2d'), config);
    };

    // 2. Phân Loại Nhu Cầu (Pie Chart)
    initChart('needChart', {
        type: 'doughnut',
        data: {
            labels: ['Hết buồn (REST/FREE)', 'Thêm vui (FRESH)', 'Khác'], // Cập nhật nhãn phù hợp với form survey
            datasets: [{
                data: data.needDistribution,
                backgroundColor: ['#314373', '#4f772d', '#44192d'],
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: {
            cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { padding: 20, font: { size: 10 } } } }
        }
    });

    // 3. Ma Trận Thay Đổi Cảm Xúc (Bar Chart)
    initChart('impactChart', {
        type: 'bar',
        data: {
            labels: ['Mức độ căng thẳng', 'Chỉ số tập trung', 'Chất lượng giấc ngủ'],
            datasets: [
                { label: 'Trước khi dùng', data: data.impact.before, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 5 },
                { label: 'Sau khi dùng', data: data.impact.after, backgroundColor: '#d4a373', borderRadius: 5 }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // 4. Đánh Giá Đa Giác Quan (Radar Chart)
    initChart('sensoryChart', {
        type: 'radar',
        data: {
            labels: ['Hương vị', 'Mùi hương', 'Bao bì', 'Độ tin cậy', 'Tính sáng tạo'],
            datasets: [{
                label: 'Điểm trung bình (1-5)',
                data: data.sensory,
                fill: true,
                backgroundColor: 'rgba(212, 163, 115, 0.2)',
                borderColor: '#d4a373',
                pointBackgroundColor: '#d4a373',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#d4a373'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { font: { size: 11 } },
                    suggestedMin: 0,
                    suggestedMax: 5
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // 5. Mức Độ Phù Hợp Về Giá (Polar Area Chart)
    initChart('priceChart', {
        type: 'polarArea',
        data: {
            labels: ['Hợp lý', 'Hơi cao', 'Chưa xác định'],
            datasets: [{
                data: data.pricing,
                backgroundColor: [
                    'rgba(74, 222, 128, 0.2)',
                    'rgba(251, 191, 36, 0.2)',
                    'rgba(59, 130, 246, 0.2)'
                ],
                borderColor: 'rgba(255,255,255,0.1)'
            }]
        },
        options: {
            scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } } },
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // 6. Inject Feedback Table Data
    const tableBody = document.getElementById('feedback-table-body');
    tableBody.innerHTML = data.recentFeedback.map(f => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-all">
            <td class="py-4 px-4 text-white/40">${f.time}</td>
            <td class="py-4 px-4 font-bold">${f.status}</td>
            <td class="py-4 px-4 text-[#d4a373]">${f.taste}</td>
            <td class="py-4 px-4 italic text-white/80">"${f.comment}"</td>
        </tr>
    `).join('');
}
