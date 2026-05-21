export function generateCSVReport(orders) {
  const lines = ["id,user,item,qty,total,status"];
  orders.forEach(o => {
    lines.push(`${o.id},${o.user},${o.item},${o.qty},${o.total},${o.status}`);
  });
  return lines.join("\n");
}

export function calculateRevenue(orders) {
  return orders.reduce((sum, o) => o.status !== "REFUNDED" ? sum + o.total : sum, 0);
}

export function downloadCSV(content) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders_export.csv";
  a.click();
}