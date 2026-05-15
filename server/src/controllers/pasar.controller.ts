import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { CreatePasarInput, UpdatePasarInput } from "../validations/pasar.validation";

type IdReq = Request<{ id: string }>;

export async function getAllPasar(_req: Request, res: Response, next: NextFunction) {
  try {
    const pasars = await prisma.pasar.findMany({
      include: { _count: { select: { kios: true } } },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, pasars);
  } catch (err) {
    next(err);
  }
}

export async function getPasarById(req: IdReq, res: Response, next: NextFunction) {
  try {
    const pasar = await prisma.pasar.findUnique({
      where: { id: req.params.id },
      include: { kios: { orderBy: { nomor: "asc" } } },
    });
    if (!pasar) return sendError(res, "Pasar tidak ditemukan", 404);
    sendSuccess(res, pasar);
  } catch (err) {
    next(err);
  }
}

export async function createPasar(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as CreatePasarInput;
    const pasar = await prisma.pasar.create({ data: body });
    sendSuccess(res, pasar, 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePasar(req: IdReq, res: Response, next: NextFunction) {
  try {
    const body = req.body as UpdatePasarInput;
    const pasar = await prisma.pasar.update({
      where: { id: req.params.id },
      data: body,
    });
    sendSuccess(res, pasar);
  } catch (err) {
    next(err);
  }
}

export async function deletePasar(req: IdReq, res: Response, next: NextFunction) {
  try {
    await prisma.pasar.delete({ where: { id: req.params.id } });
    sendSuccess(res, { id: req.params.id });
  } catch (err) {
    next(err);
  }
}
