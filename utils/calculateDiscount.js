/**
 * Calculate discount amount
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Discounted price
 */
export const applyDiscount = (price, discountPercent = 0) => {
  if (discountPercent <= 0) return price;
  if (discountPercent >= 100) return 0;
  const discountAmount = (price * discountPercent) / 100;
  return parseFloat((price - discountAmount).toFixed(2));
};

/**
 * Calculate discount amount from price and percentage
 */
export const getDiscountAmount = (price, discountPercent = 0) => {
  return parseFloat(((price * discountPercent) / 100).toFixed(2));
};
