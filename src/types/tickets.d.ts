export interface Ticket {
  ownerId: string;
  creatorId: string;
  description: string;
  timestamp: number;
  notify: boolean;
  server: string | null;
  botMessageId: string;
  closedById?: string;
}
