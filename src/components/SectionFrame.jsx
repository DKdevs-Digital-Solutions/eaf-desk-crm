export default function SectionFrame({ children }) {
  return (
    <div className="-mx-1 mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {children}
    </div>
  );
}
