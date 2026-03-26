import { Type } from "@sinclair/typebox"

export const updateBodySchema = Type.Object({
  device_id: Type.String(),
  app_id: Type.String(),
  platform: Type.Optional(Type.String()),
  version_name: Type.Optional(Type.String()),
  version_os: Type.Optional(Type.String()),
  is_emulator: Type.Optional(Type.Any()),
  is_prod: Type.Optional(Type.Any()),
})

export const statsBodySchema = Type.Object({
  device_id: Type.String(),
  app_id: Type.Optional(Type.String()),
  platform: Type.Optional(Type.String()),
  action: Type.Union([
    Type.Literal("download_complete"),
    Type.Literal("update_success"),
    Type.Literal("update_fail"),
  ]),
  version_build: Type.Optional(Type.String()),
  version_name: Type.Optional(Type.String()),
})

export const downloadParamsSchema = Type.Object({
  bundleId: Type.String(),
})
