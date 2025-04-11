document.addEventListener('DOMContentLoaded', function() {
    // Xử lý form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            // Xóa thông báo lỗi trước đó
            errorMessage.textContent = '';
            
            // Đăng nhập với Firebase Auth
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    // Chuyển hướng đến trang quản lý khi đăng nhập thành công
                    window.location.href = 'dashboard.html';
                })
                .catch(error => {
                    // Hiển thị thông báo lỗi thân thiện
                    let errorText = '';
                    switch(error.code) {
                        case 'auth/user-not-found':
                            errorText = 'Email này chưa được đăng ký.';
                            break;
                        case 'auth/wrong-password':
                            errorText = 'Mật khẩu không chính xác.';
                            break;
                        case 'auth/invalid-email':
                            errorText = 'Email không hợp lệ.';
                            break;
                        case 'auth/too-many-requests':
                            errorText = 'Quá nhiều lần thử. Vui lòng thử lại sau.';
                            break;
                        default:
                            errorText = 'Đăng nhập không thành công. Vui lòng thử lại.';
                    }
                    errorMessage.textContent = errorText;
                });
        });
    }
    
    // Xử lý form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMessage = document.getElementById('errorMessage');
            
            // Xóa thông báo lỗi trước đó
            errorMessage.textContent = '';
            
            // Kiểm tra mật khẩu khớp nhau
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Mật khẩu không khớp.';
                return;
            }
            
            // Kiểm tra độ mạnh của mật khẩu
            if (password.length < 6) {
                errorMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
                return;
            }
            
            // Tạo người dùng với Firebase Auth
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(() => {
                    // Chuyển hướng đến trang quản lý khi đăng ký thành công
                    window.location.href = 'dashboard.html';
                })
                .catch(error => {
                    // Hiển thị thông báo lỗi thân thiện
                    let errorText = '';
                    switch(error.code) {
                        case 'auth/email-already-in-use':
                            errorText = 'Email này đã được sử dụng.';
                            break;
                        case 'auth/invalid-email':
                            errorText = 'Email không hợp lệ.';
                            break;
                        case 'auth/weak-password':
                            errorText = 'Mật khẩu quá yếu.';
                            break;
                        default:
                            errorText = 'Đăng ký không thành công. Vui lòng thử lại.';
                    }
                    errorMessage.textContent = errorText;
                });
        });
    }
    
    // Xử lý nút đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut()
                .then(() => {
                    // Chuyển hướng đến trang đăng nhập sau khi đăng xuất
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    console.error('Lỗi khi đăng xuất: ', error);
                });
        });
    }
    
    // Kiểm tra trạng thái đăng nhập cho các trang cần bảo vệ
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth().catch(error => {
            console.error(error);
            // Đã được chuyển hướng bởi hàm checkAuth
        });
    }
}); 