export default function StatCard({ label, value, detail, icon: Icon, tone = "violet" }) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{Icon && <Icon size={18} />}</div></div>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-detail">{detail}</div>}
    </article>
  );
}