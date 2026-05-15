import { z } from "zod";

export const createPasarSchema = z.object({
  nama: z.string().min(1, "Nama pasar wajib diisi"),
  alamat: z.string().optional(),
  deskripsi: z.string().optional(),
  denahUrl: z.string().url().optional(),
  scaleX: z.number().positive().optional(),
  scaleY: z.number().positive().optional(),
  originX: z.number().optional(),
  originY: z.number().optional(),
});

export const updatePasarSchema = createPasarSchema.partial();

export type CreatePasarInput = z.infer<typeof createPasarSchema>;
export type UpdatePasarInput = z.infer<typeof updatePasarSchema>;
