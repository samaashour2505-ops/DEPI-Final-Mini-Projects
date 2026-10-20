const heroVideo = document.querySelector(".hero-video");

if (heroVideo) {
  const playVideo = () => {
    heroVideo.play().catch(() => {});
  };

  if (document.readyState === "complete") {
    playVideo();
  } else {
    window.addEventListener("load", playVideo, { once: true });
  }

  heroVideo.addEventListener("error", () => {
    heroVideo.style.display = "none";
  });
}

const heroContent = document.querySelector(".hero-content");
let isScrolling = false;

window.addEventListener("scroll", () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      let scrollY = window.scrollY;
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroContent.style.opacity = Math.max(0, 1 - scrollY / 600);
      }
      isScrolling = false;
    });
    isScrolling = true;
  }
});

window.addEventListener(
  "click",
  () => {
    const openingSound = new Audio("./Images/imgs_audio.mp3");
    openingSound.play().then(() => {
      setTimeout(() => {
        openingSound.pause();
        openingSound.currentTime = 0;
      }, 7000);
    });
  },
  { once: true },
);

document.addEventListener("DOMContentLoaded", () => {
  let cart = [];
  let favorites = [];

  const cartIcon =
    document.querySelector(".fa-cart-shopping")?.closest("a") ||
    document.querySelector(".fa-cart-shopping");
  const addButtons = document.querySelectorAll(".add-btn, .add-to-cart-btn");
  const favoriteButtons = document.querySelectorAll(".favorite-btn, .fav-btn");
  const orderForm =
    document.getElementById("orderForm") ||
    document.querySelector(".order-form");
  const dishSelect =
    document.getElementById("dishSelect") ||
    document.getElementById("selectDish") ||
    document.querySelectorAll(".order-form select")[1];
  const qtyValSpan =
    document.getElementById("qtyVal") || document.getElementById("qtyNumber");
  const decreaseQtyBtn = document.getElementById("decreaseQty");
  const increaseQtyBtn = document.getElementById("increaseQty");
  const orderModal = document.getElementById("orderModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalCustomerName = document.getElementById("modalCustomerName");
  const modalCustomerPhone = document.getElementById("modalCustomerPhone");
  const modalCustomerChef = document.getElementById("modalCustomerChef");
  const modalItemsList = document.getElementById("modalItemsList");
  const modalGrandTotal = document.getElementById("modalGrandTotal");

  let currentQty = 1;
  if (increaseQtyBtn && decreaseQtyBtn) {
    increaseQtyBtn.addEventListener("click", () => {
      currentQty++;
      if (qtyValSpan) qtyValSpan.textContent = currentQty;
    });

    decreaseQtyBtn.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        if (qtyValSpan) qtyValSpan.textContent = currentQty;
      }
    });
  }

  favoriteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("active");

      const icon = btn.querySelector("i");
      const card = btn.closest(".dish-card");
      const dishName = card
        ? card.querySelector(".dish-title, .dish-name").textContent.trim()
        : "";

      if (btn.classList.contains("active")) {
        if (icon) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
        }
        btn.style.color = "#ff4757";
        if (dishName && !favorites.includes(dishName)) {
          favorites.push(dishName);
        }
      } else {
        if (icon) {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
        btn.style.color = "";
        favorites = favorites.filter((name) => name !== dishName);
      }
    });
  });

  addButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".dish-card");
      const dishName = card
        .querySelector(".dish-title, .dish-name")
        .textContent.trim();
      const dishPrice = card.querySelector(".dish-price").textContent.trim();

      if (dishSelect) {
        for (let option of dishSelect.options) {
          if (option.text.toLowerCase().includes(dishName.toLowerCase())) {
            option.selected = true;
            break;
          }
        }
      }

      const existingItem = cart.find((item) => item.name === dishName);
      if (existingItem) {
        existingItem.qty += currentQty;
      } else {
        cart.push({
          name: dishName,
          price: dishPrice,
          qty: currentQty,
        });
      }

      updateCartBadge();

      currentQty = 1;
      if (qtyValSpan) qtyValSpan.textContent = currentQty;
    });
  });

  function updateCartBadge() {
    let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById("cartBadge");

    if (!badge && cartIcon) {
      badge = document.createElement("span");
      badge.id = "cartBadge";
      badge.style.cssText =
        "background: #f2a93b; color: #0b1320; border-radius: 50%; padding: 2px 6px; font-size: 10px; font-weight: bold; position: absolute; top: -5px; right: -8px;";
      cartIcon.style.position = "relative";
      cartIcon.appendChild(badge);
    }

    if (badge) {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? "inline-block" : "none";
    }
  }

  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert(" the cart is empty now 🛒");
      } else {
        let msg = " the content 🛒 \n\n";
        let total = 0;

        cart.forEach((item, index) => {
          let numPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
          let itemTotal = numPrice * item.qty;
          total += itemTotal;

          let isFav = favorites.includes(item.name) ? " ❤️ [مفضل]" : "";

          msg += `${index + 1}. ${item.name}${isFav}\n   الكمية: ${item.qty} | السعر: $${itemTotal.toFixed(2)}\n\n`;
        });

        msg += `-------------------\nالإجمالي الكلي: $${total.toFixed(2)}`;
        alert(msg);
      }
    });
  }

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = orderForm.querySelector(
        'input[placeholder="Your name"]',
      );
      const phoneInput = orderForm.querySelector(
        'input[placeholder="Your phone number"]',
      );
      const chefSelect = orderForm.querySelector("select");

      if (cart.length === 0 && dishSelect && dishSelect.value) {
        cart.push({
          name: dishSelect.value,
          price: "$12.00",
          qty: currentQty,
        });
      }

      if (cart.length === 0) {
        alert("Please add at least one dish to your order.");
        return;
      }

      if (modalCustomerName)
        modalCustomerName.textContent = nameInput ? nameInput.value : "Guest";
      if (modalCustomerPhone)
        modalCustomerPhone.textContent = phoneInput ? phoneInput.value : "N/A";
      if (modalCustomerChef)
        modalCustomerChef.textContent = chefSelect
          ? chefSelect.value || "Default Chef"
          : "Default Chef";
      if (modalItemsList) {
        modalItemsList.innerHTML = "";
        let grandTotal = 0;

        cart.forEach((item) => {
          let numPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
          let itemTotal = numPrice * item.qty;
          grandTotal += itemTotal;

          const row = document.createElement("div");
          row.className = "modal-item-row";
          row.innerHTML = `
                        <span>${item.name} x${item.qty}</span>
                        <span>$${itemTotal.toFixed(2)}</span>
                    `;
          modalItemsList.appendChild(row);
        });

        if (modalGrandTotal)
          modalGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
      }

      if (orderModal) orderModal.classList.add("active");
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      if (orderModal) orderModal.classList.remove("active");
      orderForm.reset();
      cart = [];
      updateCartBadge();
      currentQty = 1;
      if (qtyValSpan) qtyValSpan.textContent = currentQty;
    });
  }

  const filterTabs = document.querySelectorAll(".filter-tabs .tab-btn");
  const dishCards = document.querySelectorAll(".dishes-grid .dish-card");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const filterValue =
        tab.getAttribute("data-filter") || tab.textContent.trim().toLowerCase();

      dishCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category") || "";

        if (
          filterValue === "all" ||
          tab.textContent.trim().toLowerCase() === "all"
        ) {
          card.style.display = "flex";
        } else if (cardCategory === filterValue) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  const searchInput =
    document.getElementById("searchInput") ||
    document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      dishCards.forEach((card) => {
        const title = card
          .querySelector(".dish-title, .dish-name")
          .textContent.toLowerCase();
        card.style.display = title.includes(query) ? "flex" : "none";
      });
    });
  }
});
