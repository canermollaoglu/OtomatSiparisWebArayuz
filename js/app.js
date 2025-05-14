document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const pizzaCards = document.querySelectorAll('.pizza-card');
  const backButton = document.getElementById('backButton');
  const pizzaSelection = document.getElementById('pizzaSelection');
  const pizzaDetail = document.getElementById('pizzaDetail');
  const pizzaNameEl = document.getElementById('pizzaName');
  const pizzaImageEl = document.getElementById('pizzaImage');
  const pizzaDescriptionEl = document.getElementById('pizzaDescription');
  const pizzaPriceEl = document.getElementById('pizzaPrice');
  const quantityEl = document.getElementById('quantity');
  const decreaseBtn = document.getElementById('decreaseQuantity');
  const increaseBtn = document.getElementById('increaseQuantity');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const cartIcon = document.getElementById('cartIcon');
  const cart = document.getElementById('cart');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  // Create countdown modal and overlay
  const countdownOverlay = document.createElement('div');
  countdownOverlay.className = 'countdown-overlay';

  const countdownModal = document.createElement('div');
  countdownModal.className = 'countdown-modal';
  countdownModal.innerHTML = `
    <h3 class="countdown-title">Ödeme yapmak için kalan süre:</h3>
    <div class="pizza-timer">
      <div class="countdown-timer">50</div>
    </div>
    <button class="countdown-close">Kapat</button>
  `;

  document.body.appendChild(countdownOverlay);
  document.body.appendChild(countdownModal);

  const countdownTimer = countdownModal.querySelector('.countdown-timer');
  const closeCountdownBtn = countdownModal.querySelector('.countdown-close');
  
  // State
  let currentPizza = null;
  let quantity = 1;
  let cartData = [];
  let countdownInterval = null;
  
  // Initialize the app
  function init() {
    // Add event listeners to pizza cards
    pizzaCards.forEach(card => {
      card.addEventListener('click', () => {
        const pizzaId = parseInt(card.getAttribute('data-id'));
        showPizzaDetail(pizzaId);
      });
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      pizzaDetail.classList.remove('active');
      pizzaSelection.classList.add('active');
      resetQuantity();
      window.scrollTo(0, 0);
    });
    
    // Quantity buttons
    decreaseBtn.addEventListener('click', decreaseQuantity);
    increaseBtn.addEventListener('click', increaseQuantity);
    
    // Add to cart
    addToCartBtn.addEventListener('click', addToCart);
    
    // Cart interactions
    cartIcon.addEventListener('click', () => toggleCart(true));
    
    // Checkout
    checkoutBtn.addEventListener('click', startCheckout);
    
    // Close countdown modal
    closeCountdownBtn.addEventListener('click', () => {
      countdownModal.classList.remove('active');
      countdownOverlay.classList.remove('active');
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });
    
    // Initialize the cart from localStorage if available
    loadCart();
    updateCartUI();

    // Handle browser back button
    window.addEventListener('popstate', handlePopState);
  }
  
  // Show pizza detail
  function showPizzaDetail(pizzaId) {
    currentPizza = pizzas.find(pizza => pizza.id === pizzaId);
    
    if (currentPizza) {
      pizzaNameEl.textContent = currentPizza.name;
      pizzaImageEl.src = currentPizza.image;
      pizzaImageEl.alt = currentPizza.name;
      pizzaDescriptionEl.textContent = currentPizza.description;
      pizzaPriceEl.textContent = `${currentPizza.price.toFixed(2)} TL`;
      
      pizzaSelection.classList.remove('active');
      pizzaDetail.classList.add('active');
      
      resetQuantity();
      window.scrollTo(0, 0);
      window.history.pushState({ pizzaId }, '', `#pizza-${pizzaId}`);
    }
  }

  // Handle browser back/forward
  function handlePopState(event) {
    if (event.state && event.state.pizzaId) {
      showPizzaDetail(event.state.pizzaId);
    } else {
      pizzaDetail.classList.remove('active');
      pizzaSelection.classList.add('active');
      resetQuantity();
      window.scrollTo(0, 0);
    }
  }
  
  // Quantity functions
  function decreaseQuantity() {
    if (quantity > 1) {
      quantity--;
      updateQuantityUI();
    }
  }
  
  function increaseQuantity() {
    quantity++;
    updateQuantityUI();
  }
  
  function updateQuantityUI() {
    quantityEl.textContent = quantity;
  }
  
  function resetQuantity() {
    quantity = 1;
    updateQuantityUI();
  }
  
  // Add to cart
  function addToCart() {
    if (!currentPizza) return;
    
    const existingItemIndex = cartData.findIndex(item => item.id === currentPizza.id);
    
    if (existingItemIndex !== -1) {
      cartData[existingItemIndex].quantity += quantity;
    } else {
      cartData.push({
        id: currentPizza.id,
        name: currentPizza.name,
        price: currentPizza.price,
        image: currentPizza.image,
        quantity: quantity
      });
    }
    
    saveCart();
    updateCartUI();
    toggleCart(true);
    resetQuantity();
    animateCartCount();
  }
  
  // Toggle cart visibility
  function toggleCart(forceOpen = false) {
    if (!forceOpen && cart.classList.contains('active')) {
      cart.classList.remove('active');
    } else {
      cart.classList.add('active');
    }
  }
  
  // Start checkout process
  function startCheckout() {
    if (cartData.length === 0) return;
    
    let timeLeft = 50;
    countdownTimer.textContent = timeLeft;
    countdownModal.classList.add('active');
    countdownOverlay.classList.add('active');
    
    countdownInterval = setInterval(() => {
      timeLeft--;
      countdownTimer.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        completeCheckout();
      }
    }, 1000);
  }
  
  // Complete checkout
  function completeCheckout() {
    countdownModal.classList.remove('active');
    countdownOverlay.classList.remove('active');
    cartData = [];
    saveCart();
    updateCartUI();
    cart.classList.remove('active');
    
    if (pizzaDetail.classList.contains('active')) {
      pizzaDetail.classList.remove('active');
      pizzaSelection.classList.add('active');
    }
    
    alert('Siparişiniz için teşekkürler!');
  }
  
  // Update cart UI
  function updateCartUI() {
    const totalItems = cartData.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cartData.length === 0) {
      emptyCartMessage.style.display = 'flex';
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
    } else {
      emptyCartMessage.style.display = 'none';
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = '1';
    }
    
    const cartItemElements = cartItems.querySelectorAll('.cart-item');
    cartItemElements.forEach(item => item.remove());
    
    cartData.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <p class="cart-item-price">${item.price.toFixed(2)} TL</p>
          <p class="cart-item-quantity">Adet: ${item.quantity}</p>
        </div>
        <button class="remove-item" data-id="${item.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
        </button>
      `;
      
      cartItems.insertBefore(cartItem, emptyCartMessage);
      
      const removeBtn = cartItem.querySelector('.remove-item');
      removeBtn.addEventListener('click', () => removeFromCart(item.id));
    });
    
    const total = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toFixed(2)} TL`;
  }
  
  // Remove item from cart
  function removeFromCart(itemId) {
    cartData = cartData.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    
    // Close cart if empty
    if (cartData.length === 0) {
      cart.classList.remove('active');
    }
  }
  
  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('pizzaCart', JSON.stringify(cartData));
  }
  
  // Load cart from localStorage
  function loadCart() {
    const savedCart = localStorage.getItem('pizzaCart');
    if (savedCart) {
      cartData = JSON.parse(savedCart);
    }
  }
  
  // Animate cart count
  function animateCartCount() {
    cartCount.classList.add('updated');
    setTimeout(() => {
      cartCount.classList.remove('updated');
    }, 500);
  }
  
  // Check URL hash on page load
  function checkInitialHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#pizza-')) {
      const pizzaId = parseInt(hash.replace('#pizza-', ''));
      if (!isNaN(pizzaId)) {
        showPizzaDetail(pizzaId);
      }
    }
  }

  // Initialize the app
  init();
  checkInitialHash();
});