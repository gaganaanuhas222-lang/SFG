document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (mobileMenuBtn && navLinks) {
        // Toggle Mobile Menu
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Icon එක 'bars' සහ 'xmark' (Close) අතර මාරු කිරීම
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Menu Item එකක් Click කළාම Menu එක Auto Close වීම
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});

// Textbooks Filter Logic
    const tbFilterBtns = document.querySelectorAll('.tb-filter-btn');
    const tbCards = document.querySelectorAll('.tb-card');

    if (tbFilterBtns.length > 0) {
        tbFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tbFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const grade = btn.getAttribute('data-grade');

                tbCards.forEach(card => {
                    if (grade === 'all' || card.getAttribute('data-grade') === grade) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }