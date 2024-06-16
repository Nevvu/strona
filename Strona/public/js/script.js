document.addEventListener('DOMContentLoaded', function () {
    const burgerIcon = document.querySelector('.burger-icon');
    const navItems = document.querySelector('.nav-items');

    burgerIcon.addEventListener('click', function () {
        navItems.classList.toggle('show');
    });

    fetchProducts();
    bindFormSubmit();
    bindFilterEvents();
    handleResize(); 
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

            const filteredProducts = products.filter(product => {
                if (selectedBrands.length === 0) return true;
                return selectedBrands.includes(product.brand); 
            });

            filteredProducts.forEach(product => {
                const name = product.name || 'Nieznany produkt';
                const price = parseFloat(product.price) || 0;
                const discount = parseFloat(product.discount) || 0;
                const saleEndTime = product.saleEndTime ? new Date(product.saleEndTime) : null;
                let discountedPrice = price;

                if (saleEndTime && saleEndTime > new Date() && discount > 0) {
                    discountedPrice = (price - (price * discount / 100)).toFixed(2);
                }

                const description = product.description || 'Brak opisu';
                const imageUrl = product.imageUrl || 'placeholder.png';
                const brand = product.brand || 'Nieznana marka';

                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <div class="product-image-container">
                        <img src="${imageUrl}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">
                    </div>
                    <h3>${name}</h3>
                    <p>Cena: ${discount > 0 && saleEndTime && saleEndTime > new Date() ? `<span class="original-price">${price.toFixed(2)} zł</span> <span class="discounted-price">${discountedPrice} zł</span>` : `${price.toFixed(2)} zł`}</p>
                    <p>${description}</p>
                    ${saleEndTime ? `<p>Promocja kończy się za: <span class="countdown" data-end-time="${saleEndTime}" data-original-price="${price.toFixed(2)}"></span></p>` : ''}
                    <div class="button-container">
                        <button class="edit-product" data-id="${product.id}">Edytuj</button>
                        <button class="delete-product" data-id="${product.id}">Usuń</button>
                    </div>
                `;
                productsContainer.appendChild(productDiv);
            });

            document.querySelectorAll('.edit-product').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    editProduct(productId);
                });
            });

            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });

            updateCountdowns();
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

function editProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const form = document.getElementById('edit-product-form');
            form.querySelector('input[name="productId"]').value = product.id;
            form.querySelector('input[name="saleDuration"]').value = product.saleDuration || '';
            form.querySelector('input[name="productDiscount"]').value = product.discount || '';
        });
}

function bindFormSubmit() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const productData = {
            brand: formData.get('productBrand'),
            name: formData.get('productName'),
            price: parseFloat(formData.get('productPrice')),
            description: formData.get('productDescription'),
            imageUrl: formData.get('productImage') ? URL.createObjectURL(formData.get('productImage')) : 'placeholder.png',
            discount: parseFloat(formData.get('productDiscount')) || 0,
            saleDuration: parseInt(formData.get('saleDuration'), 10) || 0
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

    const editForm = document.getElementById('edit-product-form');
    editForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(editForm);
        const productId = formData.get('productId');
        const saleDuration = parseInt(formData.get('saleDuration'), 10);
        const discount = parseFloat(formData.get('productDiscount')) || 0;

        if (saleDuration < 0) {
            alert('Czas trwania promocji nie może być ujemny.');
            return;
        }

        const now = new Date();
        const saleEndTime = new Date(now.getTime() + saleDuration * 60000);

        fetch(`http://localhost:3000/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                product.saleEndTime = saleEndTime;
                product.discount = discount;

                fetch(`http://localhost:3000/products/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(product)
                }).then(response => {
                    if(response.ok) {
                        fetchProducts();
                    }
                });

                editForm.reset();
            });
    });
}

function bindFilterEvents() {
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', fetchProducts);
    });
}

function toggleMenu() {
    const navItems = document.querySelector('.nav-items');
    if (navItems.style.display === 'flex') {
        navItems.style.display = 'none';
    } else {
        navItems.style.display = 'flex';
    }
}

function handleResize() {
    const navItems = document.querySelector('.nav-items');
    if (window.innerWidth >= 768) {
        navItems.style.display = 'flex';
    } else {
        navItems.style.display = 'none';
    }
}

function toggleFilters() {
    const filterSection = document.querySelector('.filter-section');
    filterSection.classList.toggle('active');
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);

function updateCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown');

    countdownElements.forEach(element => {
        const endTime = new Date(element.dataset.endTime);
        const originalPrice = element.dataset.originalPrice;
        const interval = setInterval(() => {
            const now = new Date();
            const timeRemaining = endTime - now;

            if (timeRemaining <= 0) {
                clearInterval(interval);
                element.textContent = 'Promocja zakończona';
                const productElement = element.closest('.product');
                const priceElement = productElement.querySelector('.discounted-price');
                if (priceElement) {
                    priceElement.textContent = `${originalPrice} zł`;
                    priceElement.classList.remove('discounted-price');
                    const originalPriceElement = productElement.querySelector('.original-price');
                    if (originalPriceElement) {
                        originalPriceElement.remove();
                    }
                }
                element.closest('.countdown-container').remove();
            } else {
                const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
                const seconds = Math.floor((timeRemaining / 1000) % 60);

                element.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
    });
}
