document.addEventListener('DOMContentLoaded', () => {
    const addToCartButton = document.getElementById('add-to-cart-btn');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            const productName = addToCartButton.dataset.name;
            const productPrice = parseFloat(addToCartButton.dataset.price);
            const productImg = addToCartButton.dataset.img;

            if (productName && productPrice && productImg) {
                addToCart(productName, productPrice, productImg);
            }
        });
    }

    // Also update the cart badge on product pages when they load
    updateCartBadge();
});
