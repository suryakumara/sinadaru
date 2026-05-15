import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = process.env.EXPO_PUBLIC_API_URL;

export interface Kios {
  id: string;
  nama: string;
  pemilik?: string | null;
  kategori: "SAYUR" | "DAGING" | "IKAN" | "BUMBU" | "LAINNYA";
  blok: string;
  nomor: string;
  posisiX?: number | null;
  posisiY?: number | null;
  deskripsi?: string | null;
  pasarId: string;
  pasar?: { id: string; nama: string };
}

export interface CreateKiosInput {
  nama: string;
  pemilik?: string;
  kategori: Kios["kategori"];
  blok: string;
  nomor: string;
  pasarId: string;
  posisiX?: number;
  posisiY?: number;
  deskripsi?: string;
}

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useKiosList(pasarId?: string, search?: string, kategori?: string) {
  const params = new URLSearchParams();
  if (pasarId) params.set("pasarId", pasarId);
  if (search) params.set("search", search);
  if (kategori) params.set("kategori", kategori);

  return useQuery<{ success: boolean; data: Kios[] }>({
    queryKey: ["kios", pasarId, search, kategori],
    queryFn: () => fetchJSON(`${API}/api/kios?${params}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKiosInput) =>
      fetchJSON(`${API}/api/kios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kios"] }),
  });
}

export function useUpdateKios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateKiosInput> }) =>
      fetchJSON(`${API}/api/kios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kios"] }),
  });
}

export function useDeleteKios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJSON(`${API}/api/kios/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kios"] }),
  });
}
