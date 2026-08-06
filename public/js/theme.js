// Dark / Light Theme Toggle Functionality
const themeToggleBtn = document.getElementById('theme-toggle');

// Check saved theme or system preference
const savedTheme = localStorage.getItem('sfg-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sfg-theme', newTheme);
    });
}