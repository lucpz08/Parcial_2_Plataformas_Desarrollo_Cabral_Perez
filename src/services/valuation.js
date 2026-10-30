import { cardsService } from './cards'
import { collectionService } from './collection'
import { CONDITION_LABELS, CONDITION_VALUE_FACTORS, CONDITIONS, VERIFIED_VALUE_BONUS } from '@/data/constants'

function valueItem(item) {
  const reference = item.card.referencePrice ?? 0
  const factor = (CONDITION_VALUE_FACTORS[item.condition] ?? 1) + (item.verification === 'verified' ? VERIFIED_VALUE_BONUS : 0)
  const unitValue = Math.round((reference * factor) / 100) * 100
  const market = cardsService.getMarketSummary(item.cardId)
  return {
    ...item,
    factor,
    unitValue,
    totalValue: unitValue * item.quantity,
    referenceTotal: reference * item.quantity,
    lowestPrice: market.lowestPrice,
  }
}

export const valuationService = {
  getForUser(userId) {
    const items = collectionService
      .getByUser(userId)
      .filter((item) => item.card)
      .map(valueItem)

    const total = items.reduce((sum, item) => sum + item.totalValue, 0)
    const referenceTotal = items.reduce((sum, item) => sum + item.referenceTotal, 0)
    const verifiedValue = items.filter((item) => item.verification === 'verified').reduce((sum, item) => sum + item.totalValue, 0)

    const bySet = new Map()
    items.forEach((item) => {
      const current = bySet.get(item.card.setId) ?? { label: item.card.setName, value: 0, cards: 0 }
      bySet.set(item.card.setId, { ...current, value: current.value + item.totalValue, cards: current.cards + item.quantity })
    })

    return {
      total,
      referenceTotal,
      conditionAdjustment: total - referenceTotal,
      verifiedShare: total ? verifiedValue / total : 0,
      cards: items.reduce((sum, item) => sum + item.quantity, 0),
      top: [...items].sort((a, b) => b.unitValue - a.unitValue).slice(0, 5),
      bySet: [...bySet.values()].sort((a, b) => b.value - a.value),
      byCondition: CONDITIONS.map(({ value }) => {
        const matching = items.filter((item) => item.condition === value)
        return {
          label: CONDITION_LABELS[value],
          value: matching.reduce((sum, item) => sum + item.totalValue, 0),
          cards: matching.reduce((sum, item) => sum + item.quantity, 0),
        }
      }).filter((row) => row.cards > 0),
      items: [...items].sort((a, b) => b.totalValue - a.totalValue),
    }
  },
}
