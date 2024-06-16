document.addEventListener('DOMContentLoaded', function () {
    const burgerIcon = document.querySelector('.burger-icon');
    const navItems = document.querySelector('.nav-items');

    burgerIcon.addEventListener('click', function () {
        navItems.classList.toggle('show');
    });

    fetchProducts();
    bindFormSubmit();
});

function clearFilters() {
    document
        .querySelectorAll('.filter-section input[type="checkbox"]')
        .forEach((cb) => (cb.checked = false));
}

function fetchProducts() {
    const productsContainer = document.querySelector('.products-container');

    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            productsContainer.innerHTML = '';
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.imageUrl || 'placeholder.png'}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">
                    <h3>${product.name}</h3>
                    <p>Cena: ${product.price} zł</p>
                    <p>${product.description}</p>
                `;
                productsContainer.appendChild(productDiv);
            });
        });
}

function bindFormSubmit() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const productData = {
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
