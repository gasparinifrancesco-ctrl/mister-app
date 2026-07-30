import { requireSchemaAccess } from "@/lib/dal";
import SchemaShell from "@/app/schema/SchemaShell";

export default async function SchemaLibraryPage() {
  const user = await requireSchemaAccess();
  return <SchemaShell email={user.email} view="library" />;
}
