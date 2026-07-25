import express from 'express'
import authRoutes from './auth.js'
import ministeriosRoutes from './ministerios.js'
import tareasRoutes from './tareas.js'
import eventosRoutes from './eventos.js'
import breakRoutes from './break.js'
import usuariosRoutes from './usuarios.js'
import solicitudesRoutes from './solicitudes.js'
import postsRoutes from './posts.js'           
import commentsRoutes from './comments.js'     
import prayersRoutes from './prayers.js'       
import notificationsRoutes from './notifications.js'

import testRoutes from './test.js'

const router = express.Router()

// Rutas existentes
router.use('/auth', authRoutes)
router.use('/ministerios', ministeriosRoutes)
router.use('/tareas', tareasRoutes)
router.use('/eventos', eventosRoutes)
router.use('/break', breakRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/solicitudes', solicitudesRoutes)

// Nuevas rutas
router.use('/posts', postsRoutes)
router.use('/comments', commentsRoutes)
router.use('/prayers', prayersRoutes)
router.use('/notifications', notificationsRoutes)

// 👇 RUTAS DE PRUEBA (solo para desarrollo)
router.use('/test', testRoutes)

export default router