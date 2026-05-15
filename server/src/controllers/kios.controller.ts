import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { CreateKiosInput, UpdateKiosInput } from "../validations/kios.validation";
import { Kategori } from "@prisma/client";

type IdReq = Request<{ id: string }>;

export async function getAllKios(req: Request, res: Response, next: NextFunction) {
  try {
    const pasarId  = req.query.pasarId  ? String(req.query.pasarId)  : undefined;
    const kategori = req.query.kategori ? String(req.query.kategori) : undefined;
    const search   = req.query.search   ? String(req.query.search)   : undefined;

    const kios = await prisma.kios.findMany({
      where: {
        ...(pasarId  ? { pasarId }                        : {}),
        ...(kategori ? { kategori: kategori as Kategori } : {}),
        ...(search
          ? {
              OR: [
                { nama:    { contains: search } },
                { nomor:   { contains: search } },
                { pemilik: { contains: search } },
              ],
            }
          : {}),
      },
      include: { pasar: { select: { id: true, nama: true } } },
      orderBy: [{ blok: "asc" }, { nomor: "asc" }],
    });
    sendSuccess(res, kios);
  } catch (err) {
    next(err);
  }
}

export async function getKiosById(req: IdReq, res: Response, next: NextFunction) {
  try {
    const kios = await prisma.kios.findUnique({
      where: { id: req.params.id },
      include: { pasar: { select: { id: true, nama: true } } },
    });
    if (!kios) return sendError(res, "Kios tidak ditemukan", 404);
    sendSuccess(res, kios);
  } catch (err) {
    next(err);
  }
}

export async function createKios(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as CreateKiosInput;
    const pasarExists = await prisma.pasar.findUnique({ where: { id: body.pasarId } });
    if (!pasarExists) return sendError(res, "Pasar tidak ditemukan", 404);

    const kios = await prisma.kios.create({
      data: body,
      include: { pasar: { select: { id: true, nama: true } } },
    });
    sendSuccess(res, kios, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateKios(req: IdReq, res: Response, next: NextFunction) {
  try {
    const body = req.body as UpdateKiosInput;
    const kios = await prisma.kios.update({
      where: { id: req.params.id },
      data: body,
      include: { pasar: { select: { id: true, nama: true } } },
    });
    sendSuccess(res, kios);
  } catch (err) {
    next(err);
  }
}

export async function deleteKios(req: IdReq, res: Response, next: NextFunction) {
  try {
    await prisma.kios.delete({ where: { id: req.params.id } });
    sendSuccess(res, { id: req.params.id });
  } catch (err) {
    next(err);
  }
}
