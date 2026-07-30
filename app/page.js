import { getCurrentUser } from "@/lib/dal";
import AppShell from "@/app/AppShell";

export default async function Page() {
  const user = await getCurrentUser();
  const modules = JSON.parse(user.modules || '["united-carpi"]');
  return <AppShell email={user.email} schemaUnlocked={modules.includes("schema")} />;
}
