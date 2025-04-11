document.addEventListener('DOMContentLoaded', function() {
    // Elements references
    const expenseForm = document.getElementById('expenseForm');
    const expensesList = document.getElementById('expensesList');
    const expenseAmount = document.getElementById('expenseAmount');
    const incomeAmount = document.getElementById('incomeAmount');
    const balanceAmount = document.getElementById('balanceAmount');
    const updateIncomeBtn = document.getElementById('updateIncomeBtn');
    const incomeModal = document.getElementById('incomeModal');
    const incomeForm = document.getElementById('incomeForm');
    const incomeInput = document.getElementById('incomeInput');
    const incomeMonthDisplay = document.getElementById('incomeMonthDisplay');
    const closeModal = document.querySelector('.close-modal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const filterCategory = document.getElementById('filterCategory');
    const filterMonth = document.getElementById('filterMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const expenseFormBody = document.getElementById('expenseFormBody');
    const toggleExpenseForm = document.getElementById('toggleExpenseForm');
    
    // Debug log for DOM references
    console.log('expensesList reference:', expensesList);
    
    // Elements for view selector
    const viewBtns = document.querySelectorAll('.view-btn');
    const viewContents = document.querySelectorAll('.view-content');
    
    // Elements for yearly view
    const yearDisplay = document.getElementById('yearDisplay');
    const yearSelector = document.getElementById('yearSelector');
    const prevYearBtn = document.getElementById('prevYear');
    const nextYearBtn = document.getElementById('nextYear');
    const yearlyIncomeAmount = document.getElementById('yearlyIncomeAmount');
    const yearlyExpenseAmount = document.getElementById('yearlyExpenseAmount');
    const yearlyBalanceAmount = document.getElementById('yearlyBalanceAmount');
    const monthlyChart = document.getElementById('monthlyChart');
    const categoryChart = document.getElementById('categoryChart');
    
    // Các phần tử cho chức năng tiết kiệm
    const yearlySavingsAmount = document.getElementById('yearlySavingsAmount');
    const unallocatedAmount = document.getElementById('unallocatedAmount');
    const manageSavingsBtn = document.getElementById('manageSavingsBtn');
    const savingsModal = document.getElementById('savingsModal');
    const closeSavingsModal = document.getElementById('closeSavingsModal');
    const savingsForm = document.getElementById('savingsForm');
    const savingsAction = document.getElementById('savingsAction');
    const savingsAmount = document.getElementById('savingsAmount');
    const savingsCategoryGroup = document.getElementById('savingsCategoryGroup');
    const savingsCategory = document.getElementById('savingsCategory');
    const savingsDescription = document.getElementById('savingsDescription');
    const modalUnallocatedAmount = document.getElementById('modalUnallocatedAmount');
    const savingsHistoryList = document.getElementById('savingsHistoryList');
    
    // Set default date to today
    if (document.getElementById('date')) {
        document.getElementById('date').valueAsDate = new Date();
    }
    
    // Set default month filter to current month
    if (filterMonth) {
        filterMonth.value = getCurrentMonth();
    }
    
    let currentUser = null;
    let editMode = false;
    let monthlyIncome = 0;
    
    // Khởi tạo năm hiện tại
    const currentYear = new Date().getFullYear();
    let selectedYear = currentYear;
    
    if (yearDisplay) {
        yearDisplay.textContent = selectedYear;
    }
    
    // Khởi tạo dropdown chọn năm
    if (yearSelector) {
        // Thêm các năm từ 5 năm trước đến 5 năm sau
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        }
        yearSelector.value = currentYear;
    }
    
    // View selector handling
    if (viewBtns.length > 0) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                viewBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Hide all views
                viewContents.forEach(content => content.classList.remove('active'));
                
                // Show selected view
                const viewName = this.getAttribute('data-view');
                const selectedView = document.getElementById(viewName + 'View');
                if (selectedView) {
                    selectedView.classList.add('active');
                    
                    // Reload data based on view
                    if (viewName === 'monthly') {
                        loadMonthlyData();
                    } else if (viewName === 'yearly') {
                        loadYearlyData();
                    }
                }
            });
        });
    }
    
    // Month navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            const currentMonth = filterMonth.value;
            filterMonth.value = getPreviousMonth(currentMonth);
            loadMonthlyData();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            const currentMonth = filterMonth.value;
            filterMonth.value = getNextMonth(currentMonth);
            loadMonthlyData();
        });
    }
    
    // Year navigation
    if (prevYearBtn) {
        prevYearBtn.addEventListener('click', function() {
            yearSelector.value = parseInt(yearSelector.value) - 1;
            loadYearlyData();
        });
    }
    
    if (nextYearBtn) {
        nextYearBtn.addEventListener('click', function() {
            yearSelector.value = parseInt(yearSelector.value) + 1;
            loadYearlyData();
        });
    }
    
    if (yearSelector) {
        yearSelector.addEventListener('change', function() {
            selectedYear = parseInt(this.value);
            yearDisplay.textContent = selectedYear;
            loadYearlyData();
        });
    }
    
    // Helper function for month navigation
    function getPreviousMonth(monthStr) {
        const [year, month] = monthStr.split('-').map(Number);
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    }
    
    function getNextMonth(monthStr) {
        const [year, month] = monthStr.split('-').map(Number);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    }
    
    // Format month for display
    function formatMonthName(monthStr) {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    }
    
    // Load data for monthly view
    function loadMonthlyData() {
        loadIncome();
        loadExpenses();
    }
    
    // Load data for yearly view
    function loadYearlyData() {
        console.log('Loading yearly view data...');
        loadYearlySummary();
        loadYearlyIncome();
        loadYearlyExpenses();
    }
    
    // Xử lý số nhập vào - chỉ cho phép nhập số
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', formatAmountInput);
    }
    
    if (incomeInput) {
        incomeInput.addEventListener('input', formatAmountInput);
    }
    
    if (savingsAmount) {
        savingsAmount.addEventListener('input', formatAmountInput);
    }
    
    // Hàm xử lý định dạng khi nhập số tiền
    function formatAmountInput(e) {
        // Loại bỏ tất cả các ký tự không phải số
        let value = this.value.replace(/\D/g, '');
        
        // Định dạng số với dấu chấm ngăn cách hàng nghìn
        if (value.length > 0) {
            // Chuyển thành số
            const numValue = parseInt(value);
            // Định dạng với dấu chấm phân cách
            value = numValue.toLocaleString('vi-VN');
        }
        
        // Log cho việc debug
        console.log("Giá trị nhập vào:", value);
        
        // Cập nhật giá trị vào input với định dạng đã có dấu chấm
        this.value = value;
        
        // Đặt một thuộc tính dữ liệu tùy chỉnh để vượt qua validation
        this.setAttribute('data-raw-value', value.replace(/\D/g, ''));
    }
    
    // Check authentication
    checkAuth()
        .then(user => {
            currentUser = user;
            loadMonthlyData();
            loadYearlySummary();
        })
        .catch(error => {
            console.error(error);
            // Already redirected by checkAuth function
        });
    
    // Load income data
    function loadIncome() {
        // Lấy tháng hiện tại để lọc thu nhập
        const selectedMonth = filterMonth.value || getCurrentMonth();
        
        if (incomeMonthDisplay) {
            incomeMonthDisplay.textContent = formatMonthName(selectedMonth);
        }
        
        db.collection('users').doc(currentUser.uid).collection('income')
            .doc(selectedMonth)
            .get()
            .then(doc => {
                console.log("Dữ liệu thu nhập tháng " + selectedMonth + ":", doc.exists ? doc.data() : "không có");
                
                if (doc.exists && doc.data().amount) {
                    monthlyIncome = doc.data().amount;
                    incomeAmount.textContent = formatCurrency(monthlyIncome);
                    
                    // Hiển thị với định dạng dấu chấm để dễ đọc
                    incomeInput.value = monthlyIncome.toLocaleString('vi-VN');
                    
                    updateBalance();
                } else {
                    monthlyIncome = 0;
                    incomeAmount.textContent = '0 ₫';
                    incomeInput.value = '';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu thu nhập: ', error);
                // Xử lý lỗi
                monthlyIncome = 0;
                incomeAmount.textContent = '0 ₫';
            });
    }
    
    // Load yearly income data
    function loadYearlyIncome() {
        const year = yearSelector.value || currentYear.toString();
        
        // Query all monthly incomes for the selected year
        db.collection('users').doc(currentUser.uid).collection('income')
            .where('year', '==', year)
            .get()
            .then(snapshot => {
                let totalIncome = 0;
                
                snapshot.forEach(doc => {
                    const income = doc.data();
                    totalIncome += parseInt(income.amount || 0);
                });
                
                if (yearlyIncomeAmount) {
                    yearlyIncomeAmount.textContent = formatCurrency(totalIncome);
                }
                
                // Calculate yearly balance after loading expenses
                calculateYearlyBalance();
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu thu nhập năm: ', error);
            });
    }
    
    // Load expenses data
    function loadExpenses() {
        const selectedMonth = filterMonth.value || getCurrentMonth();
        console.log('Loading expenses for month:', selectedMonth);
        console.log('Current user:', currentUser);
        
        if (!expensesList) {
            console.error('expensesList element not found!');
            return;
        }
        
        let query = db.collection('users').doc(currentUser.uid).collection('expenses')
            .where('month', '==', selectedMonth)
            .orderBy('date', 'desc');
        
        // Apply category filter if selected
        const selectedCategory = filterCategory.value;
        if (selectedCategory) {
            console.log('Applying category filter:', selectedCategory);
            query = query.where('category', '==', selectedCategory);
        }
        
        console.log('Executing Firestore query...');
        query.get()
            .then(snapshot => {
                console.log('Query completed. Snapshot:', snapshot);
                // Clear existing expenses list
                expensesList.innerHTML = '';
                
                let totalExpense = 0;
                console.log('Expenses count:', snapshot.size);
                
                if (snapshot.empty) {
                    console.log('No expenses found for the selected month');
                    expensesList.innerHTML = '<div class="empty-message">Không tìm thấy khoản chi tiêu nào.</div>';
                } else {
                    snapshot.forEach(doc => {
                        const expense = doc.data();
                        expense.id = doc.id;
                        
                        console.log('Rendering expense:', expense);
                        // Render expense in the list
                        renderExpense(expense);
                        
                        // Calculate total
                        totalExpense += parseInt(expense.amount);
                    });
                }
                
                // Update expense total display
                expenseAmount.textContent = formatCurrency(totalExpense);
                updateBalance();
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu chi tiêu:', error);
                console.error('Error details:', error.code, error.message);
                // Display error to user
                if (expensesList) {
                    expensesList.innerHTML = `<div class="error-message">Lỗi khi tải dữ liệu: ${error.message}</div>`;
                }
            });
    }
    
    // Load yearly expenses data
    function loadYearlyExpenses() {
        const year = yearSelector.value || currentYear.toString();
        
        console.log('Loading yearly expenses for year:', year);
        
        // Tạo query không dùng orderBy để tránh lỗi composite index
        db.collection('users').doc(currentUser.uid).collection('expenses')
            .where('year', '==', year)
            .get()
            .then(snapshot => {
                let totalExpense = 0;
                
                // To track monthly expenses for chart
                const monthlyExpenses = {};
                for (let i = 1; i <= 12; i++) {
                    monthlyExpenses[i] = 0;
                }
                
                // To track category expenses for chart
                const categoryExpenses = {};
                
                if (snapshot.empty) {
                    console.log('No expenses found for year:', year);
                    if (yearlyExpenseAmount) {
                        yearlyExpenseAmount.textContent = formatCurrency(0);
                    }
                    renderMonthlyChart(monthlyExpenses);
                    renderCategoryChart(categoryExpenses);
                    console.log('Rendering charts with empty data');
                } else {
                    console.log('Found expenses for year:', year, snapshot.size);
                    snapshot.forEach(doc => {
                        const expense = doc.data();
                        const amount = parseInt(expense.amount);
                        totalExpense += amount;
                        
                        // Add to monthly totals
                        const month = parseInt(expense.month.split('-')[1]);
                        monthlyExpenses[month] += amount;
                        
                        // Add to category totals
                        if (!categoryExpenses[expense.category]) {
                            categoryExpenses[expense.category] = 0;
                        }
                        categoryExpenses[expense.category] += amount;
                    });
                    
                    console.log('Processed expense data:', { totalExpense, monthlyExpenses, categoryExpenses });
                    
                    if (yearlyExpenseAmount) {
                        yearlyExpenseAmount.textContent = formatCurrency(totalExpense);
                    }
                    
                    // Update charts
                    renderMonthlyChart(monthlyExpenses);
                    renderCategoryChart(categoryExpenses);
                }
                
                // Calculate yearly balance
                calculateYearlyBalance();
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu chi tiêu năm: ', error);
                alert('Có lỗi khi tải dữ liệu chi tiêu năm: ' + error.message);
                
                // Nếu lỗi liên quan đến composite index, hiển thị hướng dẫn
                if (error.message && error.message.includes('index')) {
                    console.log('Lỗi index Firestore, cần tạo index cho truy vấn');
                    
                    // Hiển thị hướng dẫn trong console
                    if (error.message.includes('https://console.firebase.google.com')) {
                        console.log('Để sửa lỗi, hãy nhấp vào URL trong thông báo lỗi để tạo index.');
                    }
                }
                
                // Hiển thị biểu đồ trống nếu có lỗi
                const emptyMonthlyData = {};
                for (let i = 1; i <= 12; i++) {
                    emptyMonthlyData[i] = 0;
                }
                renderMonthlyChart(emptyMonthlyData);
                renderCategoryChart({});
            });
    }
    
    // Calculate yearly balance
    function calculateYearlyBalance() {
        const year = yearSelector.value || currentYear.toString();
        
        Promise.all([
            // Get yearly income
            db.collection('users').doc(currentUser.uid).collection('income')
                .where('year', '==', year)
                .get(),
            
            // Get yearly expenses
            db.collection('users').doc(currentUser.uid).collection('expenses')
                .where('year', '==', year)
                .get()
        ])
        .then(results => {
            let totalIncome = 0;
            let totalExpense = 0;
            
            // Calculate total income
            results[0].forEach(doc => {
                const income = doc.data();
                totalIncome += parseInt(income.amount || 0);
            });
            
            // Calculate total expenses
            results[1].forEach(doc => {
                const expense = doc.data();
                totalExpense += parseInt(expense.amount || 0);
            });
            
            // Calculate balance
            const balance = totalIncome - totalExpense;
            
            if (yearlyBalanceAmount) {
                yearlyBalanceAmount.textContent = formatCurrency(balance);
                
                // Add class for negative balance
                if (balance < 0) {
                    yearlyBalanceAmount.className = 'stat-value expense';
                } else {
                    yearlyBalanceAmount.className = 'stat-value';
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi tính số dư năm: ', error);
        });
    }
    
    // Render monthly expense chart
    function renderMonthlyChart(monthlyExpenses) {
        if (!monthlyChart) {
            console.error('Monthly chart element not found');
            return;
        }
        
        console.log('Rendering monthly expenses list with data:', monthlyExpenses);
        
        try {
            // Xóa biểu đồ cũ nếu có
            if (window.monthlyChartInstance) {
                window.monthlyChartInstance.destroy();
                window.monthlyChartInstance = null;
            }
            
            // Tạo danh sách hiển thị chi tiêu theo tháng
            const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
            
            // Container cho danh sách
            let monthlyList = document.createElement('div');
            monthlyList.className = 'monthly-expenses-list';
            
            // Tiêu đề
            const listHeader = document.createElement('div');
            listHeader.className = 'expenses-list-header';
            listHeader.innerHTML = `
                <span class="month-name">Tháng</span>
                <span class="month-amount">Số tiền</span>
            `;
            monthlyList.appendChild(listHeader);
            
            // Tạo danh sách các tháng
            for (let month = 1; month <= 12; month++) {
                const monthItem = document.createElement('div');
                monthItem.className = 'monthly-expense-item';
                
                // Thêm class đặc biệt cho các tháng có chi tiêu
                if (monthlyExpenses[month] > 0) {
                    monthItem.classList.add('has-expense');
                }
                
                monthItem.innerHTML = `
                    <span class="month-name">${monthNames[month-1]}</span>
                    <span class="month-amount">${formatCurrency(monthlyExpenses[month] || 0)}</span>
                `;
                monthlyList.appendChild(monthItem);
            }
            
            // Thay thế nội dung
            monthlyChart.innerHTML = '';
            monthlyChart.appendChild(monthlyList);
            
        } catch (error) {
            console.error('Lỗi khi tạo danh sách chi tiêu theo tháng:', error);
            monthlyChart.innerHTML = '<div class="empty-message">Lỗi khi tạo danh sách: ' + error.message + '</div>';
        }
    }
    
    // Render category expense chart
    function renderCategoryChart(categoryExpenses) {
        if (!categoryChart) {
            console.error('Category chart element not found');
            return;
        }
        
        console.log('Rendering category expenses list with data:', categoryExpenses);
        
        try {
            // Xóa biểu đồ cũ nếu có
            if (window.categoryChartInstance) {
                window.categoryChartInstance.destroy();
                window.categoryChartInstance = null;
            }
            
            const categoryMap = {
                'food': 'Ăn Uống',
                'entertainment': 'Giải Trí',
                'bills': 'Hóa Đơn & Dịch Vụ',
                'transport': 'Di Chuyển',
                'shopping': 'Mua Sắm',
                'housing': 'Nhà Ở',
                'health': 'Y Tế',
                'other': 'Khác'
            };
            
            // Nếu không có dữ liệu
            if (Object.keys(categoryExpenses).length === 0) {
                categoryChart.innerHTML = '<div class="empty-message">Không có dữ liệu chi tiêu theo danh mục</div>';
                
                // Update category list
                const categoryList = document.getElementById('categoryList');
                if (categoryList) {
                    categoryList.innerHTML = '<li class="empty-message">Không có dữ liệu chi tiêu</li>';
                }
                return;
            }
            
            // Tính tổng chi tiêu
            const totalExpense = Object.values(categoryExpenses).reduce((sum, amount) => sum + amount, 0);
            
            // Container cho danh sách
            let categoryList = document.createElement('div');
            categoryList.className = 'category-expenses-list';
            
            // Tiêu đề
            const listHeader = document.createElement('div');
            listHeader.className = 'expenses-list-header';
            listHeader.innerHTML = `
                <span class="category-name">Danh mục</span>
                <span class="category-amount">Số tiền</span>
                <span class="category-percent">Tỷ lệ</span>
            `;
            categoryList.appendChild(listHeader);
            
            // Sắp xếp danh mục theo số tiền giảm dần
            const sortedCategories = Object.entries(categoryExpenses)
                .sort((a, b) => b[1] - a[1]);
            
            // Tạo danh sách các danh mục
            sortedCategories.forEach(([category, amount]) => {
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-expense-item';
                
                const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                
                categoryItem.innerHTML = `
                    <span class="category-name">${categoryMap[category] || category}</span>
                    <span class="category-amount">${formatCurrency(amount)}</span>
                    <span class="category-percent">${percentage}%</span>
                `;
                categoryList.appendChild(categoryItem);
            });
            
            // Thay thế nội dung
            categoryChart.innerHTML = '';
            categoryChart.appendChild(categoryList);
            
            // Update category list
            const detailedCategoryList = document.getElementById('categoryList');
            if (detailedCategoryList) {
                detailedCategoryList.innerHTML = '';
                
                sortedCategories.forEach(([category, amount]) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${categoryMap[category] || category}</span>
                        <span>${formatCurrency(amount)}</span>
                    `;
                    detailedCategoryList.appendChild(li);
                });
            }
            
        } catch (error) {
            console.error('Lỗi khi tạo danh sách chi tiêu theo danh mục:', error);
            categoryChart.innerHTML = '<div class="empty-message">Lỗi khi tạo danh sách: ' + error.message + '</div>';
        }
    }
    
    // Calculate and update balance
    function updateBalance() {
        // Get total expenses for current month only
        const selectedMonth = filterMonth.value || getCurrentMonth();
        
        db.collection('users').doc(currentUser.uid).collection('expenses')
            .where('month', '==', selectedMonth)
            .get()
            .then(snapshot => {
                let monthlyExpense = 0;
                
                snapshot.forEach(doc => {
                    const expense = doc.data();
                    monthlyExpense += parseInt(expense.amount);
                });
                
                // Update expense total
                expenseAmount.textContent = formatCurrency(monthlyExpense);
                
                // Calculate and display balance
                const balance = monthlyIncome - monthlyExpense;
                balanceAmount.textContent = formatCurrency(balance);
                
                // Add class for negative balance
                if (balance < 0) {
                    balanceAmount.classList.add('expense');
                } else {
                    balanceAmount.classList.remove('expense');
                }
                
                // Lưu số dư của tháng này để tính toán tiết kiệm
                saveMonthlySurplus(selectedMonth, balance);
            })
            .catch(error => {
                console.error('Lỗi khi tính số dư: ', error);
            });
    }
    
    // Lưu số dư cuối tháng vào collection riêng
    function saveMonthlySurplus(month, balance) {
        if (balance <= 0) return; // Chỉ lưu khi có số dư dương
        
        const year = month.split('-')[0];
        
        console.log('Lưu số dư tháng', month, 'với số tiền:', balance);
        
        // Kiểm tra xem số dư này đã được lưu chưa
        db.collection('users').doc(currentUser.uid).collection('surplus')
            .doc(month)
            .get()
            .then(doc => {
                const isNewSurplus = !doc.exists;
                console.log('Đã tồn tại số dư tháng này?', !isNewSurplus);
                
                // Lưu vào collection surplus
                db.collection('users').doc(currentUser.uid).collection('surplus')
                    .doc(month)
                    .set({
                        amount: balance,
                        month: month,
                        year: year,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'unallocated' // 'unallocated', 'savings', 'spent'
                    })
                    .then(() => {
                        console.log("Đã lưu số dư tháng " + month + ": " + balance);
                        
                        // Nếu là số dư mới, cập nhật vào yearly_summary
                        if (isNewSurplus) {
                            // Lấy summary hiện tại để cập nhật
                            db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                                .doc(year)
                                .get()
                                .then(summaryDoc => {
                                    let currentSummary = {
                                        total_surplus: 0,
                                        unallocated_amount: 0,
                                        total_savings: 0,
                                        year: year
                                    };
                                    
                                    if (summaryDoc.exists) {
                                        currentSummary = summaryDoc.data();
                                    }
                                    
                                    // Cập nhật tổng số dư và số dư chưa phân bổ
                                    const newTotalSurplus = (currentSummary.total_surplus || 0) + balance;
                                    const newUnallocated = (currentSummary.unallocated_amount || 0) + balance;
                                    
                                    console.log('Cập nhật yearly_summary:', {
                                        total_surplus_cũ: currentSummary.total_surplus || 0,
                                        total_surplus_mới: newTotalSurplus,
                                        unallocated_cũ: currentSummary.unallocated_amount || 0,
                                        unallocated_mới: newUnallocated
                                    });
                                    
                                    // Cập nhật vào Firestore
                                    db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                                        .doc(year)
                                        .update({
                                            total_surplus: newTotalSurplus,
                                            unallocated_amount: newUnallocated,
                                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                        })
                                        .then(() => {
                                            console.log("Đã cập nhật tổng số dư năm " + year);
                                            // Tải lại dữ liệu tổng kết năm nếu đang ở view năm
                                            if (document.querySelector('.view-btn.active').getAttribute('data-view') === 'yearly') {
                                                loadYearlySummary();
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Lỗi khi cập nhật tổng số dư năm: ', error);
                                        });
                                })
                                .catch(error => {
                                    console.error('Lỗi khi lấy dữ liệu tổng kết năm: ', error);
                                });
                        }
                    })
                    .catch(error => {
                        console.error('Lỗi khi lưu số dư: ', error);
                    });
            })
            .catch(error => {
                console.error('Lỗi khi kiểm tra số dư đã tồn tại: ', error);
            });
    }
    
    // Tải dữ liệu tổng kết năm
    function loadYearlySummary() {
        const year = new Date().getFullYear().toString();
        
        console.log('Đang tải dữ liệu tổng kết năm:', year);
        
        db.collection('users').doc(currentUser.uid).collection('yearly_summary')
            .doc(year)
            .get()
            .then(doc => {
                console.log('Dữ liệu tổng kết năm:', doc.exists ? doc.data() : 'không có dữ liệu');
                
                if (doc.exists) {
                    const summary = doc.data();
                    
                    if (yearlySavingsAmount) {
                        const totalSavings = summary.total_savings || 0;
                        console.log('Tổng tiết kiệm:', totalSavings);
                        yearlySavingsAmount.textContent = formatCurrency(totalSavings);
                    }
                    
                    if (unallocatedAmount) {
                        const unallocated = summary.unallocated_amount || 0;
                        console.log('Số dư chưa phân bổ:', unallocated);
                        unallocatedAmount.textContent = formatCurrency(unallocated);
                    }
                } else {
                    console.log('Không tìm thấy dữ liệu tổng kết năm, tạo mới');
                    // Nếu không tìm thấy, tạo mới document
                    db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                        .doc(year)
                        .set({
                            total_surplus: 0,
                            unallocated_amount: 0,
                            total_savings: 0,
                            year: year,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        })
                        .then(() => {
                            console.log('Đã tạo mới dữ liệu tổng kết năm');
                            if (yearlySavingsAmount) yearlySavingsAmount.textContent = '0 ₫';
                            if (unallocatedAmount) unallocatedAmount.textContent = '0 ₫';
                        })
                        .catch(error => {
                            console.error('Lỗi khi tạo mới dữ liệu tổng kết năm:', error);
                        });
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu tổng kết năm: ', error);
                if (yearlySavingsAmount) yearlySavingsAmount.textContent = '0 ₫';
                if (unallocatedAmount) unallocatedAmount.textContent = '0 ₫';
            });
    }
    
    // Quản lý modal tiết kiệm
    if (manageSavingsBtn) {
        manageSavingsBtn.addEventListener('click', function() {
            openSavingsModal();
        });
    }
    
    if (closeSavingsModal) {
        closeSavingsModal.addEventListener('click', function() {
            savingsModal.style.display = 'none';
        });
    }
    
    // Mở modal tiết kiệm
    function openSavingsModal() {
        // Lấy các giá trị đang hiển thị trên trang để hiển thị trong modal
        if (unallocatedAmount) {
            const unallocatedText = unallocatedAmount.textContent;
            if (modalUnallocatedAmount) {
                modalUnallocatedAmount.textContent = unallocatedText;
            }
        }
        
        // Hiển thị tổng tiền tiết kiệm trong modal
        const year = new Date().getFullYear().toString();
        db.collection('users').doc(currentUser.uid).collection('yearly_summary')
            .doc(year)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const summary = doc.data();
                    
                    // Thêm hiển thị tổng tiết kiệm vào modal
                    const totalSavings = summary.total_savings || 0;
                    const savingsModalHeader = document.querySelector('#savingsModal h2');
                    
                    // Thêm div hiển thị tổng tiết kiệm nếu chưa có
                    let savingsTotalElement = document.getElementById('modalTotalSavings');
                    if (!savingsTotalElement) {
                        const summaryContainer = document.querySelector('.savings-summary');
                        const newSummaryItem = document.createElement('div');
                        newSummaryItem.className = 'summary-item';
                        newSummaryItem.innerHTML = `
                            <span class="summary-label">Tổng Tiền Tiết Kiệm:</span>
                            <span id="modalTotalSavings" class="summary-value">${formatCurrency(totalSavings)}</span>
                        `;
                        summaryContainer.appendChild(newSummaryItem);
                    } else {
                        savingsTotalElement.textContent = formatCurrency(totalSavings);
                    }
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu tổng kết năm: ', error);
            });
        
        // Reset form và hiển thị modal
        if (savingsForm) savingsForm.reset();
        if (savingsAction) savingsAction.value = '';
        if (savingsCategoryGroup) savingsCategoryGroup.style.display = 'none';
        
        // Tải lịch sử tiết kiệm
        loadSavingsHistory();
        
        // Hiển thị modal
        savingsModal.style.display = 'block';
    }
    
    // Xử lý thay đổi hành động tiết kiệm
    if (savingsAction) {
        savingsAction.addEventListener('change', function() {
            // Chi tiêu từ tiết kiệm cần chọn danh mục, các loại khác không cần
            if (this.value === 'spend') {
                savingsCategoryGroup.style.display = 'block';
            } else {
                savingsCategoryGroup.style.display = 'none';
            }
            
            // Đổi placeholder và label theo loại hành động
            const descriptionInput = document.getElementById('savingsDescription');
            if (this.value === 'save') {
                descriptionInput.placeholder = 'Ví dụ: Tiết kiệm từ lương tháng 4';
            } else if (this.value === 'withdraw') {
                descriptionInput.placeholder = 'Ví dụ: Rút tiền để chi tiêu';
            } else if (this.value === 'spend') {
                descriptionInput.placeholder = 'Ví dụ: Mua quà sinh nhật từ tiết kiệm';
            }
        });
    }
    
    // Xử lý form tiết kiệm
    if (savingsForm) {
        savingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const action = savingsAction.value;
                if (!action) {
                    alert('Vui lòng chọn hành động');
                    return;
                }
                
                // Xử lý số tiền
                const amountValue = savingsAmount.value.trim();
                const cleanedAmount = amountValue.replace(/\D/g, '');
                const amount = parseInt(cleanedAmount) || 0;
                
                if (amount <= 0) {
                    alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
                    return;
                }
                
                const description = savingsDescription.value.trim();
                const year = new Date().getFullYear().toString();
                
                // Kiểm tra số dư trước khi thực hiện
                db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                    .doc(year)
                    .get()
                    .then(doc => {
                        if (!doc.exists) {
                            alert('Không tìm thấy dữ liệu tổng kết năm');
                            return;
                        }
                        
                        const unallocated = doc.data().unallocated_amount || 0;
                        const totalSavings = doc.data().total_savings || 0;
                        
                        // Kiểm tra số tiền dựa trên loại giao dịch
                        if (action === 'save' && amount > unallocated) {
                            alert('Số tiền vượt quá số dư chưa phân bổ');
                            return;
                        } else if ((action === 'withdraw' || action === 'spend') && amount > totalSavings) {
                            alert('Số tiền vượt quá tổng tiền tiết kiệm hiện có');
                            return;
                        }
                        
                        // Xử lý theo loại giao dịch
                        if (action === 'save') {
                            // Thêm vào tiết kiệm
                            db.collection('users').doc(currentUser.uid).collection('savings_history')
                                .add({
                                    type: 'save',
                                    amount: amount,
                                    description: description || 'Thêm vào tiết kiệm',
                                    date: new Date().toISOString().split('T')[0],
                                    year: year,
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                })
                                .then(() => {
                                    // Cập nhật số dư chưa phân bổ
                                    const newUnallocated = unallocated - amount;
                                    const newSavings = totalSavings + amount;
                                    
                                    console.log('Cập nhật số dư sau khi thêm vào tiết kiệm:', {
                                        unallocated_cũ: unallocated,
                                        unallocated_mới: newUnallocated,
                                        tiết_kiệm_cũ: totalSavings,
                                        tiết_kiệm_mới: newSavings
                                    });
                                    
                                    db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                                        .doc(year)
                                        .update({
                                            unallocated_amount: newUnallocated,
                                            total_savings: newSavings,
                                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                        })
                                        .then(() => {
                                            alert('Đã thêm vào tiết kiệm thành công!');
                                            // Cập nhật hiển thị ngay trong modal
                                            modalUnallocatedAmount.textContent = formatCurrency(newUnallocated);
                                            // Cập nhật hiển thị trên trang chính
                                            if (unallocatedAmount) {
                                                unallocatedAmount.textContent = formatCurrency(newUnallocated);
                                            }
                                            if (yearlySavingsAmount) {
                                                yearlySavingsAmount.textContent = formatCurrency(newSavings);
                                            }
                                            
                                            loadYearlySummary();
                                            loadSavingsHistory();
                                            savingsForm.reset();
                                        })
                                        .catch(error => {
                                            console.error('Lỗi khi cập nhật số dư: ', error);
                                            alert('Lỗi: ' + error.message);
                                        });
                                })
                                .catch(error => {
                                    console.error('Lỗi khi thêm vào tiết kiệm: ', error);
                                    alert('Lỗi: ' + error.message);
                                });
                        } else if (action === 'withdraw') {
                            // Rút tiền từ tiết kiệm về số dư chưa phân bổ
                            db.collection('users').doc(currentUser.uid).collection('savings_history')
                                .add({
                                    type: 'withdraw',
                                    amount: amount,
                                    description: description || 'Rút từ tiết kiệm',
                                    date: new Date().toISOString().split('T')[0],
                                    year: year,
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                })
                                .then(() => {
                                    const newSavings = Math.max(0, totalSavings - amount);
                                    const newUnallocated = unallocated + amount;
                                    
                                    console.log('Cập nhật số dư sau khi rút tiền từ tiết kiệm:', {
                                        tiết_kiệm_cũ: totalSavings,
                                        tiết_kiệm_mới: newSavings,
                                        unallocated_cũ: unallocated,
                                        unallocated_mới: newUnallocated
                                    });
                                    
                                    db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                                        .doc(year)
                                        .update({
                                            total_savings: newSavings,
                                            unallocated_amount: newUnallocated,
                                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                        })
                                        .then(() => {
                                            alert('Đã rút tiền từ tiết kiệm thành công!');
                                            // Cập nhật hiển thị ngay trong modal
                                            modalUnallocatedAmount.textContent = formatCurrency(newUnallocated);
                                            // Cập nhật hiển thị trên trang chính
                                            if (unallocatedAmount) {
                                                unallocatedAmount.textContent = formatCurrency(newUnallocated);
                                            }
                                            if (yearlySavingsAmount) {
                                                yearlySavingsAmount.textContent = formatCurrency(newSavings);
                                            }
                                            
                                            loadYearlySummary();
                                            loadSavingsHistory();
                                            savingsForm.reset();
                                        })
                                        .catch(error => {
                                            console.error('Lỗi khi cập nhật số dư: ', error);
                                            alert('Lỗi: ' + error.message);
                                        });
                                })
                                .catch(error => {
                                    console.error('Lỗi khi rút tiền từ tiết kiệm: ', error);
                                    alert('Lỗi: ' + error.message);
                                });
                        } else if (action === 'spend') {
                            // Chi tiêu từ tiết kiệm
                            const category = savingsCategory.value;
                            if (!category) {
                                alert('Vui lòng chọn loại chi tiêu');
                                return;
                            }
                            
                            db.collection('users').doc(currentUser.uid).collection('savings_history')
                                .add({
                                    type: 'spend',
                                    amount: amount,
                                    category: category,
                                    description: description || 'Chi tiêu từ tiết kiệm',
                                    date: new Date().toISOString().split('T')[0],
                                    year: year,
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                })
                                .then(() => {
                                    // Cập nhật số dư tiết kiệm
                                    const newSavings = Math.max(0, totalSavings - amount);
                                    
                                    console.log('Cập nhật số dư sau khi chi tiêu từ tiết kiệm:', {
                                        tiết_kiệm_cũ: totalSavings,
                                        tiết_kiệm_mới: newSavings
                                    });
                                    
                                    db.collection('users').doc(currentUser.uid).collection('yearly_summary')
                                        .doc(year)
                                        .update({
                                            total_savings: newSavings,
                                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                        })
                                        .then(() => {
                                            // Thêm vào danh sách chi tiêu
                                            const expenseData = {
                                                amount: amount,
                                                category: category,
                                                description: description || 'Chi tiêu từ tiết kiệm',
                                                date: new Date().toISOString().split('T')[0],
                                                month: new Date().toISOString().split('-').slice(0, 2).join('-'),
                                                year: year,
                                                fromSavings: true,
                                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                            };
                                            
                                            db.collection('users').doc(currentUser.uid).collection('expenses')
                                                .add(expenseData)
                                                .then(() => {
                                                    alert('Đã chi tiêu từ tiết kiệm thành công!');
                                                    // Cập nhật hiển thị trên trang chính
                                                    if (yearlySavingsAmount) {
                                                        yearlySavingsAmount.textContent = formatCurrency(newSavings);
                                                    }
                                                    
                                                    loadYearlySummary();
                                                    loadSavingsHistory();
                                                    loadExpenses(); // Cập nhật danh sách chi tiêu
                                                    savingsForm.reset();
                                                })
                                                .catch(error => {
                                                    console.error('Lỗi khi thêm vào chi tiêu: ', error);
                                                    alert('Lỗi: ' + error.message);
                                                });
                                        })
                                        .catch(error => {
                                            console.error('Lỗi khi cập nhật số dư: ', error);
                                            alert('Lỗi: ' + error.message);
                                        });
                                })
                                .catch(error => {
                                    console.error('Lỗi khi chi tiêu từ tiết kiệm: ', error);
                                    alert('Lỗi: ' + error.message);
                                });
                        }
                    })
                    .catch(error => {
                        console.error('Lỗi khi kiểm tra số dư: ', error);
                        alert('Lỗi: ' + error.message);
                    });
            } catch (error) {
                console.error('Lỗi khi xử lý form tiết kiệm: ', error);
                alert('Có lỗi xảy ra: ' + error.message);
            }
        });
    }
    
    // Tải lịch sử tiết kiệm
    function loadSavingsHistory() {
        const year = new Date().getFullYear().toString();
        
        db.collection('users').doc(currentUser.uid).collection('savings_history')
            .where('year', '==', year)
            .orderBy('createdAt', 'desc')
            .get()
            .then(snapshot => {
                savingsHistoryList.innerHTML = '';
                
                if (snapshot.empty) {
                    savingsHistoryList.innerHTML = '<div class="empty-message">Chưa có giao dịch tiết kiệm nào.</div>';
                    return;
                }
                
                snapshot.forEach(doc => {
                    const record = doc.data();
                    const historyItem = document.createElement('div');
                    historyItem.className = 'savings-history-item';
                    
                    const date = new Date(record.date);
                    const formattedDate = date.toLocaleDateString('vi-VN');
                    
                    const categoryMap = {
                        'food': 'Ăn Uống',
                        'entertainment': 'Giải Trí',
                        'bills': 'Hóa Đơn & Dịch Vụ',
                        'transport': 'Di Chuyển',
                        'shopping': 'Mua Sắm',
                        'housing': 'Nhà Ở',
                        'health': 'Y Tế',
                        'other': 'Khác'
                    };
                    
                    let typeText = '';
                    let typeClass = '';
                    
                    // Xác định loại giao dịch
                    if (record.type === 'save') {
                        typeText = 'Thêm vào tiết kiệm';
                        typeClass = 'income';
                    } else if (record.type === 'withdraw') {
                        typeText = 'Rút từ tiết kiệm';
                        typeClass = 'expense';
                    } else if (record.type === 'spend') {
                        typeText = 'Chi tiêu từ tiết kiệm';
                        typeClass = 'expense';
                    }
                    
                    let categoryText = record.category ? ` (${categoryMap[record.category] || record.category})` : '';
                    
                    historyItem.innerHTML = `
                        <div class="history-details">
                            <div class="history-top">
                                <span class="history-amount ${typeClass}">${formatCurrency(record.amount)}</span>
                                <span class="history-date">${formattedDate}</span>
                            </div>
                            <div class="history-bottom">
                                <span class="history-type">${typeText}${categoryText}</span>
                                <span class="history-description">${record.description}</span>
                            </div>
                        </div>
                    `;
                    
                    savingsHistoryList.appendChild(historyItem);
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải lịch sử tiết kiệm: ', error);
                savingsHistoryList.innerHTML = '<div class="error-message">Có lỗi xảy ra khi tải dữ liệu.</div>';
            });
    }

    // Render an expense item in the list
    function renderExpense(expense) {
        if (!expensesList) {
            console.error('Cannot render expense: expensesList element not found');
            return;
        }
        
        try {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.dataset.id = expense.id;
            
            // Get category display name
            const categoryMap = {
                'food': 'Ăn Uống',
                'entertainment': 'Giải Trí',
                'bills': 'Hóa Đơn & Dịch Vụ',
                'transport': 'Di Chuyển',
                'shopping': 'Mua Sắm',
                'housing': 'Nhà Ở',
                'health': 'Y Tế',
                'other': 'Khác'
            };
            
            // Format the date 
            const date = new Date(expense.date);
            const formattedDate = date.toLocaleDateString('vi-VN');
            
            // Safe access to expense properties with fallbacks
            const amount = expense.amount || 0;
            const description = expense.description || '';
            const category = expense.category || 'other';
            
            expenseItem.innerHTML = `
                <div class="expense-details">
                    <div class="expense-top">
                        <span class="expense-amount">${formatCurrency(amount)}</span>
                        <span class="expense-date">${formattedDate}</span>
                    </div>
                    <div class="expense-bottom">
                        <span class="expense-description">${description}</span>
                        <span class="expense-category">${categoryMap[category] || category}</span>
                    </div>
                </div>
                <div class="expense-actions">
                    <button class="btn icon-btn edit-btn" data-id="${expense.id}">✏️</button>
                    <button class="btn icon-btn delete-btn" data-id="${expense.id}">🗑️</button>
                </div>
            `;
            
            expensesList.appendChild(expenseItem);
            
            // Add event listeners to edit and delete buttons
            expenseItem.querySelector('.edit-btn').addEventListener('click', function() {
                editExpense(expense.id);
            });
            
            expenseItem.querySelector('.delete-btn').addEventListener('click', function() {
                deleteExpense(expense.id);
            });
        } catch (error) {
            console.error('Error rendering expense:', error);
        }
    }

    // Handle expense form submission (add/edit expense)
    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Lấy và xử lý giá trị, loại bỏ tất cả dấu chấm
                const amountInput = document.getElementById('amount').value;
                // Loại bỏ tất cả ký tự không phải số
                const cleanedAmount = amountInput.replace(/\D/g, '');
                const amount = parseInt(cleanedAmount) || 0;
                
                console.log("Số tiền chi tiêu đang lưu:", amount);
                
                if (amount <= 0) {
                    alert("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
                    return;
                }
                
                const category = document.getElementById('category').value;
                if (!category) {
                    alert("Vui lòng chọn loại chi tiêu");
                    return;
                }
                
                const description = document.getElementById('description').value;
                const date = document.getElementById('date').value;
                const expenseId = document.getElementById('expenseId').value;
                
                // Tính tháng từ ngày chi tiêu
                const expenseMonth = getMonthFromDate(date);
                
                const expenseData = {
                    amount: amount,
                    category,
                    description,
                    date,
                    month: expenseMonth,
                    year: expenseMonth.split('-')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                if (editMode && expenseId) {
                    // Cập nhật chi tiêu hiện có
                    db.collection('users').doc(currentUser.uid).collection('expenses').doc(expenseId)
                        .update(expenseData)
                        .then(() => {
                            resetForm();
                            loadExpenses();
                        })
                        .catch(error => {
                            console.error('Lỗi khi cập nhật chi tiêu: ', error);
                            alert("Lỗi: " + error.message);
                        });
                } else {
                    // Thêm chi tiêu mới
                    db.collection('users').doc(currentUser.uid).collection('expenses')
                        .add(expenseData)
                        .then(() => {
                            resetForm();
                            loadExpenses();
                            alert("Đã thêm chi tiêu thành công!");
                        })
                        .catch(error => {
                            console.error('Lỗi khi thêm chi tiêu: ', error);
                            alert("Lỗi: " + error.message);
                        });
                }
            } catch (error) {
                console.error("Lỗi khi xử lý form chi tiêu:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại");
            }
        });
    }

    // Reset the expense form
    function resetForm() {
        expenseForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        document.getElementById('expenseId').value = '';
        document.getElementById('amount').focus();
        
        // Reset UI to "Add" mode
        document.querySelector('#expenseForm button[type="submit"]').textContent = 'Thêm Chi Tiêu';
        cancelEditBtn.classList.add('hidden');
        editMode = false;
    }

    // Load expense data for editing
    function editExpense(id) {
        db.collection('users').doc(currentUser.uid).collection('expenses').doc(id)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const expense = doc.data();
                    
                    // Điền form với dữ liệu chi tiêu
                    // Định dạng số tiền với dấu chấm ngăn cách
                    document.getElementById('amount').value = expense.amount.toLocaleString('vi-VN');
                    document.getElementById('category').value = expense.category;
                    document.getElementById('description').value = expense.description;
                    document.getElementById('date').value = expense.date;
                    document.getElementById('expenseId').value = id;
                    
                    // Cập nhật UI thành chế độ "Chỉnh sửa"
                    document.querySelector('#expenseForm button[type="submit"]').textContent = 'Cập Nhật Chi Tiêu';
                    cancelEditBtn.classList.remove('hidden');
                    editMode = true;
                    
                    // Cuộn đến form
                    document.querySelector('.expense-form-card').scrollIntoView({ behavior: 'smooth' });
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu chi tiêu: ', error);
            });
    }

    // Delete an expense
    function deleteExpense(id) {
        if (confirm('Bạn có chắc muốn xóa khoản chi tiêu này?')) {
            db.collection('users').doc(currentUser.uid).collection('expenses').doc(id)
                .delete()
                .then(() => {
                    loadExpenses();
                })
                .catch(error => {
                    console.error('Lỗi khi xóa chi tiêu: ', error);
                });
        }
    }

    // Cancel edit button
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            resetForm();
        });
    }

    // Income modal handling
    if (updateIncomeBtn) {
        updateIncomeBtn.addEventListener('click', function() {
            // Đặt lại giá trị khi mở modal
            if (monthlyIncome > 0) {
                incomeInput.value = monthlyIncome;
            } else {
                incomeInput.value = '';
            }
            
            // Hiển thị modal
            incomeModal.style.display = 'block';
            // Focus vào ô nhập
            setTimeout(() => incomeInput.focus(), 100);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            incomeModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === incomeModal) {
            incomeModal.style.display = 'none';
        }
    });

    // Handle income form submission
    if (incomeForm) {
        incomeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Lấy giá trị và loại bỏ tất cả ký tự không phải số
                const incomeValue = incomeInput.value.trim();
                const cleanedValue = incomeValue.replace(/\D/g, '');
                const income = parseInt(cleanedValue) || 0;
                
                console.log("Đang lưu thu nhập:", income); // Debug log
                
                if (income <= 0) {
                    alert("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
                    return;
                }
                
                // Lưu thu nhập cho tháng đang chọn
                const selectedMonth = filterMonth.value || getCurrentMonth();
                
                db.collection('users').doc(currentUser.uid).collection('income')
                    .doc(selectedMonth)
                    .set({
                        amount: income,
                        month: selectedMonth,
                        year: selectedMonth.split('-')[0],
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        monthlyIncome = income;
                        incomeAmount.textContent = formatCurrency(income);
                        incomeModal.style.display = 'none';
                        updateBalance();
                        
                        // Thông báo thành công
                        alert("Đã cập nhật thu nhập thành công!");
                    })
                    .catch(error => {
                        console.error('Lỗi khi lưu thu nhập: ', error);
                        alert("Lỗi khi lưu: " + error.message);
                    });
            } catch (error) {
                console.error("Lỗi khi xử lý form thu nhập:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại");
            }
        });
    }

    // Filter handlers
    if (filterCategory) {
        filterCategory.addEventListener('change', loadExpenses);
    }

    if (filterMonth) {
        filterMonth.addEventListener('change', loadMonthlyData);
    }
}); 