import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


export const RegisterPage = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    nombre: '',  // 👈 El usuario ve "nombre" pero...
    telefono: '' 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // 👇 Validar que el nombre no esté vacío
    if (!form.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)
    try {
      // 👇 Transformar los datos para el backend
      const registerData = {
        name: form.nombre.trim(),      // 👈 'nombre' → 'name'
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.telefono.trim() || undefined  // 👈 'telefono' → 'phone'
      }
      
      console.log('📝 Enviando al backend:', registerData)
      
      await register(registerData)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>⛪ Registrarse</h1>
        <p className="auth-subtitle">Crea tu cuenta para acceder al dashboard</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Nombre completo *" 
            value={form.nombre} 
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input 
            type="email" 
            placeholder="Email *" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña (mínimo 6 caracteres) *" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            required 
            minLength={6}
          />
          <input 
            type="text" 
            placeholder="Teléfono (opcional)" 
            value={form.telefono} 
            onChange={(e) => setForm({ ...form, telefono: e.target.value })} 
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  )
}