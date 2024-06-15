document.addEventListener('DOMContentLoaded', function () {
	// Selectors
	const burgerIcon = document.querySelector('.burger-icon');
	const navItems = document.querySelector('.nav-items');

	// Toggle navigation items
	burgerIcon.addEventListener('click', function () {
		navItems.classList.toggle('show');
	});

	// Fetch products and bind form submission
	fetchProducts();
	bindFormSubmit();
});

function clearFilters() {
	document
		.querySelectorAll('.filter-section input[type="checkbox"]')
		.forEach((cb) => (cb.checked = false));
}

function bindFormSubmit() {
	const form = document.getElementById('add-product-form');
	form.addEventListener('submit', function (event) {
		event.preventDefault();

		const productName = document.querySelector('.product-name').value;
		const productPrice = document.querySelector('.product-price').value;
		const productDescription = document.querySelector(
			'.product-description'
		).value;

		const productElement = document.createElement('div');
		productElement.className = 'product';
		productElement.innerHTML = `
            <h3>${productName}</h3>
            <p>Cena: ${productPrice} zł</p>
            <p>${productDescription}</p>
        `;

		document.querySelector('.products-container').appendChild(productElement);

		fetch('http://localhost:3000/products', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: productName,
				price: productPrice,
				description: productDescription,
			}),
		}).then(() => {
			fetchProducts(); // Reload products after adding
		});

		// Clear form fields
		form.reset();
	});
}

function fetchProducts() {
	const productsContainer = document.querySelector('.products-container');

	fetch('http://localhost:3000/products')
		.then((response) => response.json())
		.then((products) => {
			productsContainer.innerHTML = '';
			products.forEach((product) => {
				const productDiv = document.createElement('div');
				productDiv.className = 'product';
				productDiv.innerHTML = `
                    <img src="${
											product.imageUrl || 'placeholder.png'
										}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">
                    <div>
                        <h3>${product.name}</h3>
                        <p>Cena: ${product.price} zł</p>
                        <p>${product.description}</p>
                    </div>
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

		fetch('http://localhost:3000/products', {
			method: 'POST',
			body: formData, // Używamy FormData, które zawiera obrazek i inne dane
		}).then(() => {
			fetchProducts(); // Przeładowanie produktów po dodaniu
		});

		form.reset(); // Czyszczenie pól formularza
	});
}

function fetchProducts() {
	const productsContainer = document.querySelector('.products-container');

	fetch('http://localhost:3000/products')
		.then((response) => response.json())
		.then((products) => {
			productsContainer.innerHTML = '';
			products.forEach((product) => {
				const productDiv = document.createElement('div');
				productDiv.className = 'product';
				productDiv.innerHTML = `
                    <img src="${product.imageUrl}" alt="Obrazek produktu">
                    <div>
                        <h3>${product.name}</h3>
                        <p>Cena: ${product.price} zł</p>
                        <p>${product.description}</p>
                    </div>
                `;
				productsContainer.appendChild(productDiv);
			});
		});
}
const express = require('express');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Konfiguracja Multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Upewnij się, że folder 'uploads' istnieje
	},
	filename: function (req, file, cb) {
		cb(
			null,
			file.fieldname +
				'-' +
				Date.now() +
				'.' +
				file.originalname.split('.').pop()
		);
	},
});

const upload = multer({ storage: storage });

// Obsługa przesyłania plików
app.post('/upload', upload.single('productImage'), (req, res) => {
	const file = req.file;
	if (!file) {
		return res.status(400).send('No file uploaded.');
	}
	res.send({
		message: 'File uploaded successfully.',
		fileUrl: `/uploads/${file.filename}`,
	});
});

// Uruchomienie serwera
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}/`);
});
document
	.getElementById('add-product-form')
	.addEventListener('submit', function (event) {
		event.preventDefault();
		const formData = new FormData(this);
		fetch('http://localhost:3000/upload', {
			method: 'POST',
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => console.log(data))
			.catch((error) => console.error('Error:', error));
	});
