document.addEventListener('DOMContentLoaded', function() {
    const burgerIcon = document.querySelector('.burger-icon');
    const navItems = document.querySelector('.nav-items');

    burgerIcon.addEventListener('click', function() {
        navItems.classList.toggle('show');
    });
});
