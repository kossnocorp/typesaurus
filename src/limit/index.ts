export interface LimitQuery {
  type: 'limit'
  number: number
}

export function limit(number: number): LimitQuery {
  return {
    type: 'limit',
    number
  }
}
