document.addEventListener('DOMContentLoaded', function () {
    fetchPromotionalProducts();
    setInterval(fetchPromotionalProducts, 60000); 
});

function fetchPromotionalProducts() {
    const productsContainer = document.querySelector('.products-container.promotions');

    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            productsContainer.innerHTML = '';

            const promotionalProducts = products.filter(product => {
                const saleEndTime = new Date(product.saleEndTime);
                return product.saleEndTime && saleEndTime > new Date();
            });

            if (promotionalProducts.length === 0) {
                const noProductsMessage = document.createElement('div');
                noProductsMessage.className = 'no-products-message';
                noProductsMessage.textContent = 'Aktualnie brak produktów na promocji';
                productsContainer.appendChild(noProductsMessage);
            } else {
                promotionalProducts.forEach(product => {
                    const name = product.name || 'Nieznany produkt';
                    const price = product.price || 0;
                    const description = product.description || 'Brak opisu';
                    const imageUrl = product.imageUrl || 'placeholder.png';
                    const saleEndTime = new Date(product.saleEndTime);

                    const productDiv = document.createElement('div');
                    productDiv.className = 'product';
                    productDiv.innerHTML = `
                        <div class="product-image-container">
                            <img src="${imageUrl}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">
                        </div>
                        <h3>${name}</h3>
                        <p>Cena: ${price} zł</p>
                        <p>${description}</p>
                        <p>Promocja kończy się za: <span class="countdown" data-end-time="${saleEndTime}"></span></p>
                        <div class="button-container">
                            <button class="edit-product" data-id="${product.id}">Edytuj</button>
                            <button class="delete-product" data-id="${product.id}">Usuń</button>
                        </div>
                    `;
                    productsContainer.appendChild(productDiv);
                });
            }

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

function updateCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown');

    countdownElements.forEach(element => {
        const endTime = new Date(element.dataset.endTime);
        const interval = setInterval(() => {
            const now = new Date();
            const timeRemaining = endTime - now;

            if (timeRemaining <= 0) {
                clearInterval(interval);
                element.textContent = 'Promocja zakończona';
                element.closest('.product').remove();
                checkNoPromotions();
            } else {
                const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
                const seconds = Math.floor((timeRemaining / 1000) % 60);

                element.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
    });
}

function checkNoPromotions() {
    const productsContainer = document.querySelector('.products-container.promotions');
    if (productsContainer.children.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'Aktualnie brak produktów na promocji';
        productsContainer.appendChild(noProductsMessage);
    }
}

function editProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const form = document.getElementById('edit-product-form');
            form.querySelector('input[name="productId"]').value = product.id;
            form.querySelector('input[name="saleDuration"]').value = product.saleDuration || '';
        });
}

function deleteProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            fetchPromotionalProducts();
        } else {
            alert('Nie udało się usunąć produktu.');
        }
    });
}
