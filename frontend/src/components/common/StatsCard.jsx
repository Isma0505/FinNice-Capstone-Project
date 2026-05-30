// kartu statistik (dipake di dasboard)

function StatsCard({ title, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className="text-sm text-[var(--text-secondary)]">
        {title}
      </div>
      <div className="text-2xl font-bold" style={{ color: color || 'var(--accent)' }}>
        {value}
      </div>
    </div>
  );
}

export default StatsCard;