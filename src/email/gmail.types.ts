export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    parts?: Array<{
      body: {
        size: number;
      };
    }>;
  };
  internalDate: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type?: string;
  labelListVisibility?: string;
  messageListVisibility?: string;
}
