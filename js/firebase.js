// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvJizp8blN5rosjrbqwpdnPsyP38EOh3I",
    authDomain: "tracker-public.firebaseapp.com",
    projectId: "tracker-public",
    storageBucket: "tracker-public.firebasestorage.app",
    messagingSenderId: "213129469190",
    appId: "1:213129469190:web:9829369efd55dd8c65d287"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore (if the page uses it)
let db;
if (typeof firebase.firestore === 'function') {
    db = firebase.firestore();
}

// Check authentication state
function checkAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                resolve(user);
            } else {
                // If on dashboard page and not authenticated, redirect to login
                if (window.location.pathname.includes('dashboard.html')) {
                    window.location.href = 'login.html';
                }
                reject('User not authenticated');
            }
        });
    });
}

// Format currency (VND)
function formatCurrency(amount) {
    // Định dạng số theo tiếng Việt với dấu chấm phân cách hàng nghìn
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Helper function to get the current month as YYYY-MM
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper function to get month-year from date string
function getMonthFromDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
} 