export type InboundMessageType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "sticker"
  | "location"
  | "contact"
  | "buttons"
  | "list"
  | "reaction"
  | "template";

/** Shape of `event.data` for an inbound WhatsApp message from Zavu. */
export interface InboundMessage {
  messageId: string;
  from: string;
  to?: string;
  channel: string;
  messageType: InboundMessageType;
  profileName?: string;
  text?: string;
  content?: {
    mediaUrl?: string;
    mimeType?: string;
    filename?: string;
    [key: string]: unknown;
  };
}

/** Top-level webhook envelope. Zavu wraps the message in `data`. */
export interface InboundEvent {
  data?: InboundMessage;
}
