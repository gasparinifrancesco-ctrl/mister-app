import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/dal';
import { hasPermission } from '@/lib/permissions';
import { getActiveStagione } from '@/lib/stagioni';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  await getActiveStagione(session.userId); // assicura che ne esista sempre una
  const stagioni = await prisma.stagione.findMany({
    where: { userId: session.userId },
    orderBy: { creataIl: 'desc' },
  });
  return Response.json({ stagioni });
}

// Chiude la stagione attiva (se c'è) e ne apre una nuova, attiva, con l'identità indicata.
// Rosa/calendario/formazione predefinita/piano squadra ripartono vuoti: sono chiavi
// KvEntry nuove, agganciate al nuovo stagioneId. La stagione chiusa non viene toccata,
// resta consultabile così com'era.
export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'manage_stagioni')) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 });
  }

  const { etichetta, societa, tipoSquadra, livello } = body;
  if (!etichetta || !societa || !tipoSquadra || !livello) {
    return Response.json({ error: 'etichetta, società, tipo squadra e livello sono obbligatori' }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.stagione.updateMany({ where: { userId: session.userId, attiva: true }, data: { attiva: false, chiusaIl: new Date() } });
    return tx.stagione.create({
      data: { userId: session.userId, etichetta, societa, tipoSquadra, livello, attiva: true },
    });
  });

  return Response.json({ stagione: result });
}
