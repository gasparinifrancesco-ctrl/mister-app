import { getCurrentUser, getSession, getTeamModules } from "@/lib/dal";
import { getActiveStagione } from "@/lib/stagioni";
import AppShell from "@/app/AppShell";
import LandingPage from "@/app/LandingPage";

export default async function Page() {
  // getSession non reindirizza (a differenza di getCurrentUser/verifySession): serve per
  // decidere QUI se mostrare la landing pubblica o la dashboard, senza già forzare il
  // redirect a /login che verifySession farebbe per un visitatore anonimo su "/".
  const session = await getSession();
  if (!session) return <LandingPage />;

  const user = await getCurrentUser();
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
