export type InboundMessageType = "text" | "image" | "audio" | "video" | "document" | "sticker" | "location" | "contact" | "buttons" | "list" | "reaction" | "template";

export interface InboundMessage {
  id: string;
  from: string;
  to?: string;
  channel: string;
  messageType: InboundMessageType;
  text?: string;
  content?: {
    mediaUrl?: string;
    mimeType?: string;
    filename?: string;
    [key: string]: unknown;
  };
}

export interface InboundEvent {
  type: string;
  message?: InboundMessage;
}

export function isInboundMessage(event: InboundEvent): event is InboundEvent & { message: InboundMessage } {
  return event.type === "message.inbound" && !!event.message;
}
