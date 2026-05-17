import Zavudev from "@zavudev/sdk";

let client: Zavudev | null = null;

function getClient(): Zavudev {
  if (client) return client;
  const apiKey = process.env.ZAVUDEV_API_KEY;
  if (!apiKey) {
    throw new Error("ZAVUDEV_API_KEY is not set");
  }
  client = new Zavudev({ apiKey });
  return client;
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  const zavu = getClient();
  await zavu.messages.send({
    to,
    text,
    channel: "whatsapp",
  });
}
