export function applyDiscount(total, user, qty) {
  if (user === "vip") return total * 0.7;
  if (qty > 10) return total * 0.85;
  return total;
}