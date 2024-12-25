document.addEventListener("DOMContentLoaded", () => {
    // Toggle Password Visibility
    document.getElementById("togglePassword").addEventListener("click", function () {
        const passwordField = document.getElementById("password");
        const passwordFieldType = passwordField.type === "password" ? "text" : "password";
        passwordField.type = passwordFieldType;
    
        // Toggle the icon
        this.innerHTML = passwordFieldType === "password" ? '<i class="ri-eye-line"></i>' : '<i class="ri-eye-off-line"></i>';
    });
});