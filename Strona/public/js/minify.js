function fetchProducts(){const e=document.querySelector(".products-container"),t=Array.from(document.querySelectorAll('.filter-section input[type="checkbox"]:checked')).map((e=>e.value));fetch("http://localhost:3000/products").then((e=>e.json())).then((n=>{e.innerHTML="";n.filter((e=>0===t.length||t.includes(e.brand))).forEach((t=>{const n=t.name||"Nieznany produkt",o=parseFloat(t.price)||0,r=t.originalPrice?parseFloat(t.originalPrice):o,c=t.discount?parseFloat(t.discount):0,a=t.saleEndTime?new Date(t.saleEndTime):null;let i=o;a&&a>new Date&&c>0&&(i=(r-r*c/100).toFixed(2));const d=t.description||"Brak opisu",l=t.imageUrl||"placeholder.png",s=(t.brand,document.createElement("div"));s.className="product",s.innerHTML=`\n                    <div class="product-image-container">\n                        <img src="${l}" alt="Obrazek produktu" onerror="this.onerror=null; this.src='placeholder.png';">\n                    </div>\n                    <h3>${n}</h3>\n                    <p>\n                        Cena: \n                        ${c>0&&a&&a>new Date?`<span class="original-price">${r.toFixed(2)} zł</span> <span class="discounted-price">${i} zł</span>`:`${o.toFixed(2)} zł`}\n                    </p>\n                    <p>${d}</p>\n                    ${a?`<p>Promocja kończy się za: <span class="countdown" data-end-time="${a}" data-original-price="${r.toFixed(2)}"></span></p>`:""}\n                    <div class="button-container">\n                        <button class="add-to-cart" data-id="${t.id}">Dodaj do koszyka</button>\n                        <button class="edit-product" data-id="${t.id}">Edytuj</button>\n                        <button class="delete-product" data-id="${t.id}">Usuń</button>\n                    </div>\n                `,e.appendChild(s)})),document.querySelectorAll(".add-to-cart").forEach((e=>{e.addEventListener("click",(function(){addToCart(this.getAttribute("data-id"))}))})),document.querySelectorAll(".edit-product").forEach((e=>{e.addEventListener("click",(function(){populateEditForm(this.getAttribute("data-id"))}))})),document.querySelectorAll(".delete-product").forEach((e=>{e.addEventListener("click",(function(){deleteProduct(this.getAttribute("data-id"))}))})),updateCountdowns()}))}function populateEditForm(e){fetch(`http://localhost:3000/products/${e}`).then((e=>e.json())).then((e=>{const t=document.getElementById("edit-product-form");t.productId.value=e.id,t.saleDuration.value=e.saleDuration||"",t.productDiscount.value=e.discount||"",t.style.display="block"}))}function updateProduct(e){e.preventDefault();const t=document.getElementById("edit-product-form"),n=t.productId.value,o=parseInt(t.saleDuration.value,10),r=parseFloat(t.productDiscount.value);fetch(`http://localhost:3000/products/${n}`).then((e=>e.json())).then((e=>{if(o>0&&r>0){const t=new Date;t.setMinutes(t.getMinutes()+o),e.saleEndTime=t.toISOString(),e.discount=r,e.originalPrice=e.originalPrice||e.price,e.price=(e.originalPrice-e.originalPrice*r/100).toFixed(2),e.isOnPromotion=!0}else delete e.saleEndTime,delete e.discount,delete e.originalPrice,e.isOnPromotion=!1;return fetch(`http://localhost:3000/products/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})})).then((()=>{t.style.display="none",fetchProducts()}))}function addToCart(e){fetch(`http://localhost:3000/products/${e}`).then((e=>e.json())).then((e=>{let t=JSON.parse(localStorage.getItem("cart"))||[];const n=t.findIndex((t=>t.id===e.id)),o=e.originalPrice?parseFloat(e.originalPrice):parseFloat(e.price),r=e.discount?parseFloat(e.discount):0,c=e.saleEndTime?new Date(e.saleEndTime):null;let a=o;c&&c>new Date&&r>0&&(a=(o-o*r/100).toFixed(2)),-1!==n?t[n].quantity+=1:(e.quantity=1,e.actualPrice=a,t.push(e)),localStorage.setItem("cart",JSON.stringify(t)),renderCart()}))}function renderCart(){const e=document.querySelector(".cart-items"),t=JSON.parse(localStorage.getItem("cart"))||[];e.innerHTML="",t.forEach(((t,n)=>{const o=document.createElement("div");o.className="cart-item",o.innerHTML=`\n            <img src="${t.imageUrl}" alt="Obrazek produktu">\n            <p>${t.name}</p>\n            <p>${parseFloat(t.actualPrice).toFixed(2)} zł</p>\n            <p>Ilość: ${t.quantity}</p>\n            <button onclick="removeFromCart(${n})">Usuń</button>\n        `,e.appendChild(o)}))}function removeFromCart(e){let t=JSON.parse(localStorage.getItem("cart"))||[];t.splice(e,1),localStorage.setItem("cart",JSON.stringify(t)),renderCart()}function clearCart(){localStorage.removeItem("cart"),renderCart()}function setupCart(){renderCart()}function toggleCart(){const e=document.querySelector(".cart-section");e.style.display="none"===e.style.display?"block":"none"}function clearFilters(){document.querySelectorAll('.filter-section input[type="checkbox"]').forEach((e=>e.checked=!1)),fetchProducts()}function validateForm(){const e=document.getElementById("add-product-form"),t=e.productName.value,n=(e.productPrice.value,e.productDescription.value);return/^[A-Z]/.test(t)?n.length<15?(alert("Opis produktu musi zawierać co najmniej 15 znaków."),!1):!!/^[A-Z]/.test(n)||(alert("Opis produktu musi zaczynać się od dużej litery."),!1):(alert("Nazwa produktu musi zaczynać się od dużej litery."),!1)}function bindFormSubmit(){const e=document.getElementById("add-product-form");e.addEventListener("submit",(function(t){if(t.preventDefault(),!validateForm())return;const n=new FormData(e),o={brand:n.get("productBrand"),name:n.get("productName"),price:parseFloat(n.get("productPrice")),description:n.get("productDescription"),imageUrl:n.get("productImage")?URL.createObjectURL(n.get("productImage")):"placeholder.png"};fetch("http://localhost:3000/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).then((e=>{e.ok&&fetchProducts()})),e.reset()}));document.getElementById("edit-product-form").addEventListener("submit",updateProduct)}function deleteProduct(e){fetch(`http://localhost:3000/products/${e}`,{method:"DELETE",headers:{"Content-Type":"application/json"}}).then((e=>{e.ok?fetchProducts():alert("Nie udało się usunąć produktu.")}))}function bindFilterEvents(){document.querySelectorAll('.filter-section input[type="checkbox"]').forEach((e=>{e.addEventListener("change",fetchProducts)}))}function toggleMenu(){const e=document.querySelector(".nav-items");e.style.display="flex"===e.style.display?"none":"flex"}function handleResize(){document.querySelector(".nav-items").style.display=window.innerWidth>=768?"flex":"none"}function toggleFilters(){document.querySelector(".filter-section").classList.toggle("active")}function updateCountdowns(){document.querySelectorAll(".countdown").forEach((e=>{const t=new Date(e.dataset.endTime),n=e.dataset.originalPrice,o=setInterval((()=>{const r=new Date,c=t-r;if(c<=0){clearInterval(o),e.textContent="Promocja zakończona";const t=e.closest(".product"),r=t.querySelector(".discounted-price");if(r){r.textContent=`${n} zł`,r.classList.remove("discounted-price");const e=t.querySelector(".original-price");e&&e.remove()}e.closest(".countdown-container").remove()}else{const t=Math.floor(c/36e5%24),n=Math.floor(c/6e4%60),o=Math.floor(c/1e3%60);e.textContent=`${t}h ${n}m ${o}s`}}),1e3)}))}document.addEventListener("DOMContentLoaded",(function(){const e=document.querySelector(".burger-icon"),t=document.querySelector(".nav-items");e.addEventListener("click",(function(){t.classList.toggle("show")})),setupCart(),fetchProducts(),bindFormSubmit(),bindFilterEvents(),handleResize(),setPromotion()})),window.addEventListener("resize",handleResize),window.addEventListener("load",handleResize);