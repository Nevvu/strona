document.addEventListener('DOMContentLoaded', function () {
    const burgerIcon = document.querySelector('.burger-icon');
    const navItems = document.querySelector('.nav-items');

    burgerIcon.addEventListener('click', function () {
        navItems.classList.toggle('show');
    });

    setupCart();
    fetchProducts();
    bindFormSubmit();
    bindFilterEvents();
    handleResize();
    setPromotion();
});

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
                const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : price;
                const discount = product.discount ? parseFloat(product.discount) : 0;
                const saleEndTime = product.saleEndTime ? new Date(product.saleEndTime) : null;
                let discountedPrice = price;

                if (saleEndTime && saleEndTime > new Date() && discount > 0) {
                    discountedPrice = (originalPrice - (originalPrice * discount / 100)).toFixed(2);
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
                    <p>
                        Cena: 
                        ${discount > 0 && saleEndTime && saleEndTime > new Date() 
                            ? `<span class="original-price">${originalPrice.toFixed(2)} zł</span> <span class="discounted-price">${discountedPrice} zł</span>` 
                            : `${price.toFixed(2)} zł`}
                    </p>
                    <p>${description}</p>
                    ${saleEndTime ? `<p>Promocja kończy się za: <span class="countdown" data-end-time="${saleEndTime}" data-original-price="${originalPrice.toFixed(2)}"></span></p>` : ''}
                    <div class="button-container">
                        <button class="add-to-cart" data-id="${product.id}">Dodaj do koszyka</button>
                        <button class="edit-product" data-id="${product.id}">Edytuj</button>
                        <button class="delete-product" data-id="${product.id}">Usuń</button>
                    </div>
                `;
                productsContainer.appendChild(productDiv);
            });

            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function () {
                    const productId = this.getAttribute('data-id');
                    addToCart(productId);
                });
            });

            document.querySelectorAll('.edit-product').forEach(button => {
                button.addEventListener('click', function () {
                    const productId = this.getAttribute('data-id');
                    populateEditForm(productId);
                });
            });

            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', function () {
                    const productId = this.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });

            updateCountdowns();
        });
}

function populateEditForm(productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const form = document.getElementById('edit-product-form');
            form['productId'].value = product.id;
            form['saleDuration'].value = product.saleDuration || '';
            form['productDiscount'].value = product.discount || '';
            form.style.display = 'block';
        });
}

function updateProduct(event) {
    event.preventDefault();
    const form = document.getElementById('edit-product-form');
    const productId = form['productId'].value;
    const saleDuration = parseInt(form['saleDuration'].value, 10);
    const discount = parseFloat(form['productDiscount'].value);

    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            if (saleDuration > 0 && discount > 0) {
                const saleEndTime = new Date();
                saleEndTime.setMinutes(saleEndTime.getMinutes() + saleDuration);
                product.saleEndTime = saleEndTime.toISOString();
                product.discount = discount;
                product.originalPrice = product.originalPrice || product.price;
                product.price = (product.originalPrice - (product.originalPrice * discount / 100)).toFixed(2);
                product.isOnPromotion = true;
            } else {
                delete product.saleEndTime;
                delete product.discount;
                delete product.originalPrice;
                product.isOnPromotion = false;
            }

            return fetch(`http://localhost:3000/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });
        })
        .then(() => {
            form.style.display = 'none';
            fetchProducts();
        });
}

function addToCart(productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id === product.id);

            // Oblicz rzeczywistą cenę produktu
            const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : parseFloat(product.price);
            const discount = product.discount ? parseFloat(product.discount) : 0;
            const saleEndTime = product.saleEndTime ? new Date(product.saleEndTime) : null;
            let actualPrice = originalPrice;

            if (saleEndTime && saleEndTime > new Date() && discount > 0) {
                actualPrice = (originalPrice - (originalPrice * discount / 100)).toFixed(2);
            }

            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                product.quantity = 1;
                product.actualPrice = actualPrice; // Dodaj rzeczywistą cenę produktu do koszyka
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });
}


function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = '';

    cart.forEach((product, index) => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="Obrazek produktu">
            <p>${product.name}</p>
            <p>${parseFloat(product.actualPrice).toFixed(2)} zł</p>
            <p>Ilość: ${product.quantity}</p>
            <button onclick="removeFromCart(${index})">Usuń</button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });
}


function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function clearCart() {
    localStorage.removeItem('cart');
    renderCart();
}

function setupCart() {
    renderCart();
}

function toggleCart() {
    const cartSection = document.querySelector('.cart-section');
    cartSection.style.display = cartSection.style.display === 'none' ? 'block' : 'none';
}

function clearFilters() {
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(cb => cb.checked = false);
    fetchProducts();
}

function validateForm() {
    const form = document.getElementById('add-product-form');
    const name = form['productName'].value;
    const price = form['productPrice'].value;
    const description = form['productDescription'].value;

    if (!/^[A-Z]/.test(name)) {
        alert('Nazwa produktu musi zaczynać się od dużej litery.');
        return false;
    }

    if (description.length < 15) {
        alert('Opis produktu musi zawierać co najmniej 15 znaków.');
        return false;
    }

    if (!/^[A-Z]/.test(description)) {
        alert('Opis produktu musi zaczynać się od dużej litery.');
        return false;
    }

    return true;
}

function bindFormSubmit() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = new FormData(form);
        const productData = {
            brand: formData.get('productBrand'),
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
            if (response.ok) {
                fetchProducts();
            }
        });

        form.reset();
    });

    const editForm = document.getElementById('edit-product-form');
    editForm.addEventListener('submit', updateProduct);
}

function deleteProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            fetchProducts();
        } else {
            alert('Nie udało się usunąć produktu.');
        }
    });
}

function bindFilterEvents() {
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', fetchProducts);
    });
}

function toggleMenu() {
    const navItems = document.querySelector('.nav-items');
    navItems.style.display = navItems.style.display === 'flex' ? 'none' : 'flex';
}

function handleResize() {
    const navItems = document.querySelector('.nav-items');
    navItems.style.display = window.innerWidth >= 768 ? 'flex' : 'none';
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
