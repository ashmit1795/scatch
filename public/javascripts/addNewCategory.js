document.addEventListener('DOMContentLoaded', () => {
     // Add New Category Field Dynamically
     document.getElementById('add-category-field').addEventListener('click', () => {
        const container = document.getElementById('new-category-fields');
        const newField = document.createElement('input');
        newField.type = 'text';
        newField.name = 'newCategories[]';
        newField.placeholder = 'Enter new category';
        newField.className = 'w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition';
        container.appendChild(newField);
    });
});