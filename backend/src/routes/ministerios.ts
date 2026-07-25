import express from "express";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import Ministerio from "../models/Ministerio.js";
import { IUser } from "../models/User.js";

const router = express.Router();

// GET /api/ministerios - Todos pueden ver
router.get("/", async (req, res) => {
  try {
    const ministerios = await Ministerio.find()
      .populate("liderId", "name email")
      .populate("miembros", "name email");

    res.json({ success: true, data: ministerios });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener ministerios" });
  }
});

// POST /api/ministerios - Solo pastor y líder
router.post(
  "/",
  protect,
  requireRole(["pastor", "lider"]),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const { nombre, descripcion, liderId } = req.body;

      // Si es líder, solo puede crear ministerios donde él es el líder
      if (user.role === "lider" && liderId !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message:
            "Los líderes solo pueden crear ministerios donde ellos son el líder",
        });
      }

      const ministerio = await Ministerio.create({
        nombre,
        descripcion,
        liderId: liderId || user._id,
        horarios: req.body.horarios || [], // ✅ Asegurar que se guarda
        ubicacion: req.body.ubicacion || "Salón",
        creadoPor: user._id,
      });

      res.status(201).json({ success: true, data: ministerio });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al crear ministerio" });
    }
  },
);

// PUT /api/ministerios/:id - Pastor o líder (solo el suyo)
router.put(
  "/:id",
  protect,
  requireRole(["pastor", "lider"]),
  async (req, res) => {
    try {
      const user = req.user as IUser;
      const ministerio = await Ministerio.findById(req.params.id);

      if (!ministerio) {
        return res
          .status(404)
          .json({ success: false, message: "Ministerio no encontrado" });
      }

      // Si es líder, verificar que lidera este ministerio
      if (
        user.role === "lider" &&
        ministerio.liderId.toString() !== user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para editar este ministerio",
        });
      }

      const ministerioActualizado = await Ministerio.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );

      res.json({ success: true, data: ministerioActualizado });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar ministerio" });
    }
  },
);

// DELETE /api/ministerios/:id - Solo pastor
router.delete("/:id", protect, requireRole(["pastor"]), async (req, res) => {
  try {
    const ministerio = await Ministerio.findByIdAndDelete(req.params.id);

    if (!ministerio) {
      return res
        .status(404)
        .json({ success: false, message: "Ministerio no encontrado" });
    }

    res.json({ success: true, message: "Ministerio eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar ministerio" });
  }
});

export default router;
