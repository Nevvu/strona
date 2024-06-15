document.addEventListener('DOMContentLoaded', function () {
	const burgerIcon = document.querySelector('.search-form');
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

function bindFormSubmit() {
	document
		.getElementById('add-product-form')
		.addEventListener('submit', function (event) {
			event.preventDefault();
			const productName = document.querySelector('.product-name').value;
			const productPrice = document.querySelector('.product-price').value;
			const productDescription = document.getElementById(
				'product-description'
			).value;

			const productElement = document.createElement('div');
			productElement.className = 'product';
			productElement.innerHTML = `
            <h3>${productName}</h3>
            <p>Cena: ${productPrice}</p>
            <p>${productDescription}</p>
        `;

			document.querySelector('.products-container').appendChild(productElement);

			fetch('http://localhost:3000/products', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: productName,
					price: productPrice,
					description: productDescription,
				}),
			}).then(() => {
				fetchProducts(); // Reload products after adding
			});

			// Clear form fields
			document.querySelector('.product-name').value = '';
			document.querySelector('.product-price').value = '';
			document.getElementById('product-description').value = '';
		});
}

function fetchProducts() {
	const productsContainer = document.querySelector('.products-container');

	fetch('http://localhost:3000/products')
		.then((response) => response.json())
		.then((products) => {
			productsContainer.innerHTML = '';
			products.forEach((product) => {
				productsContainer.innerHTML += `
                    <div class="product">
                        <h3>${product.name}</h3>
                        <p>${product.price} zł</p>
                        <p>${product.description}</p>
                    </div>
                `;
			});
		});
}

document.addEventListener('DOMContentLoaded', function () {
    const burgerIcon = document.querySelector('.burger-icon');
    const navItems = document.querySelector('.nav-items');

    burgerIcon.addEventListener('click', function () {
        navItems.classList.toggle('show'); // Przełączanie klasy 'show'
    });
});
