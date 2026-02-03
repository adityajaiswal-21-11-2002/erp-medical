import ComplianceLog from "../models/ComplianceLog"

type ComplianceInput = {
  actorId?: string
  action: string
  subjectType?: string
  subjectId?: string
  metadata?: Record<string, unknown>
}

export async function logComplianceEvent(input: ComplianceInput) {
  return ComplianceLog.create({
    actorId: input.actorId,
    action: input.action,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    metadata: input.metadata,
  })
}
