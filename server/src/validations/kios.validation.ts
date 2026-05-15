import { z } from "zod";

const KategoriEnum = z.enum(["SAYUR", "DAGING", "IKAN", "BUMBU", "LAINNYA"]);

export const createKiosSchema = z.object({
  nama: z.string().min(1, "Nama kios wajib diisi"),
  pemilik: z.string().optional(),
  kategori: KategoriEnum.default("LAINNYA"),
  blok: z.string().min(1, "Blok wajib diisi"),
  nomor: z.string().min(1, "Nomor kios wajib diisi"),
  posisiX: z.number().optional(),
  posisiY: z.number().optional(),
  deskripsi: z.string().optional(),
  pasarId: z.string().min(1, "Pasar ID wajib diisi"),
});

export const updateKiosSchema = createKiosSchema.omit({ pasarId: true }).partial();

export type CreateKiosInput = z.infer<typeof createKiosSchema>;
export type UpdateKiosInput = z.infer<typeof updateKiosSchema>;
