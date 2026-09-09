export default function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
      </div>
      <div className="grid grid-flow-col auto-cols-[150px] gap-4 overflow-x-auto pb-2 sm:auto-cols-[180px]">
        {children}
      </div>
    </section>
  );
}
