document.addEventListener("DOMContentLoaded", () => {
    const deleteButtons = document.querySelectorAll('.delete-product-btn'); 
    const deleteForm = document.getElementById("deleteForm");
    const deleteModal = document.getElementById("deleteModal");
    const closeModal = document.getElementById("close-modal");

    deleteButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            openDeleteModal(productId);
        });
    });

    closeModal.addEventListener("click", () => {
        closeDeleteModal();
    });


    const openDeleteModal = (productId) => {
        deleteForm.action = `/app/product/delete/${productId}`;
        deleteModal.classList.remove("hidden");
    };

    const closeDeleteModal = () => {
        deleteModal.classList.add("hidden");
    };

});