import { Type } from "@sinclair/typebox"

export const updateSettingsBodySchema = Type.Object({
  registration_enabled: Type.Optional(Type.String()),
})
