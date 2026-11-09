export const DEFAULT_LEADERSHIP = [
  { roleKey: 'jasiri-scout-leader', role: 'Jasiri Scout Leader', name: 'Dr. David Muigai' },
  { roleKey: 'assistant-jsl', role: 'Assistant JSL', name: 'Nicolas Mwangi' },
  { roleKey: 'crew-leader', role: 'Crew Leader', name: 'Horas Obutinda' },
  { roleKey: 'assistant-crew-leader', role: 'Assistant Crew Leader', name: 'Charles Njuguna' },
  { roleKey: 'quartermaster', role: 'Quartermaster', name: 'Sharon Juma' },
  { roleKey: 'scribe', role: 'Scribe', name: 'Sheiline Jerop' },
  { roleKey: 'organising-secretary', role: 'Organising Secretary', name: 'Justus Kipchirchir' },
  { roleKey: 'disciplinarian', role: 'Disciplinarian', name: 'Romelse Akoyo' },
  { roleKey: 'treasurer', role: 'Treasurer', name: 'Ummuayman Mohamed' }
] as const

export const ASSIGNED_ROLE_BY_LEADERSHIP_KEY = {
  'jasiri-scout-leader': 'RSL',
  'crew-leader': 'CREW_LEADER',
  'assistant-crew-leader': 'ASSISTANT_CREW_LEADER',
  quartermaster: 'QUARTERMASTER',
  scribe: 'SECRETARY',
  'organising-secretary': 'OG',
  disciplinarian: 'DISCIPLINARIAN',
  treasurer: 'TREASURER'
} as const

export type LeadershipEntry = Omit<(typeof DEFAULT_LEADERSHIP)[number], 'name'> & { name: string; assigned: boolean }

export function resolveLeadershipRoster(
  storedNames: Array<{ roleKey: string; name: string }>,
  assignedLeaders: Array<{ name: string | null; role: { name: string } | null }>
): LeadershipEntry[] {
  const storedNamesByRole = new Map(storedNames.map(({ roleKey, name }) => [roleKey, name]))
  const assignedNamesByRole = new Map(
    assignedLeaders.flatMap(({ name, role }) => {
      if (!name?.trim() || !role) return []
      const entry = Object.entries(ASSIGNED_ROLE_BY_LEADERSHIP_KEY)
        .find(([, assignedRole]) => assignedRole === role.name)
      return entry ? [[entry[0], name.trim()] as const] : []
    })
  )

  return DEFAULT_LEADERSHIP.map((leader) => ({
    ...leader,
    name: assignedNamesByRole.get(leader.roleKey)
      || storedNamesByRole.get(leader.roleKey)
      || leader.name,
    assigned: assignedNamesByRole.has(leader.roleKey)
  }))
}

export const LEADERSHIP_EDITOR_ROLES = ['RSL', 'CREW_LEADER']

export const MEMBER_DIRECTORY_ROLES = [
  'SYSTEM_ADMIN',
  'SECRETARY',
  'RSL',
  'CREW_LEADER',
  'ASSISTANT_CREW_LEADER'
]

export const ANNUAL_ROLE_ASSIGNER_ROLES = ['SYSTEM_ADMIN', 'RSL'] as const