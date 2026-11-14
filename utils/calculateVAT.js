
export const VAT_RATE = 0.15;

/**
 * Calculate VAT amount from a pre-tax subtotal
 * @param {number} subtotal - Amount before VAT
 * @returns {number} VAT amount
 */
export const calculateVAT = (subtotal) => {
  return parseFloat((subtotal * VAT_RATE).toFixed(2));
};

/**
 * Calculate total including VAT
 * @param {number} subtotal
 * @returns {{ vat: number, total: number }}
 */
export const calculateTotals = (subtotal) => {
  const vat = calculateVAT(subtotal);
  const total = parseFloat((subtotal + vat).toFixed(2));
  return { subtotal, vat, total };
};
