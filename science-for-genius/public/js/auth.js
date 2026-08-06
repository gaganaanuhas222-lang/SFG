document.addEventListener('DOMContentLoaded', () => {
    // Elements Selection
    const openLoginBtn = document.getElementById('open-login-btn');
    const closeBtn = document.getElementById('close-modal');
    const modal = document.getElementById('auth-modal');

    // Role Tabs
    const tabStudent = document.getElementById('tab-student');
    const tabCoordinator = document.getElementById('tab-coordinator');
    const studentSection = document.getElementById('student-section');
    const coordinatorSection = document.getElementById('coordinator-section');

    // Form Switchers
    const goToRegister = document.getElementById('go-to-student-register');
    const goToLogin = document.getElementById('go-to-student-login');
    const studentLoginForm = document.getElementById('student-login-form');
    const studentRegisterForm = document.getElementById('student-register-form');

    // 1. OPEN MODAL
    if (openLoginBtn && modal) {
        openLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }

    // 2. CLOSE MODAL
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // 3. CLOSE ON OUTSIDE CLICK
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // 4. TAB SWITCHING (Student vs Coordinator)
    if (tabStudent && tabCoordinator && studentSection && coordinatorSection) {
        tabStudent.addEventListener('click', () => {
            tabStudent.classList.add('active');
            tabCoordinator.classList.remove('active');
            studentSection.classList.add('active-section');
            coordinatorSection.classList.remove('active-section');
        });

        tabCoordinator.addEventListener('click', () => {
            tabCoordinator.classList.add('active');
            tabStudent.classList.remove('active');
            coordinatorSection.classList.add('active-section');
            studentSection.classList.remove('active-section');
        });
    }

    // 5. FORM SWITCHING (Login <-> Register)
    if (goToRegister && goToLogin && studentLoginForm && studentRegisterForm) {
        goToRegister.addEventListener('click', () => {
            studentLoginForm.classList.remove('active-form');
            studentRegisterForm.classList.add('active-form');
        });

        goToLogin.addEventListener('click', () => {
            studentRegisterForm.classList.remove('active-form');
            studentLoginForm.classList.add('active-form');
        });
    }
});