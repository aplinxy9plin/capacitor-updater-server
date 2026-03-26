import { Type } from "@sinclair/typebox"

export const appIdParamsSchema = Type.Object({
  id: Type.String(),
})

export const createAppBodySchema = Type.Object({
  name: Type.String(),
  appId: Type.String(),
})
