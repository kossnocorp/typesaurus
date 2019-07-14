export interface LimitQuery {
  type: 'limit'
  number: number
}

export default function limit(number: number): LimitQuery {
  return {
    type: 'limit',
    number
  }
}
