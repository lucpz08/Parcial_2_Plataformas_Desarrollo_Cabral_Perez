function item(id, userId, cardId, condition, extra = {}) {
  return {
    id,
    userId,
    cardId,
    quantity: 1,
    condition,
    language: 'ES',
    notes: '',
    photoUrl: null,
    verification: 'none',
    createdAt: '2026-09-01T12:00:00.000Z',
    ...extra,
  }
}

export const collectionItems = [
  item('ci1', 'u2', 'base1-2', 'near_mint', { verification: 'verified', createdAt: '2026-08-06T10:00:00.000Z' }),
  item('ci2', 'u2', 'base1-15', 'excellent', { createdAt: '2026-08-06T10:05:00.000Z' }),
  item('ci3', 'u2', 'base1-58', 'good', { quantity: 3, notes: 'Una tiene el borde gastado.', createdAt: '2026-08-07T11:00:00.000Z' }),
  item('ci4', 'u2', 'base3-5', 'near_mint', { language: 'EN', verification: 'pending', createdAt: '2026-10-20T19:00:00.000Z' }),
  item('ci5', 'u2', 'base2-11', 'excellent', { createdAt: '2026-09-15T14:00:00.000Z' }),
  item('ci6', 'u2', 'base1-6', 'played', { createdAt: '2026-09-18T09:30:00.000Z' }),

  item('ci7', 'u3', 'base2-3', 'mint', { verification: 'verified', createdAt: '2026-08-10T12:00:00.000Z' }),
  item('ci8', 'u3', 'base2-12', 'near_mint', { verification: 'verified', createdAt: '2026-08-10T12:10:00.000Z' }),
  item('ci9', 'u3', 'base1-10', 'excellent', { createdAt: '2026-08-22T17:00:00.000Z' }),
  item('ci10', 'u3', 'base3-2', 'good', { createdAt: '2026-09-03T15:00:00.000Z' }),

  item('ci11', 'u4', 'base1-4', 'excellent', { verification: 'verified', notes: 'Sin rayones en el holo.', createdAt: '2026-08-15T21:00:00.000Z' }),
  item('ci12', 'u4', 'sv3pt5-199', 'mint', { verification: 'pending', createdAt: '2026-10-22T22:00:00.000Z' }),
  item('ci13', 'u4', 'base1-16', 'near_mint', { createdAt: '2026-08-30T18:00:00.000Z' }),
  item('ci14', 'u4', 'base3-4', 'good', { createdAt: '2026-09-09T13:00:00.000Z' }),

  item('ci15', 'u5', 'swsh7-215', 'mint', { language: 'JP', verification: 'verified', createdAt: '2026-08-21T11:00:00.000Z' }),
  item('ci16', 'u5', 'base1-1', 'near_mint', { language: 'JP', createdAt: '2026-08-28T16:00:00.000Z' }),
  item('ci17', 'u5', 'base2-10', 'excellent', { createdAt: '2026-09-12T10:00:00.000Z' }),

  item('ci18', 'u6', 'base1-3', 'good', { quantity: 2, createdAt: '2026-09-03T12:00:00.000Z' }),
  item('ci19', 'u6', 'base1-8', 'excellent', { createdAt: '2026-09-04T12:00:00.000Z' }),
  item('ci20', 'u6', 'base3-10', 'near_mint', { verification: 'pending', createdAt: '2026-10-25T20:00:00.000Z' }),
  item('ci21', 'u6', 'base3-12', 'played', { createdAt: '2026-09-20T12:00:00.000Z' }),
  item('ci22', 'u6', 'base2-4', 'near_mint', { createdAt: '2026-09-21T12:00:00.000Z' }),

  item('ci23', 'u7', 'base3-15', 'excellent', { verification: 'rejected', createdAt: '2026-09-12T10:00:00.000Z' }),
  item('ci24', 'u7', 'base3-7', 'good', { createdAt: '2026-09-12T10:10:00.000Z' }),
]
