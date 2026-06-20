export default function KpiCard({ label, value, sub, color = 'blue', icon }) {
  return (
    <div className={`kpi-card ${color}`}>
      {icon && <span className="kpi-icon">{icon}</span>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
