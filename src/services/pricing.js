const PRICES = {
  laptop: 1000,
  phone: 500,
  headset: 50,
  misc: 20
};

export function getPriceForItem(item) {
  return PRICES[item] || 20;
}

export function calculateTotal(basePrice, qty) {
  return basePrice * qty;
}