import { z } from "zod"

export const apiKeyMaxLength = 300

export const saveApiKeySchema = z.object({
  apiKey: z
    .string()
    .trim()
    .startsWith("sk-ant-", "Anthropic API keys start with sk-ant-")
    .min(20, "That looks too short to be a full key.")
    .max(apiKeyMaxLength, "That looks too long to be a key."),
})
