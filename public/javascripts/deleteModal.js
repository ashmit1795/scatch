document.addEventListener("DOMContentLoaded", () => {
    const deleteButtons = document.querySelectorAll('.delete-product-btn'); 
    const deleteForm = document.getElementById("deleteForm");
    const deleteModal = document.getElementById("deleteModal");
    const closeDeleteModalBtn = document.getElementById("close-modal");

    deleteButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            openDeleteModal(productId);
        });
    });

    closeDeleteModalBtn.addEventListener("click", () => {
        closeDeleteModal();
    });


    const openDeleteModal = (productId) => {
        deleteForm.action = `/app/product/delete/${productId}`;
        deleteModal.classList.remove("hidden");
    };

    const closeDeleteModal = () => {
        deleteModal.classList.add("hidden");
    };

    const productModal = document.getElementById("productModal");
    const closeProductModalBtn = document.getElementById("closeModal");

    // Function to open the modal
    function openProductModal(productDetails) {
        document.getElementById('modalImage').src = productDetails.image;
        document.getElementById('modalName').textContent = productDetails.name;
        document.getElementById('modalDescription').textContent = productDetails.description;
        document.getElementById('modalPrice').textContent = productDetails.price;
        document.getElementById('modalStock').textContent = productDetails.stock;
        document.getElementById('modalDiscount').textContent = productDetails.discount;
        document.getElementById('modalEditLink').href = `/app/product/edit/${productDetails.productId}`;
        document.getElementById('modalDeleteLink').href = `/app/product/delete/${productDetails.productId}`;
        document.getElementById('productModal').classList.remove('hidden');
    }

    // Function to close the modal
    function closeProductModal() {
        productModal.classList.add('hidden');
    }

    // Event listener for closing the modal
    closeProductModalBtn.addEventListener("click", closeProductModal);

    // Event delegation for opening the modal
    document.addEventListener("click", (event) => {
        if (event.target.closest("[data-modal-trigger]")) {
            const trigger = event.target.closest("[data-modal-trigger]");
            const productDetails = {
                image: trigger.dataset.productImage,
                name: trigger.dataset.productName,
                description: trigger.dataset.productDescription,
                price: trigger.dataset.productPrice,
                stock: trigger.dataset.productStock,
                discount: trigger.dataset.productDiscount,
                productId: trigger.dataset.productId,
            };
            
            openProductModal(productDetails);
        }
    });

});