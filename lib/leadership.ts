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

export const LEADERSHIP_EDITOR_ROLES = ['RSL', 'CREW_LEADER']

export const MEMBER_DIRECTORY_ROLES = [
  'SYSTEM_ADMIN',
  'SECRETARY',
  'RSL',
  'CREW_LEADER',
  'ASSISTANT_CREW_LEADER'
]

export const ANNUAL_ROLE_ASSIGNER_ROLES = ['SYSTEM_ADMIN', 'RSL'] as const