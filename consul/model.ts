import z from "zod";

export const ServiceAddressResponseSchema = z.array(
  z.object({
    Service: z.object({
      ID: z.string().nonempty(),
      Address: z.string().nonempty(),
      Port: z.number().positive(),
    })
  })
);
