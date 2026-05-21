const paymentProcessors = {
  card: () => { console.log("Calling card gateway"); },
  paypal: () => { console.log("Calling paypal API"); },
  cod: () => { console.log("Cash on delivery"); }
};

export function processPayment(method) {
  const processor = paymentProcessors[method];
  if (!processor) throw new Error("Invalid payment method");
  processor();
}