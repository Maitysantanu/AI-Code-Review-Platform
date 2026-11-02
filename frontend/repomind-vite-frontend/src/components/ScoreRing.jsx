export default function ScoreRing({ score = 0, label = "Score", size = 112 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safeScore / 100);
  return (
    <div className="score-ring-wrap" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${safeScore}% ${label}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} className="ring-track" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} className="ring-progress" strokeWidth={stroke} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-center"><strong>{Math.round(safeScore)}</strong><span>{label}</span></div>
    </div>
  );
}