import { Type } from "@sinclair/typebox"

export const bundleParamsSchema = Type.Object({
  id: Type.String(),
  bundleId: Type.String(),
})

export const appBundlesParamsSchema = Type.Object({
  id: Type.String(),
})

export const createBundleBodySchema = Type.Object({
  version: Type.String(),
  notes: Type.Optional(Type.String()),
})
