import React, { useEffect, useState, useCallback, useMemo } from "react";
import { loadOrders, saveOrders } from "./services/storage";
import { getPriceForItem, calculateTotal } from "./services/pricing";
import { applyDiscount } from "./services/discounts";
import { processPayment } from "./services/payment";
import { sendOrderConfirmation } from "./services/notifications";
import { generateCSVReport, calculateRevenue, downloadCSV } from "./services/reporting";

const ITEMS = ["laptop", "phone", "headset", "misc"];
const PAYMENT_METHODS = ["card", "paypal", "cod"];
const MESSAGE_DURATION = 3000; // Auto-clear message after 3 seconds

const OrderForm = ({ user, item, qty, payment, onUserChange, onItemChange, onQtyChange, onPaymentChange, onBuy, onExport }) => (
  <div className="card">
    <h2>Create Order</h2>
    <label>User</label>
    <input value={user} onChange={onUserChange} />

    <label>Item</label>
    <select value={item} onChange={onItemChange}>
      {ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
    </select>

    <label>Qty</label>
    <input type="number" value={qty} onChange={onQtyChange} />

    <label>Payment</label>
    <select value={payment} onChange={onPaymentChange}>
      {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
    </select>

    <button onClick={onBuy}>Buy</button>
    <button onClick={onExport}>Export CSV + Revenue</button>
  </div>
);

const OrdersTable = ({ orders, onRefund }) => (
  <div className="card">
    <h2>Orders</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Total</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.id}>
            <td>{o.id}</td>
            <td>{o.user}</td>
            <td>{o.item}</td>
            <td>{o.qty}</td>
            <td>${o.total.toFixed(2)}</td>
            <td>{o.status}</td>
            <td>
              <button onClick={() => onRefund(o.id)} disabled={o.status === "REFUNDED"}>
                {o.status === "REFUNDED" ? "Refunded" : "Refund"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function App() {
  const [user, setUser] = useState("vip");
  const [item, setItem] = useState("laptop");
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState("card");
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  // Load from storage once
  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  // Save to storage whenever orders change
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  // Auto-clear message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), MESSAGE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Memoize computed total for display
  const displayTotal = useMemo(() => {
    const price = getPriceForItem(item);
    let total = calculateTotal(price, Number(qty) || 0);
    total = applyDiscount(total, user, Number(qty) || 0);
    return total.toFixed(2);
  }, [item, qty, user]);

  // Memoize computed stats
  const stats = useMemo(() => ({
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status !== "REFUNDED").length,
    revenue: calculateRevenue(orders).toFixed(2)
  }), [orders]);

  // Callback for buyNow - prevents recreation on render
  const buyNow = useCallback(() => {
    if (!item || !payment || !qty) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const price = getPriceForItem(item);
      let total = calculateTotal(price, Number(qty));
      total = applyDiscount(total, user, Number(qty));

      processPayment(payment);

      const newOrder = {
        id: Date.now(),
        user,
        item,
        qty: Number(qty),
        total,
        status: "PLACED"
      };

      setOrders(prev => [...prev, newOrder]);
      sendOrderConfirmation(user, newOrder.id);
      setMessage(`✓ Order ${newOrder.id} placed. Total: $${total.toFixed(2)}`);
    } catch (error) {
      setMessage(`✗ Order failed: ${error.message}`);
    }
  }, [item, qty, user, payment]);

  // Callback for refund
  const refund = useCallback((orderId) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId && o.status !== "REFUNDED" 
          ? { ...o, status: "REFUNDED" } 
          : o
      )
    );
    setMessage(`✓ Refund processed for ${orderId}`);
  }, []);

  // Callback for export
  const exportReport = useCallback(() => {
    try {
      const csv = generateCSVReport(orders);
      const revenue = calculateRevenue(orders);
      downloadCSV(csv);
      setMessage(`✓ Report exported. Revenue: $${revenue.toFixed(2)}`);
    } catch (error) {
      setMessage(`✗ Export failed: ${error.message}`);
    }
  }, [orders]);

  // Optimized input handlers with useCallback
  const handleUserChange = useCallback((e) => setUser(e.target.value), []);
  const handleItemChange = useCallback((e) => setItem(e.target.value), []);
  const handleQtyChange = useCallback((e) => setQty(e.target.value), []);
  const handlePaymentChange = useCallback((e) => setPayment(e.target.value), []);

  return (
    <div className="page">
      <h1>Optimized Commerce Admin</h1>
      <p>Refactored SOLID architecture with performance optimizations.</p>

      {/* Stats Bar */}
      <div className="card" style={{ display: "flex", justifyContent: "space-around", fontSize: "14px" }}>
        <span>📦 Total Orders: {stats.totalOrders}</span>
        <span>✓ Active: {stats.activeOrders}</span>
        <span>💰 Revenue: ${stats.revenue}</span>
      </div>

      <OrderForm
        user={user}
        item={item}
        qty={qty}
        payment={payment}
        onUserChange={handleUserChange}
        onItemChange={handleItemChange}
        onQtyChange={handleQtyChange}
        onPaymentChange={handlePaymentChange}
        onBuy={buyNow}
        onExport={exportReport}
      />

      {/* Estimated Total */}
      <div className="card" style={{ padding: "10px", textAlign: "center", backgroundColor: "#f0f0f0" }}>
        <strong>Estimated Total: ${displayTotal}</strong>
      </div>

      <OrdersTable orders={orders} onRefund={refund} />

      {message && <p className="message" style={{ animation: "fadeIn 0.3s" }}>{message}</p>}
    </div>
  );
}