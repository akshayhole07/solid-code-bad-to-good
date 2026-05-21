export function loadOrders() {
  const stored = localStorage.getItem("orders");
  return stored ? JSON.parse(stored) : [];
}

export function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}