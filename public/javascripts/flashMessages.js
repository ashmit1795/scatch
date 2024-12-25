 document.addEventListener("DOMContentLoaded", () => {
    // Flash Message Timeout
    setTimeout(function() {
        const flashSuccess = document.getElementById('flash-success');
        const flashError = document.getElementById('flash-error');
        if(flashSuccess) {
            flashSuccess.style.display = 'none';
        }
        if(flashError) {
            flashError.style.display = 'none';
        }
    }, 3000);
 });