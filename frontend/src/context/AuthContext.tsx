import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  User,
  RegisterData,
  AuthContextType,
  ApiError,
  ApiResponse,
} from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helpers de roles
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const canCreateMinisterio = (): boolean => hasRole(["pastor", "lider"]);
  const canCreateEvento = (): boolean => hasRole(["pastor", "lider"]);
  const canCreateTarea = (): boolean => hasRole(["pastor", "lider", "miembro"]);
  const canCreateActividad = (): boolean =>
    hasRole(["pastor", "lider", "miembro"]);
  const canJoinActividad = (): boolean =>
    hasRole(["pastor", "lider", "miembro", "visitante"]);
  const isAdmin = (): boolean => hasRole("pastor");
  const isLider = (): boolean => hasRole("lider");
  const isMiembro = (): boolean => hasRole("miembro");
  const isVisitante = (): boolean => hasRole("visitante");

  // Verificar token al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get<ApiResponse<User>>("/auth/verify");
          if (response.data.success) {
            const userData = response.data.data;
            if (userData) {
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete api.defaults.headers.common["Authorization"];
          }
        }
      } catch (err) {
        const apiError = err as ApiError;
        console.error(
          "Error al verificar token:",
          apiError.response?.data?.message,
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<
        ApiResponse<{ user: User; token: string }>
      >("/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        window.dispatchEvent(new Event("authChange"));
        console.log("✅ Evento authChange disparado para conectar socket");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Error al iniciar sesión");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<
        ApiResponse<{ user: User; token: string }>
      >("/auth/register", userData);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Error al registrarse");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("🚪 Cerrando sesión...");

      try {
        await api.post("/auth/logout");
        console.log("✅ Sesión cerrada en servidor");
      } catch (serverError) {
        console.warn(
          "⚠️ Error en servidor, limpiando estado local:",
          serverError,
        );
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      console.log("✅ Estado de autenticación limpiado");

      navigate("/login");
    }
  };

  // Verificar token
  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get<ApiResponse<User>>("/auth/verify");

      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        return true;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        return false;
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    verifyToken,
    hasRole,
    canCreateMinisterio,
    canCreateEvento,
    canCreateTarea,
    canCreateActividad,
    canJoinActividad,
    isAdmin,
    isLider,
    isMiembro,
    isVisitante,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
