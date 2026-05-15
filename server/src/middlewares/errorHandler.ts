import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("[Error]", err.message);

  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2025") {
      res.status(404).json({ success: false, message: "Data tidak ditemukan" });
      return;
    }
    if (prismaErr.code === "P2002") {
      res.status(409).json({ success: false, message: "Data sudah ada (duplikat)" });
      return;
    }
  }

  res.status(500).json({ success: false, message: "Internal server error" });
}
