import { getCurrentUser } from "@/lib/dal";
import { getActiveStagione } from "@/lib/stagioni";
import AppShell from "@/app/AppShell";

export default async function Page() {
  const user = await getCurrentUser();
  const modules = JSON.parse(user.modules || '["united-carpi"]');
  const stagione = await getActiveStagione(user.id);
  return (
    <AppShell
      email={user.email}
      schemaUnlocked={modules.includes("schema")}
      stagione={{
        etichetta: stagione.etichetta,
        societa: stagione.societa,
        tipoSquadra: stagione.tipoSquadra,
        livello: stagione.livello,
      }}
    />
  );
}
