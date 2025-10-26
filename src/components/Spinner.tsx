export default function Spinner({ size = 'w-8 h-8' }: { size?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-slate-200 border-t-orange-500 ${size}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}