import z from "@zod/zod"

export const Customer = z.object({
  id: z.number().positive(),
  name: z.string().nonempty(),
})
