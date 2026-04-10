export default function UsageBar({ usage, plan }) {
  const { used, limit, remaining } = usage;
  const pct = Math.min((used / limit) * 100, 100);

  const progressGradient =
    pct >= 90 ? 'linear-gradient(90deg, #FF4444, #CC0000)'
    : pct >= 80 ? 'linear-gradient(90deg, #FFB020, #FF8C00)'
    : 'linear-gradient(90deg, #00D66C, #00A854)';

  const countColor =
    pct >= 90 ? '#FF4444' : pct >= 80 ? '#FFB020' : '#00D66C';

  return (
    <div
      style={{
        background: '#0F0F0F',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#808080' }}>
          ⚡ Generaciones · <span style={{ color: '#B3B3B3', fontWeight: '500' }}>{plan}</span>
        </span>
        <span style={{ fontSize: '18px', fontWeight: '700', color: countColor }}>
          {used} / {limit}
        </span>
      </div>

      <div
        style={{
          height: '10px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '8px',
        }}
      >
        <div
          className="progress-shimmer"
          style={{
            height: '100%',
            width: `${pct}%`,
            background: progressGradient,
            borderRadius: '999px',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <p style={{ fontSize: '12px', color: '#808080', display: 'flex', gap: '12px', margin: 0 }}>
        <span>{remaining} restante{remaining !== 1 ? 's' : ''}</span>
        {pct >= 90 && <span>⏰ Límite casi alcanzado</span>}
      </p>
    </div>
  );
}
