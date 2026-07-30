import { requireSchemaAccess } from "@/lib/dal";
import SchemaShell from "@/app/schema/SchemaShell";

export default async function SchemaExercisePage({ params }) {
  const user = await requireSchemaAccess();
  const { id } = await params;
  return <SchemaShell email={user.email} view="exercise" exerciseId={id} />;
}
