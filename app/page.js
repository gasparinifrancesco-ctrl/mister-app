import { getCurrentUser, getSession, getTeamModules } from "@/lib/dal";
import { getActiveStagione } from "@/lib/stagioni";
import AppShell from "@/app/AppShell";

export default async function Page() {
  const user = await getCurrentUser();
  const session = await getSession();
  // Entitlement (modulo Allenamenti sbloccato) letta dal proprietario della squadra, non
  // dall'account personale di chi è collegato: un collaboratore deve vedere lo stesso
  // sblocco dell'admin, non il proprio (che parte sempre senza moduli extra).
  const modules = JSON.parse((await getTeamModules(session)) || '["united-carpi"]');
  const stagione = await getActiveStagione(session.userId);
  return (
    <AppShell
      email={user.email}
      isOwner={user.isOwner}
      permissions={user.permissions}
      actorId={user.id}
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
