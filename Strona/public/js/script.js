// script.js

document.addEventListener('DOMContentLoaded', function () {
    const burgerIcon = document.querySelector('.burger-icon');
    const navItems = document.querySelector('.nav-items');

    burgerIcon.addEventListener('click', function () {
        navItems.classList.toggle('show');
    });

    fetchProducts();
    bindFormSubmit();
    bindFilterEvents();
});

function clearFilters() {
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    fetchProducts();
}

function fetchProducts() {
    const productsContainer = document.querySelector('.products-container');
    const selectedBrands = Array.from(document.querySelectorAll('.filter-section input[type="checkbox"]:checked'))
                                .map(cb => cb.value);

    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            productsContainer.innerHTML = '';

            // Filtrowanie produktów na podstawie wybranych producentów
            const filteredProducts = products.filter(product => {
                if (selectedBrands.length === 0) return true;
                return selectedBrands.includes(product.brand); // Używamy pola `brand` do filtrowania
            });

            filteredProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.imageUrl || 'placeholder.png'}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">
                    <h3>${product.name}</h3>
                    <p>Cena: ${product.price} zł</p>
                    <p>${product.description}</p>
                    <button class="delete-product" data-id="${product.id}">Usuń</button>
                `;
                productsContainer.appendChild(productDiv);
            });

            // Dodaj event listener dla przycisków usuwania
            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });
        });
}

function deleteProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(response.ok) {
            fetchProducts();
        } else {
            alert('Nie udało się usunąć produktu.');
        }
    });
}

function bindFormSubmit() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const productData = {
            brand: formData.get('productBrand'), // Pobranie wartości producenta z listy
            name: formData.get('productName'),
            price: parseFloat(formData.get('productPrice')),
            description: formData.get('productDescription'),
            imageUrl: formData.get('productImage') ? URL.createObjectURL(formData.get('productImage')) : 'placeholder.png'
        };
        
        fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        }).then(response => {
            if(response.ok) {
                fetchProducts();
            }
        });

        form.reset();
    });
}

function bindFilterEvents() {
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', fetchProducts);
    });
}
