

function initializeNewPaymentMethods() {
    const paymentWidgets = document.querySelectorAll("#payment-settings .widget");

    paymentWidgets.forEach((widget) => {
        const title = widget.querySelector("h2").textContent.trim();
        const links = widget.querySelectorAll(".widget-content ul li a");

        if (title === "Paypal") {
            const paypalLink = links[0]?.getAttribute("href");
            if (paypalLink) {
                const paypalButton = document.getElementById("paypal-redirect-button");
                if (paypalButton) {
                    paypalButton.setAttribute("data-paypal-link", paypalLink);
                }
            }
        } else if (title === "EasyPaisa") {
            const form = document.getElementById("easypaisa-form");
            if (links.length >= 3 && form) {
                form.querySelector(".info-box:nth-of-type(1) p").textContent =
                    links[0].getAttribute("href");
                form.querySelector(".info-box:nth-of-type(2) p").textContent =
                    links[1].getAttribute("href");
                form.querySelector(".qr-code").src = links[2].getAttribute("href");
            }
        } else if (title === "Bank Transfer") {
            const form = document.getElementById("bank-form");
            if (links.length >= 4 && form) {
                form.querySelector(".info-box:nth-of-type(1) p").textContent =
                    links[0].getAttribute("href");
                form.querySelector(".info-box:nth-of-type(2) p").textContent =
                    links[1].getAttribute("href");
                form.querySelector(".info-box:nth-of-type(3) p").textContent =
                    links[2].getAttribute("href");
                form.querySelector(".info-box:nth-of-type(4) p").textContent =
                    links[3].getAttribute("href");
            }
        } else if (title === "UPI Transfer") {
            const upiDetailsContainer = document.getElementById(
                "upi-options-container-template"
            );
            if (upiDetailsContainer) {
                const upiOptionsContainer = document.createElement("div");
                upiOptionsContainer.className = "upi-options-container";

                links.forEach((link) => {
                    const name = link.textContent.trim();
                    const qrUrl = link.getAttribute("href");

                    const optionDiv = document.createElement("div");
                    optionDiv.className = "upi-payment-option";
                    optionDiv.innerHTML = `
                                <img src="${qrUrl}" alt="${name} UPI QR Code" class="qr-code">
                                <h3>${name}</h3>
                            `;
                    upiOptionsContainer.appendChild(optionDiv);
                });
                upiDetailsContainer.appendChild(upiOptionsContainer);
            }
        }
    });
}


let customerData = {};
let isProcessing = false;

function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateOrderId() {
    const orders = JSON.parse(localStorage.getItem("bloggerStoreOrders") || "[]");
    const orderCount = orders.length + 1;
    return `ORD-${1000 + orderCount}`;
}

