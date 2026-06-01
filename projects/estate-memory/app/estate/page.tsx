import QueryPanel from "@/components/estate/query-panel";
import DocList from "@/components/estate/doc-list";

export default function EstatePage() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Estate Memory{" "}
          <span className="text-xs text-gray-500 font-normal align-middle">
            v0
          </span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Sovereign, air-gapped document archive. Lexical retrieval with cited
          answers — designed for trust, estate, and family-office documents.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Ask the vault</h2>
        <QueryPanel />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">
          Indexed documents
        </h2>
        <DocList />
      </section>
    </main>
  );
}
