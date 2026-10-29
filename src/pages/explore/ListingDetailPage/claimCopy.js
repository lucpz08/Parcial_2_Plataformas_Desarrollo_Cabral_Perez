export const CLAIM_COPY = {
  vender: {
    label: 'Reservar carta',
    title: '¿Reservar esta carta?',
    message: (seller) =>
      `La carta queda reservada para vos y se abre un chat con ${seller} para coordinar el pago y la entrega.`,
    success: '¡Reservada! Coordiná el pago y la entrega por chat.',
  },
  cambiar: {
    label: 'Proponer cambio',
    title: '¿Proponer un cambio?',
    message: (seller) =>
      `La carta queda reservada para vos y se abre un chat con ${seller} para acordar qué cartas intercambian.`,
    success: '¡Propuesta enviada! Acordá el cambio por chat.',
  },
  busco: {
    label: '¡Tengo esta carta!',
    title: '¿Ofrecer tu carta?',
    message: (seller) => `Le avisamos a ${seller} que tenés la carta que busca y se abre un chat para coordinar.`,
    success: '¡Listo! Le avisamos que tenés la carta.',
  },
}

export function getViewerRole(listing, activeClaim, user) {
  if (!user) return 'guest'
  if (listing.userId === user.id) return 'owner'
  if (activeClaim?.claimantId === user.id) return 'claimant'
  return 'visitor'
}