function getCurrentCurrency() {
    const currencyDiv = document.querySelector("div.priceCurrency");
    if (currencyDiv && currencyDiv.textContent.trim() !== "") {
        return currencyDiv.textContent.trim();
    }
    return "Rs";
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatAddressForSheets(addr) {
    const parts = [
        addr.name,
        addr.address,
        `${addr.city}, ${addr.state} ${addr.zip}`,
        addr.country,
    ].filter(
        (part) => part && part.trim() !== "Not provided" && part.trim() !== ""
    );
    return parts.join(" \n ") || "Address not provided";
}

function formatAddressForDisplay(addr) {
    return `${addr.name}\n${addr.address}\n${addr.city}, ${addr.state} ${addr.zip}\n${addr.country}`;
}

const checkoutCart = {
    getCart: function () {
        try {
            const cart = localStorage.getItem("simpleCart");
            if (!cart || cart === "[]") return [];
            const parsedCart = JSON.parse(cart);
            return Array.isArray(parsedCart)
                ? parsedCart.map((item) => ({
                    id: item.id || "missing-id",
                    title: item.title || "Untitled Product",
                    image: item.image || "https://via.placeholder.com/80?text=No+Image",
                    currentPrice: item.currentPrice || "$0.00",
                    oldPrice: item.oldPrice || "",
                    variant: item.variant || {},
                    quantity: item.quantity || 1,
                    variantKey: item.variantKey || "",
                }))
                : [];
        } catch (e) {
            console.error("Error loading cart:", e);
            return [];
        }
    },
    getCurrency: function () {
        return getCurrentCurrency();
    },
    calculateTotals: function () {
        const cart = this.getCart();
        let subtotal = 0;
        cart.forEach((item) => {
            const priceStr = item.currentPrice.replace(/[^0-9.-]/g, "");
            const price = parseFloat(priceStr) || 0;
            subtotal += price * item.quantity;
        });
        const shipping = this.calculateShipping(subtotal);
        const total = subtotal + shipping;
        return { subtotal, shipping, total };
    },
    calculateShipping: function (subtotal) {
        if (subtotal === 0) return 0;
        return subtotal > 50 ? 0 : 5.99;
    },
    updateOrderSummary: function () {
        const cart = this.getCart();
        const currency = this.getCurrency();
        const cartItemsContainer = document.getElementById("cart-items");
        if (!cartItemsContainer) return;
        const totals = this.calculateTotals();
        cartItemsContainer.innerHTML = "";
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-cart-message"><i class="bi bi-bag-x"></i><p>Your cart is empty</p></div>`;
        } else {
            cart.forEach((item) => {
                const price =
                    parseFloat(item.currentPrice.replace(/[^0-9.-]/g, "")) || 0;
                const itemTotal = price * item.quantity;
                let variantText = "";
                if (
                    item.variant &&
                    typeof item.variant === "object" &&
                    Object.keys(item.variant).length > 0
                ) {
                    variantText = Object.values(item.variant)
                        .filter(
                            (val) => val && val !== "undefined" && val !== "" && val !== null
                        )
                        .join(" / ");
                }
                const itemElement = document.createElement("div");
                itemElement.className = "cart-item";
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.title
                    }" loading="lazy" class="cart-item-image"
                         onerror="this.src='https://via.placeholder.com/80?text=Image+Error';">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        ${variantText
                        ? `<div class="cart-item-variant">${variantText}</div>`
                        : ""
                    }
                        <div class="cart-item-meta">
                            <span class="cart-item-quantity">Qty: ${item.quantity
                    }</span>
                            <span class="cart-item-price">${item.currentPrice
                    }</span>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        const subtotalEl = document.getElementById("cart-subtotal");
        if (subtotalEl)
            subtotalEl.textContent = `${currency} ${totals.subtotal.toFixed(2)}`;
        const shippingEl = document.getElementById("cart-shipping");
        if (shippingEl)
            shippingEl.textContent =
                totals.shipping === 0
                    ? "Free"
                    : `${currency} ${totals.shipping.toFixed(2)}`;
        const totalEl = document.getElementById("cart-total");
        if (totalEl) totalEl.textContent = `${currency} ${totals.total.toFixed(2)}`;
        const codEl = document.getElementById("cod-total");
        if (codEl) codEl.textContent = `${currency} ${totals.total.toFixed(2)}`;
    },
    getOrderDetailsHTML: function () {
        const cart = this.getCart();
        const currency = this.getCurrency();
        const totals = this.calculateTotals();
        if (cart.length === 0)
            return '<div class="empty-cart-message">Your cart is empty</div>';
        let itemsHTML = cart
            .map((item) => {
                const price =
                    parseFloat(item.currentPrice.replace(/[^0-9.-]/g, "")) || 0;
                const itemTotal = price * item.quantity;
                let variantText = "";
                if (
                    item.variant &&
                    typeof item.variant === "object" &&
                    Object.keys(item.variant).length > 0
                ) {
                    variantText = Object.values(item.variant)
                        .filter(
                            (val) => val && val !== "undefined" && val !== "" && val !== null
                        )
                        .join(" / ");
                }
                return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title
                    }" loading="lazy" onerror="this.style.display='none';">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        ${variantText ? `<div>${variantText}</div>` : ""}
                        <div><span>${item.quantity} × ${item.currentPrice
                    }</span></div>
                    </div>
                </div>
            `;
            })
            .join("");
        return `
            <h3>Order Summary</h3>
            ${itemsHTML}
            <div class="order-totals">
                <div><h2> Your Order Details </h2></div>
                <div><h3>Subtotal</h3><span>${currency} <span style='margin-right: 10px;'></span> ${totals.subtotal.toFixed(
            2
        )}</span></div>
                <div><h3>Shipping</h3><span>${totals.shipping === 0
                ? "Free"
                : `${currency} <span style='margin-right: 10px;'></span> ${totals.shipping.toFixed(
                    2
                )}`
            }</span></div>
                <div><h3>Total</h3><span>${currency} <span style='margin-right: 10px;'></span> ${totals.total.toFixed(
                2
            )}</span></div>
            </div>
        `;
    },
};

let currentTab = "contact-section";
let selectedPaymentMethod = null;

function showTab(tabId) {
    const tabs = ["contact-section", "shipping-section", "selection", "details"];
    const steps = [
        "step-contact",
        "step-shipping",
        "step-selection",
        "step-details",
    ];
    tabs.forEach((tab) => {
        const tabElement = document.getElementById(tab);
        if (tabElement) tabElement.classList.add("hidden");
    });
    steps.forEach((step) => {
        const stepElement = document.getElementById(step);
        if (stepElement) {
            stepElement.classList.remove("active", "completed");
            const targetStep = `step-${tabId.replace("-section", "")}`;
            if (steps.includes(targetStep)) {
                if (step === targetStep) {
                    stepElement.classList.add("active");
                } else if (steps.indexOf(step) < steps.indexOf(targetStep)) {
                    stepElement.classList.add("completed");
                }
            }
        }
    });
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.remove("hidden");
        currentTab = tabId;
    }
    if (tabId === "details" && selectedPaymentMethod) loadDetailsTab();
}

function validateContact() {
    const email = document.getElementById("email")?.value.trim() || "";
    const emailError = document.getElementById("email-error");
    let isValid = true;
    if (!validateEmail(email)) {
        if (emailError) emailError.classList.remove("hidden");
        const emailInput = document.getElementById("email");
        if (emailInput) emailInput.classList.add("input-error");
        isValid = false;
    } else {
        if (emailError) emailError.classList.add("hidden");
        const emailInput = document.getElementById("email");
        if (emailInput) emailInput.classList.remove("input-error");
    }
    return isValid;
}

function validateShipping() {
    const fields = ["name", "address", "city", "state", "country", "zip"];
    let isValid = true;
    fields.forEach((field) => {
        const input = document.getElementById(field);
        if (!input) return;
        const error = document.getElementById(`${field}-error`);
        const value = input.value.trim();
        if (!value) {
            if (error) error.classList.remove("hidden");
            input.classList.add("input-error");
            isValid = false;
        } else {
            if (error) error.classList.add("hidden");
            input.classList.remove("input-error");
        }
    });
    if (!document.getElementById("same-as-shipping")?.checked) {
        const billingFields = [
            "checkout-billing-name",
            "checkout-billing-address",
            "checkout-billing-city",
            "checkout-billing-state",
            "checkout-billing-country",
            "checkout-billing-zip",
        ];
        billingFields.forEach((field) => {
            const input = document.getElementById(field);
            if (!input) return;
            const error = document.getElementById(`${field}-error`);
            const value = input.value.trim();
            if (!value) {
                if (error) error.classList.remove("hidden");
                input.classList.add("input-error");
                isValid = false;
            } else {
                if (error) error.classList.add("hidden");
                input.classList.remove("input-error");
            }
        });
    }
    return isValid;
}

function validateAndProceedToDetails() {
    if (!selectedPaymentMethod) {
        alert("Please select a payment method.");
        return;
    }
    showTab("details");
}

function selectMethod(method) {
    selectedPaymentMethod = method;
    document
        .querySelectorAll(".payment-option")
        .forEach((option) => option.classList.remove("selected"));
    const selectedOption = document.querySelector(
        `.payment-option[onclick="selectMethod('${method}')"]`
    );
    if (selectedOption) selectedOption.classList.add("selected");
    const nextButton = document.getElementById("next-button");
    if (nextButton) nextButton.classList.remove("hidden");
}


function loadDetailsTab() {
    const formContent = document.getElementById("form-content");
    const paymentIcon = document.getElementById("payment-icon");
    if (!formContent) return;

    customerData = {
        email: document.getElementById("email")?.value.trim() || "",
        phone: document.getElementById("phone")?.value.trim() || "",
        notes: document.getElementById("notes")?.value.trim() || "",
        paymentMethod: selectedPaymentMethod,
        shippingAddress: {
            name: document.getElementById("name")?.value.trim() || "Not provided",
            address: document.getElementById("address")?.value.trim() || "Not provided",
            city: document.getElementById("city")?.value.trim() || "Not provided",
            state: document.getElementById("state")?.value.trim() || "Not provided",
            country: document.getElementById("country")?.value.trim() || "Not provided",
            zip: document.getElementById("zip")?.value.trim() || "Not provided",
        },
    };

    if (document.getElementById("same-as-shipping")?.checked) {
        customerData.billingAddress = { ...customerData.shippingAddress };
    } else {
        customerData.billingAddress = {
            name: document.getElementById("checkout-billing-name")?.value.trim() || "Not provided",
            address: document.getElementById("checkout-billing-address")?.value.trim() || "Not provided",
            city: document.getElementById("checkout-billing-city")?.value.trim() || "Not provided",
            state: document.getElementById("checkout-billing-state")?.value.trim() || "Not provided",
            country: document.getElementById("checkout-billing-country")?.value.trim() || "Not provided",
            zip: document.getElementById("checkout-billing-zip")?.value.trim() || "Not provided",
        };
    }

    const iconMap = {
        cod: "https://img.icons8.com/color/48/000000/cash-in-hand.png",
        paypal: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png",
        easypaisa: "https://seeklogo.com/images/E/easypaisa-new-logo-412D450720-seeklogo.com.png",
        upi: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
        bank: "https://uxwing.com/wp-content/themes/uxwing/download/banking-finance/bank-transfer-icon.png",
    };

    if (paymentIcon) {
        paymentIcon.src = iconMap[selectedPaymentMethod] || "";
        paymentIcon.onerror = () => {
            paymentIcon.src = "https://via.placeholder.com/48?text=Pay";
        };
    }

    const templateId = `${selectedPaymentMethod}-form`;
    const template = document.getElementById(templateId);
    const paymentFormContent = template ? template.innerHTML : "";
    formContent.innerHTML = `
    ${paymentFormContent}
    <div class="customer-details-section" style="display:none;">
      <h3 class="section-title">Customer Information</h3>
      <div class="detail-row"><strong>Name:</strong> ${customerData.shippingAddress.name}</div>
    </div>
  `;

    bindPaymentMethodEvents();
}

function bindPaymentMethodEvents() {
    function refreshCustomerDataFromFields() {
        customerData.email = document.getElementById("email")?.value.trim() || customerData.email || "";
        customerData.phone = document.getElementById("phone")?.value.trim() || customerData.phone || "";
        customerData.notes = document.getElementById("notes")?.value.trim() || customerData.notes || "";
        customerData.shippingAddress = {
            name: document.getElementById("name")?.value.trim() || "Not provided",
            address: document.getElementById("address")?.value.trim() || "Not provided",
            city: document.getElementById("city")?.value.trim() || "Not provided",
            state: document.getElementById("state")?.value.trim() || "Not provided",
            country: document.getElementById("country")?.value.trim() || "Not provided",
            zip: document.getElementById("zip")?.value.trim() || "Not provided",
        };
        if (document.getElementById("same-as-shipping")?.checked) {
            customerData.billingAddress = { ...customerData.shippingAddress };
        } else {
            customerData.billingAddress = {
                name: document.getElementById("checkout-billing-name")?.value.trim() || "Not provided",
                address: document.getElementById("checkout-billing-address")?.value.trim() || "Not provided",
                city: document.getElementById("checkout-billing-city")?.value.trim() || "Not provided",
                state: document.getElementById("checkout-billing-state")?.value.trim() || "Not provided",
                country: document.getElementById("checkout-billing-country")?.value.trim() || "Not provided",
                zip: document.getElementById("checkout-billing-zip")?.value.trim() || "Not provided",
            };
        }
    }

    if (selectedPaymentMethod === "paypal") {
        const paypalButton = document.getElementById("paypal-redirect-button");
        const confirmBtn = document.getElementById("paypal-confirm-button");
        let paypalLink = null;
        const widgets = document.querySelectorAll("#payment-settings .widget");
        widgets.forEach((widget) => {
            const title = widget.querySelector("h2")?.textContent.trim().toLowerCase();
            if (title === "paypal") {
                const links = widget.querySelectorAll("a");
                const active = links[0]?.getAttribute("href") === "true";
                if (active && links.length > 1) {
                    paypalLink = links[1].getAttribute("href");
                }
            }
        });
        if (paypalButton) {
            paypalButton.onclick = function (e) {
                e.preventDefault();
                if (paypalLink) {
                    window.open(paypalLink, "_blank", "noopener,noreferrer");
                } else {
                    alert("PayPal is not active or link is missing.");
                }
            };
        }
        if (confirmBtn) {
            confirmBtn.onclick = function (e) {
                e.preventDefault();
                refreshCustomerDataFromFields();
                if (paypalLink) {
                    processPayment("PayPal", e);
                } else {
                    alert("PayPal is not active, cannot confirm order.");
                }
            };
        }
    }

    if (selectedPaymentMethod === "bank") {
        const bankConfirmBtn = document.getElementById("bank-confirm-button");
        if (bankConfirmBtn) {
            bankConfirmBtn.onclick = function (e) {
                e.preventDefault();
                refreshCustomerDataFromFields();
                processPayment("Bank Transfer", e);
            };
        }
    }

    if (selectedPaymentMethod === "easypaisa") {
        const easypaisaConfirmBtn = document.getElementById("easypaisa-confirm-button");
        if (easypaisaConfirmBtn) {
            easypaisaConfirmBtn.onclick = function (e) {
                e.preventDefault();
                refreshCustomerDataFromFields();
                processPayment("EasyPaisa", e);
            };
        }
    }

    if (selectedPaymentMethod === "upi") {
        const upiConfirmBtn = document.getElementById("upi-confirm-button");
        if (upiConfirmBtn) {
            upiConfirmBtn.onclick = function (e) {
                e.preventDefault();
                refreshCustomerDataFromFields();
                processPayment("UPI Transfer", e);
            };
        }
    }
}

function initializeNewPaymentMethods() {
    const paymentWidgets = document.querySelectorAll("#payment-settings .widget");
    paymentWidgets.forEach((widget) => {
        const title = widget.querySelector("h2").textContent.trim();
        const links = widget.querySelectorAll(".widget-content ul li a");
        let isActive = true;
        links.forEach((link) => {
            if (link.textContent.trim().toLowerCase() === "active") {
                if (link.getAttribute("href").toLowerCase() === "false") {
                    isActive = false;
                }
            }
        });

        if (!isActive) {
            const optionMap = {
                Paypal: "paypal",
                EasyPaisa: "easypaisa",
                "Bank Transfer": "bank",
                "UPI Transfer": "upi",
                "Cash on Delivery": "cod",
            };
            const methodKey = optionMap[title];
            if (methodKey) {
                const optionElement = document.querySelector(
                    `.payment-option[onclick*="${methodKey}"]`
                );
                if (optionElement) optionElement.style.display = "none";
            }
            const formMap = {
                Paypal: "paypal-form",
                EasyPaisa: "easypaisa-form",
                "Bank Transfer": "bank-form",
                "UPI Transfer": "upi-form",
            };
            const formId = formMap[title];
            if (formId) {
                const formElement = document.getElementById(formId);
                if (formElement) formElement.style.display = "none";
            }
            return;
        }

        if (title === "Paypal") {
            const paypalLink = links[0]?.getAttribute("href");
            if (paypalLink) {
                const paypalButton = document.getElementById("paypal-redirect-button");
                if (paypalButton) {
                    paypalButton.setAttribute("data-paypal-link", paypalLink);
                    paypalButton.onclick = function (e) {
                        e.preventDefault();
                        const link = paypalButton.getAttribute("data-paypal-link");
                        if (link) {
                            window.open(link, "_blank");
                        } else {
                            alert("PayPal link is not set up yet.");
                        }
                    };
                }
            }
        } else if (title === "EasyPaisa") {
            const form = document.getElementById("easypaisa-form");
            if (form) {
                links.forEach((link) => {
                    const label = link.textContent.trim().toLowerCase();
                    if (label.includes("account name")) {
                        form.querySelector(".info-box:nth-of-type(1) p").textContent =
                            link.getAttribute("href");
                    } else if (label.includes("account number")) {
                        form.querySelector(".info-box:nth-of-type(2) p").textContent =
                            link.getAttribute("href");
                    } else if (label.includes("qr code")) {
                        form.querySelector(".qr-code").src = link.getAttribute("href");
                    }
                });
            }
        } else if (title === "Bank Transfer") {
            const form = document.getElementById("bank-form");
            if (form) {
                links.forEach((link) => {
                    const label = link.textContent.trim().toLowerCase();
                    if (label.includes("account name")) {
                        form.querySelector(".info-box:nth-of-type(1) p").textContent =
                            link.getAttribute("href");
                    } else if (label.includes("account number")) {
                        form.querySelector(".info-box:nth-of-type(2) p").textContent =
                            link.getAttribute("href");
                    } else if (label.includes("bank name")) {
                        form.querySelector(".info-box:nth-of-type(3) p").textContent =
                            link.getAttribute("href");
                    } else if (label.includes("ifsc")) {
                        form.querySelector(".info-box:nth-of-type(4) p").textContent =
                            link.getAttribute("href");
                    }
                });
            }
        } else if (title === "UPI Transfer") {
            const upiDetailsContainer = document.getElementById("upi-options-container-template");
            if (upiDetailsContainer) {
                const upiOptionsContainer = document.createElement("div");
                upiOptionsContainer.className = "upi-options-container";
                links.forEach((link) => {
                    const label = link.textContent.trim().toLowerCase();
                    if (label !== "active") {
                        const name = link.textContent.trim();
                        const qrUrl = link.getAttribute("href");
                        const optionDiv = document.createElement("div");
                        optionDiv.className = "upi-payment-option";
                        optionDiv.innerHTML = `
              <img src="${qrUrl}" alt="${name} UPI QR Code" class="qr-code">
              <h3>${name}</h3>
            `;
                        upiOptionsContainer.appendChild(optionDiv);
                    }
                });
                upiDetailsContainer.appendChild(upiOptionsContainer);
            }
        }
    });
}

async function processPayment(methodName, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (isProcessing) {
        console.log("Already processing an order, please wait...");
        return;
    }
    
    isProcessing = true;

    let confirmButton = event?.target;
    let originalText = "";
    
    if (confirmButton && confirmButton.tagName.toLowerCase() === "button") {
        originalText = confirmButton.innerHTML;
        confirmButton.disabled = true;
        confirmButton.innerHTML = '<span class="spinner"></span> Processing...';
    }

    try {
        const formSection = document.querySelector(".form-section");
        if (!formSection) return;
        
        formSection.innerHTML = `
            <div class="order-processing">
                <div class="processing-animation">
                    <div class="spinner"></div>
                    <h2>Processing Your Order...</h2>
                    <p>Please wait while we confirm your order.</p>
                </div>
            </div>
        `;
        
        const totals = checkoutCart.calculateTotals();
        const cart = checkoutCart.getCart();
        const currency = checkoutCart.getCurrency();
        
        const orderData = {
            email: customerData.email,
            phone: customerData.phone,
            shippingAddress: customerData.shippingAddress,
            billingAddress: customerData.billingAddress,
            notes: customerData.notes,
            paymentMethod: methodName,
            items: cart,
            subtotal: totals.subtotal,
            shipping: totals.shipping,
            total: totals.total,
            date: new Date().toISOString(),
            status: "Pending",
        };
        
        let orders = JSON.parse(localStorage.getItem("bloggerStoreOrders") || "[]");
        orders.push(orderData);
        localStorage.setItem("bloggerStoreOrders", JSON.stringify(orders));
        
        const shippingAddrStr = formatAddressForSheets(customerData.shippingAddress);
        const isSameAddress =
            JSON.stringify(customerData.shippingAddress) ===
            JSON.stringify(customerData.billingAddress);
        
        const structuredCartItems = cart.map((item) => {
            const priceNum = parseFloat(item.currentPrice.replace(/[^0-9.-]/g, "")) || 0;
            let variantText = "";
            if (item.variant && typeof item.variant === "object" && Object.keys(item.variant).length > 0) {
                variantText = Object.values(item.variant)
                    .filter((val) => val && val !== "undefined" && val !== "" && val !== null)
                    .join(" / ");
            }
            return {
                title: item.title,
                variant: variantText || "Default",
                image: item.image,
                qty: item.quantity,
                price: priceNum,
            };
        });
        
        let billingAddrStr;
        if (isSameAddress) {
            billingAddrStr = "Same as shipping address";
        } else {
            billingAddrStr = formatAddressForSheets(customerData.billingAddress);
        }
        
        const sheetData = {
            name: customerData.shippingAddress.name || "Customer",
            email: orderData.email || "",
            phone: orderData.phone || "",
            shippingAddress: shippingAddrStr,
            billingAddress: billingAddrStr,
            cartItems: structuredCartItems,
            paymentMethod: orderData.paymentMethod,
            notes: orderData.notes || "No notes",
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            total: orderData.total,
            currency: currency
        };
        
        const sheetsResult = await sendToGoogleSheets(sheetData);
        
        let orderId;
        let sheetsSuccess = false;
        
        if (sheetsResult && sheetsResult.status === "success" && sheetsResult.orderId) {
            orderId = sheetsResult.orderId;
            sheetsSuccess = true;
        } else {
            orderId = generateOrderId();
        }
        
        orderData.orderId = orderId;
        
        orders = JSON.parse(localStorage.getItem("bloggerStoreOrders") || "[]");
        if (orders.length > 0) {
            orders[orders.length - 1].orderId = orderId;
            localStorage.setItem("bloggerStoreOrders", JSON.stringify(orders));
        }
        
        const customerName = customerData.shippingAddress.name || "Customer";
        const email = customerData.email;
        const phone = customerData.phone || "Not provided";
        const paymentMethod = orderData.paymentMethod;
        const shippingAddr = formatAddressForDisplay(customerData.shippingAddress);
        const billingAddr = isSameAddress
            ? "Same as shipping address"
            : formatAddressForDisplay(customerData.billingAddress);
        
        const orderSummaryHTML = checkoutCart.getOrderDetailsHTML();
        
        formSection.innerHTML = `
            <div class="order-confirmation">
                <div class="success-animation">
                    <svg viewBox="0 0 100 100">
                        <path class="checkmark" fill="none" stroke-width="6" stroke-miterlimit="10" d="M25,52l20,20l40-40" />
                    </svg>
                    <h2>Order Confirmed!</h2>
                </div>
                <div class="confirmation-details">
                    <p>Thank you, ${customerName}!</p>
                    <p>Your order #${orderId} has been received.</p>
                    <div class="confirmation-summaries-grid">
                        <div class="summary-section">${orderSummaryHTML}</div>
                        <div class="summary-section">
                            <h3>Customer & Payment Details</h3>
                            <h4>Payment Method</h4><p>${paymentMethod}</p>
                            <h4>Contact Information</h4>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <h4>Shipping Address</h4><p class="address-details">${shippingAddr.replace(/\n/g, '<br>')}</p>
                            <h4>Billing Address</h4><p class="address-details">${billingAddr.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                    <a href="/p/shop.html" class="button primary-button" style="margin-top: 2rem;">Continue Shopping</a>
                </div>
            </div>
        `;
        
        localStorage.removeItem("simpleCart");
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) cartCount.textContent = "0";
        checkoutCart.updateOrderSummary();
        
        if (!sheetsSuccess) {
            sendToContactFormFallback(orderData, cart, totals, currency, shippingAddrStr, isSameAddress);
        }
        
    } catch (error) {
        console.error("Payment processing error:", error);
        alert("There was an error processing your order. Please try again.");
        
        if (confirmButton && confirmButton.parentNode) {
            confirmButton.disabled = false;
            confirmButton.innerHTML = originalText;
        }
    } finally {
        setTimeout(() => {
            isProcessing = false;
        }, 2000);
    }
}

async function sendToGoogleSheets(sheetData) {
    try {
        const url = "https://script.google.com/macros/s/AKfycbxBrCHYfP0bI_XZTt_pGqfE4ycz61-SXQBpEnkd5si1zAzTQNj7qinaIlsmqENSYXl14Q/exec"; 
        
        if (url.includes("ADD_YOUR") || url.length < 50 || !url.includes("macros/s/")) {
            console.warn("No valid App Script URL configured");
            return false;
        }
        
        sheetData.token = "TEKVORIA_SECURE_18973182AFT64kjad61"; 

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: JSON.stringify(sheetData),
        });
        
        if (response.ok) {
            const resultText = await response.text();
            try {
                const result = JSON.parse(resultText);
                console.log("✅ Google Sheets response:", result);
                return result;
            } catch (err) {
                console.error("❌ Failed to parse response", err);
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error("❌ Google Sheets error:", error);
        return false;
    }
}

function sendToContactFormFallback(orderData, cart, totals, currency, shippingAddrStr, isSameAddress) {
    try {
        const nameField = document.getElementById("ContactForm1_contact-form-name");
        const emailField = document.getElementById("ContactForm1_contact-form-email");
        const messageField = document.getElementById("ContactForm1_contact-form-email-message");
        const submitBtn = document.getElementById("ContactForm1_contact-form-submit");
        
        if (nameField && emailField && messageField && submitBtn) {
            nameField.value = customerData.shippingAddress.name || "Customer";
            emailField.value = customerData.email || "no-email@provided.com";
            
            let billingAddrStr = isSameAddress 
                ? "Same as shipping address" 
                : formatAddressForSheets(customerData.billingAddress);
            
            let message = `ORDER RECEIVED (Background Save)\n\n`;
            message += `Order ID: ${orderData.orderId || "Pending"}\n`;
            message += `Date: ${new Date().toLocaleString()}\n\n`;
            message += `Customer:\nName: ${nameField.value}\nEmail: ${emailField.value}\nPhone: ${customerData.phone || "Not provided"}\n\n`;
            message += `Shipping Address:\n${shippingAddrStr}\n\n`;
            message += `Billing Address:\n${billingAddrStr}\n\n`;
            message += `Payment Method: ${orderData.paymentMethod}\n`;
            if (customerData.notes) message += `Notes: ${customerData.notes}\n\n`;
            message += `----------------------------------------\nItems:\n`;
            
            cart.forEach((item) => {
                const price = parseFloat(item.currentPrice.replace(/[^0-9.-]/g, "")) || 0;
                let variantText = "";
                if (item.variant && Object.keys(item.variant).length > 0) {
                    variantText = Object.values(item.variant).join(" / ");
                }
                message += `${item.title}${variantText ? ` (${variantText})` : ""}\nQty: ${item.quantity} × ${currency} ${price.toFixed(2)}\n\n`;
            });
            
            message += `----------------------------------------\n`;
            message += `Subtotal: ${currency} ${totals.subtotal.toFixed(2)}\n`;
            message += `Shipping: ${totals.shipping === 0 ? "Free" : currency + " " + totals.shipping.toFixed(2)}\n`;
            message += `Total: ${currency} ${totals.total.toFixed(2)}\n\nThank you!`;
            
            messageField.value = message.trim();
            
            setTimeout(() => {
                submitBtn.click();
                console.log("Contact form submitted in background");
            }, 100);
        }
    } catch (error) {
        console.error("Contact form fallback error:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Form submission prevented");
        });
    });
    
    checkoutCart.updateOrderSummary();
    initializeNewPaymentMethods();
    
    if (checkoutCart.getCart().length === 0) {
        const formSection = document.querySelector(".form-section");
        if (formSection) {
            formSection.innerHTML = `
                <div class="empty-cart-message">
                    <i class="bi bi-bag-x"></i>
                    <p>Your cart is empty.</p>
                    <span>Please add items to your cart to proceed with checkout.</span>
                    <a href="/p/shop.html" class="button primary-button" style="margin-top: 1.5rem;">Return to Shop</a>
                </div>
            `;
        }
        const progressBar = document.querySelector(".progress-bar");
        if (progressBar) progressBar.style.display = "none";
        return;
    }
    
    showTab("contact-section");
    
    const sameAsShipping = document.getElementById("same-as-shipping");
    const billingSection = document.getElementById("checkout-billing-address-section");
    if (sameAsShipping && billingSection) {
        sameAsShipping.addEventListener("change", function () {
            billingSection.style.display = this.checked ? "none" : "grid";
        });
        billingSection.style.display = sameAsShipping.checked ? "none" : "grid";
    }
    
    const contactNext = document.getElementById("contact-next");
    if (contactNext) {
        contactNext.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (validateContact()) showTab("shipping-section");
        });
    }
    
    const shippingBack = document.getElementById("shipping-back");
    if (shippingBack) {
        shippingBack.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            showTab("contact-section");
        });
    }
    
    const shippingNext = document.getElementById("shipping-next");
    if (shippingNext) {
        shippingNext.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (validateShipping()) showTab("selection");
        });
    }
    
    const selectionBack = document.getElementById("selection-back");
    if (selectionBack) {
        selectionBack.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            showTab("shipping-section");
        });
    }
    
    const nextButton = document.getElementById("next-button");
    if (nextButton) {
        nextButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            validateAndProceedToDetails();
        });
    }
    
    document.querySelectorAll(".payment-option").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    document.querySelectorAll(".input-field").forEach((input) => {
        input.addEventListener("input", function () {
            this.classList.toggle("filled", this.value.trim() !== "");
        });
        input.classList.toggle("filled", input.value.trim() !== "");
    });
});

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("view-checkout")) {
        e.preventDefault();
        window.location.href = "/p/checkout.html";
    }
});

const currencyDiv = document.querySelector("div.priceCurrency");
if (currencyDiv) {
    const observer = new MutationObserver(() => {
        checkoutCart.updateOrderSummary();
    });
    observer.observe(currencyDiv, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const checkoutPage = document.getElementById("CheckoutPage");
    if (checkoutPage) {
        const isCheckoutPage = window.location.pathname.includes("/p/checkout.html");
        checkoutPage.style.display = isCheckoutPage ? "block" : "none";
    }
});

