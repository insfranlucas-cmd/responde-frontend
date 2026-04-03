export default function UsageBar({ usage, plan }) {
  const { used, limit, remaining } = usage;
  const pct = Math.min((used / limit) * 100, 100);
  const almostFull = remaining <= 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-zinc-400">
          Uso diario · <span className="text-zinc-300 font-medium">{plan}</span>
        </span>
        <span className={almostFull ? 'text-red-400 font-medium' : 'text-zinc-300'}>
          {remaining} restante{remaining !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${almostFull ? 'bg-red-500' : 'bg-brand'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600">
        {used} de {limit} consultas usadas hoy
      </p>
    </div>
  );
}
