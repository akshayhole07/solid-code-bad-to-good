export async function sendOrderConfirmation(user, orderId) {
  // Email via API
  await fetch("https://httpbin.org/post", {
    method: "POST",
    body: JSON.stringify({ to: `${user}@mail.com`, text: `Order ${orderId}` })
  });
  
  // SMS via alert
  alert(`SMS to ${user}: Order ${orderId} placed`);
}