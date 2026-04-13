export default function ReportButton({ userEmail }) {
  const msg = encodeURIComponent(`[${userEmail}] Problema: `);
  const url = `https://wa.me/595961417430?text=${msg}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title="Reportar un problema"
      aria-label="Reportar un problema"
      className="fixed bottom-5 right-4 w-10 h-10 flex items-center justify-center
                 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                 rounded-full text-zinc-400 hover:text-white
                 transition-colors shadow-lg"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    </a>
  );
}
