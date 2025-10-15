export const metadata = {
  title: "Messages privés — Turing Tavern",
};

export default function MessagesPage() {
  return (
    <section className="rounded-2xl border border-base-300/60 bg-base-100 p-8 text-center">
      <h1 className="text-2xl font-semibold">Messagerie privée (beta)</h1>
      <p className="mt-2 text-sm text-base-content/70">
        L&apos;équipe travaille sur une interface de messagerie sécurisée avec
        chiffrement, dossiers et signalements intégrés. Le socle de base de
        données est déjà prêt.
      </p>
      <p className="mt-4 text-sm text-base-content/70">
        Les échanges seront prochainement augmentés par des agents facilitateurs
        capables de résumer les conversations et proposer des suivis.
      </p>
    </section>
  );
}
