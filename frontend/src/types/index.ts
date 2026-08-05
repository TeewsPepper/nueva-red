// ========================================
// TIPOS DE USUARIO
// ========================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "pastor" | "lider" | "miembro" | "visitante";
  churchName?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "pastor" | "lider" | "miembro" | "visitante";
  churchName?: string;
  phone?: string;
}

// ========================================
// TIPOS DE MINISTERIO
// ========================================

export interface Ministerio {
  _id: string;
  nombre: string;
  descripcion: string;
  liderId: string | User;
  miembros: (string | User)[];
  color?: string;
  horarios?: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>;
  ubicacion?: string;
  creadoPor: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE EVENTO
// ========================================

export interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  ministerioId?: string | Ministerio;
  creadoPor: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE TAREA
// ========================================

export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "pendiente" | "en_progreso" | "completada";
  fechaEntrega: string;
  asignadoA: string | User;
  creadoPor: string | User;
  completada: boolean;
  completadaEn?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE ACTIVIDAD BREAK
// ========================================

export interface BreakActivity {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  maxParticipantes?: number;
  participantes: (string | User)[];
  creadoPor: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE SOLICITUD
// ========================================

export interface SolicitudMinisterio {
  _id: string;
  nombre: string;
  descripcion: string;
  liderPropuesto: string | User;
  creadorId: string | User;
  estado: "pendiente" | "aprobada" | "rechazada";
  rechazoMotivo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE PUBLICACIONES (FEED)
// ========================================

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  image?: string;
  ministryId?: string;
  likes: string[];
  comments: Comment[];
  commentCount?: number;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  likes: string[];
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface NuevoComentarioData {
  postId: string;
  comment: Comment;
  parentId: string | null;
  totalComments: number
}

export interface ComentarioLikeUpdateData {
  commentId: string;
  likes: string[];
}

// ========================================
// TIPOS DE ORACIONES
// ========================================

export interface PrayerRequest {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  title: string;
  description: string;
  isAnonymous: boolean;
  prayers: string[];
  isAnswered: boolean;
  answeredAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE NOTIFICACIONES
// ========================================

export interface Notification {
  _id: string;
  user: string;
  type: "like" | "comment" | "prayer" | "event" | "system" | "like_comment";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS DE ERRORES DE API
// ========================================

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: string[];
    };
    status?: number;
  };
  message?: string;
}

// ========================================
// TIPOS DE RESPUESTAS DE API
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  count?: number;
}

// Respuesta específica para notificaciones
export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  message?: string;
}

// ========================================
// TIPOS DE CONTEXTOS
// ========================================

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  hasRole: (roles: string | string[]) => boolean;
  canCreateMinisterio: () => boolean;
  canCreateEvento: () => boolean;
  canCreateTarea: () => boolean;
  canCreateActividad: () => boolean;
  canJoinActividad: () => boolean;
  isAdmin: () => boolean;
  isLider: () => boolean;
  isMiembro: () => boolean;
  isVisitante: () => boolean;
}

// ========================================
// TIPOS PARA EL DASHBOARD
// ========================================

export interface MinisterioEdit {
  _id: string;
  nombre: string;
  descripcion: string;
  liderId: string | User;
  miembros: (string | User)[];
  horarios?: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>;
  ubicacion?: string;
  creadoPor: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventoEdit {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  ministerioId?: string | Ministerio;
  creadoPor: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TareaEdit {
  _id: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "pendiente" | "en_progreso" | "completada";
  fechaEntrega: string;
  asignadoA: string | User;
  creadoPor: string | User;
  completada: boolean;
  completadaEn?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActividadEdit {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  maxParticipantes?: number;
  participantes: (string | User)[];
  creadoPor: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIPOS PARA SOCKET.IO
// ========================================

export interface NuevoPostData {
  postId: string;
  author: string;
  content: string;
}

export interface LikeUpdateData {
  postId: string;
  likes: string[];
}

export interface NotificacionData {
  userId: string;
  type: string;
  message: string;
  link: string;
}

export interface NuevoComentarioData {
  postId: string;
  comment: Comment;
}

export interface ComentarioLikeUpdateData {
  commentId: string;
  likes: string[];
}

// 👇 TIPO GENÉRICO PARA CALLBACKS
export type SocketEventCallback<T = any> = (data: T) => void;
