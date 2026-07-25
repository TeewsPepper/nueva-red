import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iglesia-app')
    
    console.log('🔄 Creando usuario pastor...')

    const adminData = {
      name: 'Pastor Admin',
      email: 'pastor@iglesia.com',
      password: 'Pastor123!',
      role: 'pastor' as const,
      churchName: 'Iglesia Central',
      phone: '+1234567890',
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ email: adminData.email })
    if (existingUser) {
      console.log('⚠️ El usuario pastor ya existe')
      console.log(`📧 Email: ${existingUser.email}`)
      console.log(`👤 Rol: ${existingUser.role}`)
      await mongoose.disconnect()
      return
    }

    const user = await User.create(adminData)
    
    console.log('✅ Usuario pastor creado exitosamente:')
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Nombre: ${user.name}`)
    console.log(`🔑 Rol: ${user.role}`)
    console.log(`🔐 Contraseña: ${adminData.password}`)

    await mongoose.disconnect()
    console.log('\n✅ Proceso completado')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()