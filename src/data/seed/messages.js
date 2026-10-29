function message(id, conversationId, senderId, body, createdAt, readAt = createdAt) {
  return { id, conversationId, senderId, body, createdAt, readAt }
}

export const messages = [
  message('m1', 'cv1', 'u2', '¡Hola Camila! Te reservé el Mewtwo, ¿sigue disponible?', '2026-10-21T16:01:00.000Z'),
  message('m2', 'cv1', 'u3', '¡Hola! Sí, es tuyo. ¿Preferís envío o nos vemos?', '2026-10-21T16:20:00.000Z'),
  message('m3', 'cv1', 'u2', 'Envío por correo así no viajo. ¿Te transfiero hoy?', '2026-10-21T16:25:00.000Z'),
  message('m4', 'cv1', 'u3', 'Dale, te paso el CBU por acá. Lo despacho el lunes.', '2026-10-27T21:15:00.000Z', null),

  message('m5', 'cv2', 'u4', 'Buenas Tomás, me interesa el Machamp.', '2026-09-18T12:00:00.000Z'),
  message('m6', 'cv2', 'u6', 'Genial, te lo reservo. ¿Sos de Rosario?', '2026-09-18T12:30:00.000Z'),
  message('m7', 'cv2', 'u4', 'Sí, mandalo por Andreani porfa.', '2026-09-18T12:32:00.000Z'),
  message('m8', 'cv2', 'u4', '¡Me llegó perfecto! Gracias.', '2026-09-25T18:00:00.000Z'),

  message('m9', 'cv3', 'u6', 'Hola Mati, vi que tenés un Gyarados para cambiar.', '2026-10-26T14:00:00.000Z'),
  message('m10', 'cv3', 'u2', 'Sí, ¿qué me ofrecés?', '2026-10-26T14:22:00.000Z'),
  message('m11', 'cv3', 'u6', 'Tengo un Jolteon de Jungle near mint, ¿te sirve?', '2026-10-26T14:40:00.000Z', null),

  message('m12', 'cv4', 'u2', 'Hola Nico, ¿aceptás algo de cambio por el Charizard?', '2026-10-28T09:50:00.000Z'),
  message('m13', 'cv4', 'u4', 'Solo venta por ahora, pero escucho ofertas 😄', '2026-10-28T10:05:00.000Z', null),

  message('m14', 'cv5', 'u2', '¡Hola! Acabo de reservar tu Alakazam. ¿Cómo coordinamos el pago y la entrega?', '2026-10-16T21:00:00.000Z'),
  message('m15', 'cv5', 'u5', '¡Hola Matías! Te paso el alias por acá y lo despacho apenas se acredite.', '2026-10-16T21:12:00.000Z'),
  message('m16', 'cv5', 'u2', 'Listo, transferido 🙌', '2026-10-16T21:30:00.000Z'),
  message('m17', 'cv5', 'u2', '¡Me llegó hoy, impecable! Gracias Flor.', '2026-10-24T19:20:00.000Z'),
  message('m18', 'cv5', 'u5', '¡Qué bueno! Ya la marqué como completada. ¡Gracias a vos!', '2026-10-24T19:35:00.000Z'),
]
