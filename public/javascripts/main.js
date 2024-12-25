document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu Toggle Logic
    const toggleMenu = document.getElementById("toggleMenu");
    const closeMenu = document.getElementById("closeMenu");
    const mobileMenu = document.getElementById("mobileMenu");
    
    if (toggleMenu && mobileMenu) {
        toggleMenu.addEventListener("click", () => {
            mobileMenu.classList.remove("hidden");
        });
    
        closeMenu.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
        });
    }
});


