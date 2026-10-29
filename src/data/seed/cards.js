const IMAGE_BASE = 'https://images.pokemontcg.io'

function card(setId, number, name, type, rarity, referencePrice) {
  const sets = {
    base1: { setName: 'Base Set', setTotal: 102 },
    base2: { setName: 'Jungle', setTotal: 64 },
    base3: { setName: 'Fossil', setTotal: 62 },
    swsh7: { setName: 'Evolving Skies', setTotal: 203 },
    sv3pt5: { setName: '151', setTotal: 165 },
  }

  return {
    id: `${setId}-${number}`,
    name,
    setId,
    ...sets[setId],
    number,
    type,
    rarity,
    referencePrice,
    imageSmall: `${IMAGE_BASE}/${setId}/${number}.png`,
    imageLarge: `${IMAGE_BASE}/${setId}/${number}_hires.png`,
    active: true,
  }
}

export const cards = [
  card('base1', '1', 'Alakazam', 'Psíquico', 'Holo Rara', 180000),
  card('base1', '2', 'Blastoise', 'Agua', 'Holo Rara', 420000),
  card('base1', '3', 'Chansey', 'Incoloro', 'Holo Rara', 150000),
  card('base1', '4', 'Charizard', 'Fuego', 'Holo Rara', 1350000),
  card('base1', '6', 'Gyarados', 'Agua', 'Holo Rara', 160000),
  card('base1', '8', 'Machamp', 'Lucha', 'Holo Rara', 90000),
  card('base1', '10', 'Mewtwo', 'Psíquico', 'Holo Rara', 230000),
  card('base1', '15', 'Venusaur', 'Planta', 'Holo Rara', 380000),
  card('base1', '16', 'Zapdos', 'Eléctrico', 'Holo Rara', 170000),
  card('base1', '58', 'Pikachu', 'Eléctrico', 'Común', 25000),
  card('base2', '3', 'Flareon', 'Fuego', 'Holo Rara', 120000),
  card('base2', '4', 'Jolteon', 'Eléctrico', 'Holo Rara', 125000),
  card('base2', '10', 'Scyther', 'Planta', 'Holo Rara', 110000),
  card('base2', '11', 'Snorlax', 'Incoloro', 'Holo Rara', 135000),
  card('base2', '12', 'Vaporeon', 'Agua', 'Holo Rara', 130000),
  card('base3', '2', 'Articuno', 'Agua', 'Holo Rara', 115000),
  card('base3', '4', 'Dragonite', 'Incoloro', 'Holo Rara', 190000),
  card('base3', '5', 'Gengar', 'Psíquico', 'Holo Rara', 210000),
  card('base3', '7', 'Hitmonlee', 'Lucha', 'Holo Rara', 70000),
  card('base3', '10', 'Lapras', 'Agua', 'Holo Rara', 95000),
  card('base3', '12', 'Moltres', 'Fuego', 'Holo Rara', 120000),
  card('base3', '15', 'Zapdos', 'Eléctrico', 'Holo Rara', 105000),
  card('swsh7', '215', 'Umbreon VMAX', 'Siniestro', 'Secreta', 1900000),
  card('sv3pt5', '199', 'Charizard ex', 'Fuego', 'Ilustración Especial', 520000),
]
