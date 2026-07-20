import { Injectable } from '@nestjs/common';

export interface AuditEvent {
  entityId: string;
  entityType: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  userId?: string;
  changes?: Record<string, any>;
}

@Injectable()
export class AuditService {
  /**
   * Fire-and-forget audit logger.
   * In a real implementation, this pushes to a specialized Audit table or ELK stack.
   */
  async log(event: AuditEvent): Promise<void> {
    console.log(`[AUDIT] ${event.action} on ${event.entityType}(${event.entityId}) by User(${event.userId || 'SYSTEM'})`);
  }
}
