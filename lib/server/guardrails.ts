export type AssistanceLevel = 'Review' | 'Guidance' | 'Total Help'

export function guardrails(level: AssistanceLevel) {
  switch (level) {
    case 'Review':
      return 'Rules: No code. Provide concise analysis, complexity notes, edge cases, or extra tests only.'
    case 'Guidance':
      return 'Rules: Provide up to 3 hints (Nudge → Strategy → Specific). No full solutions. Be concise.'
    default:
      return 'Rules: Short ELI5 → Practical → Technical. Include 3 edge cases. Keep output concise.'
  }
}

