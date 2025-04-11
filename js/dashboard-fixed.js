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
    const closeModal = document.querySelector('.close-modal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const filterCategory = document.getElementById('filterCategory');
    const filterMonth = document.getElementById('filterMonth');
    
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
    
    // Set default month filter to current month
    filterMonth.value = getCurrentMonth();
    
    let currentUser = null;
    let editMode = false;
    let monthlyIncome = 0;
    
    // Xử lý số nhập vào - chỉ cho phép nhập số
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', formatAmountInput);
    }
    
    if (incomeInput) {
        incomeInput.addEventListener('input', formatAmountInput);
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
    }
    
    // Check authentication
    checkAuth()
        .then(user => {
            currentUser = user;
            loadExpenses();
            loadIncome();
        })
        .catch(error => {
            console.error(error);
            // Already redirected by checkAuth function
        });
    
    // Load income data
    function loadIncome() {
        db.collection('users').doc(currentUser.uid).collection('income').doc('monthly')
            .get()
            .then(doc => {
                console.log("Dữ liệu thu nhập:", doc.exists ? doc.data() : "không có");
                
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
    
    // Load expenses data
    function loadExpenses() {
        let query = db.collection('users').doc(currentUser.uid).collection('expenses')
            .orderBy('date', 'desc');
        
        // Apply category filter if selected
        const selectedCategory = filterCategory.value;
        if (selectedCategory) {
            query = query.where('category', '==', selectedCategory);
        }
        
        query.get()
            .then(snapshot => {
                // Clear existing expenses list
                expensesList.innerHTML = '';
                
                let totalExpense = 0;
                let monthlyExpense = 0;
                const selectedMonth = filterMonth.value;
                const currentMonth = getCurrentMonth();
                
                if (snapshot.empty) {
                    expensesList.innerHTML = '<div class="empty-message">Không tìm thấy khoản chi tiêu nào.</div>';
                } else {
                    snapshot.forEach(doc => {
                        const expense = doc.data();
                        expense.id = doc.id;
                        
                        // For monthly total calculation
                        const expenseMonth = getMonthFromDate(expense.date);
                        
                        // Filter by month if selected
                        if (!selectedMonth || expenseMonth === selectedMonth) {
                            renderExpense(expense);
                        }
                        
                        // Calculate total for current month
                        if (expenseMonth === currentMonth) {
                            monthlyExpense += parseInt(expense.amount);
                        }
                        
                        // Calculate total for filtered month
                        if (selectedMonth && expenseMonth === selectedMonth) {
                            totalExpense += parseInt(expense.amount);
                        } else if (!selectedMonth) {
                            // If no month filter, count everything
                            totalExpense += parseInt(expense.amount);
                        }
                    });
                }
                
                // Update expense total display
                expenseAmount.textContent = formatCurrency(monthlyExpense);
                updateBalance();
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu chi tiêu: ', error);
            });
    }
    
    // Calculate and update balance
    function updateBalance() {
        // Get total expenses for current month only
        db.collection('users').doc(currentUser.uid).collection('expenses')
            .get()
            .then(snapshot => {
                let monthlyExpense = 0;
                const currentMonth = getCurrentMonth();
                
                snapshot.forEach(doc => {
                    const expense = doc.data();
                    const expenseMonth = getMonthFromDate(expense.date);
                    
                    if (expenseMonth === currentMonth) {
                        monthlyExpense += parseInt(expense.amount);
                    }
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
            })
            .catch(error => {
                console.error('Lỗi khi tính số dư: ', error);
            });
    }
    
    // Render an expense item in the list
    function renderExpense(expense) {
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
        
        expenseItem.innerHTML = `
            <div class="expense-details">
                <div class="expense-top">
                    <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                    <span class="expense-date">${formattedDate}</span>
                </div>
                <div class="expense-bottom">
                    <span class="expense-description">${expense.description}</span>
                    <span class="expense-category">${categoryMap[expense.category] || expense.category}</span>
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
                
                const expenseData = {
                    amount: amount,
                    category,
                    description,
                    date,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                if (editMode && expenseId) {
                    // Cập nhật chi tiêu hiện có
                    db.collection('users').doc(currentUser.uid).collection('expenses').doc(expenseId)
                        .update(expenseData)
                        .then(() => {
                            resetForm();
                            loadExpenses();
                            alert("Đã cập nhật chi tiêu thành công!");
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
                    document.querySelector('.expense-form-container').scrollIntoView({ behavior: 'smooth' });
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
                    alert("Đã xóa chi tiêu thành công!");
                })
                .catch(error => {
                    console.error('Lỗi khi xóa chi tiêu: ', error);
                    alert("Lỗi: " + error.message);
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
                incomeInput.value = monthlyIncome.toLocaleString('vi-VN');
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
                const incomeValue = incomeInput.value;
                const cleanedValue = incomeValue.replace(/\D/g, '');
                const income = parseInt(cleanedValue) || 0;
                
                console.log("Đang lưu thu nhập:", income); // Debug log
                
                if (income <= 0) {
                    alert("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
                    return;
                }
                
                db.collection('users').doc(currentUser.uid).collection('income').doc('monthly')
                    .set({
                        amount: income,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        monthlyIncome = income;
                        incomeAmount.textContent = formatCurrency(income);
                        incomeModal.style.display = 'none';
                        updateBalance();
                        
                        // Format lại giá trị input
                        incomeInput.value = income.toLocaleString('vi-VN');
                        
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
        filterMonth.addEventListener('change', loadExpenses);
    }
}); 