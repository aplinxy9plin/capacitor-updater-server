import { Type } from "@sinclair/typebox"

export const createApiKeyBodySchema = Type.Object({
  name: Type.String(),
})
