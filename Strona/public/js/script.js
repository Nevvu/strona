//setPromotion();

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
    //setPromotion();
    //setInterval(setPromotion, 3000);
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
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.imageUrl || 'placeholder.png'}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">
                    <h3>${product.name}</h3>
                    <p>Cena: <span class="${product.isOnPromotion ? 'promotion-price' : ''}">${product.price.toFixed(2)} zł</span></p>
                    <p>${product.description}</p>
                    <button class="add-to-cart" data-id="${product.id}">Dodaj do koszyka</button>
                    <button class="delete-product" data-id="${product.id}">Usuń</button>
                `;
                productsContainer.appendChild(productDiv);
            });

            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    addToCart(productId);
                });
            });

            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });
        });
}

function addToCart(productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id === product.id);
            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1; // Zwiększ ilość, jeśli produkt już istnieje
            } else {
                product.quantity = 1; // Dodaj ilość, jeśli nowy produkt
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
            <p>${product.price} zł</p>
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
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    fetchProducts();
}

function validateForm() {
    const form = document.getElementById('add-product-form');
    const name = form['productName'].value;
    const price = form['productPrice'].value;
    const description = form['productDescription'].value;

    // Walidacja nazwy
    if (!/^[A-Z]/.test(name)) {
        alert('Nazwa produktu musi zaczynać się od dużej litery.');
        return false;
    }

    // Walidacja opisu
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
            return; // Jeśli walidacja nie powiodła się, nie wysyłaj formularza
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
            if(response.ok) {
                fetchProducts();
            }
        });

        form.reset();
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

// Funkcja do losowego wybierania produktów
function getRandomProducts(products, count) {
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Funkcja do ustawiania promocji na losowe produkty
let isPromotionRunning = false;
function setPromotion() {
    if (isPromotionRunning) return; // Jeśli promocja już się uruchamia, zakończ funkcję

    isPromotionRunning = true; // Ustaw flagę na czas trwania promocji

    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            // Usuwanie istniejących promocji
            products.forEach(product => {
                if (product.isOnPromotion) {
                    product.price = product.originalPrice;
                    delete product.isOnPromotion;
                    delete product.originalPrice;
                    fetch(`http://localhost:3000/products/${product.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(product)
                    });
                }
            });

            // Losowe produkty na promocję
            const productsOnPromotion = getRandomProducts(products, 5);
            productsOnPromotion.forEach(product => {
                product.isOnPromotion = true;
                product.originalPrice = product.price;
                product.price = product.price * (0.8 + Math.random() * 0.1); // Obniżenie ceny o 10-20%

                fetch(`http://localhost:3000/products/${product.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });
            });

            // Odświeżenie wyświetlanych produktów
            fetchProducts();
        })
        .finally(() => {
            isPromotionRunning = false; // Zwolnij blokadę po zakończeniu
        });
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);
