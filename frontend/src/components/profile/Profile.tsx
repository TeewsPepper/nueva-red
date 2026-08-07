import React, { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Church,
  Calendar,
  Edit,
  Crown,
  Star,
  Camera,
  X,
} from "lucide-react";
import { ProfileEdit } from "./ProfileEdit";
import api from "../../services/api";
import { User as UserType } from "../../types"; // ✅ Importar el tipo
import "./Profile.css";

interface ProfileProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "pastor" | "lider" | "miembro" | "visitante";
    churchName?: string;
    phone?: string;
    profilePicture?: string | null;
    createdAt?: string;
  } | null;
  onUserUpdate?: (updatedUser: UserType) => void; // ✅ Usar el tipo
}

export const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-error">Usuario no encontrado</div>
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (currentUser.role) {
      case "pastor":
        return <Crown size={20} />;
      case "lider":
        return <Star size={20} />;
      default:
        return <User size={20} />;
    }
  };

  const getRoleColor = () => {
    switch (currentUser.role) {
      case "pastor":
        return "role-pastor";
      case "lider":
        return "role-lider";
      case "miembro":
        return "role-miembro";
      case "visitante":
        return "role-visitante";
      default:
        return "";
    }
  };

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no puede exceder 2MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await api.post(
        `/usuarios/${currentUser._id}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        const updatedUser = response.data.data as UserType;
        console.log("📸 Usuario actualizado desde backend:", updatedUser);

        // ✅ ACTUALIZAR ESTADO LOCAL
        setCurrentUser(updatedUser);

        // ✅ ACTUALIZAR CONTEXTO Y LOCALSTORAGE
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }

        // ✅ GUARDAR DIRECTAMENTE EN LOCALSTORAGE POR SI ACASO
        const userToSave = {
          ...updatedUser,
          profilePicture: updatedUser.profilePicture || null,
        };
        localStorage.setItem("user", JSON.stringify(userToSave));

        // ✅ VERIFICAR
        console.log(
          "💾 localStorage después de guardar:",
          localStorage.getItem("user"),
        );
      }
    } catch (error) {
      console.error("Error al subir foto:", error);
      alert("Error al subir la foto de perfil");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!confirm("¿Estás seguro de eliminar tu foto de perfil?")) return;

    setUploading(true);

    try {
      const response = await api.delete(
        `/usuarios/${currentUser._id}/profile-picture`,
      );

      if (response.data.success) {
        const updatedUser = response.data.data as UserType; // ✅ Tipar la respuesta
        setCurrentUser(updatedUser);
        if (onUserUpdate) onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      alert("Error al eliminar la foto de perfil");
    } finally {
      setUploading(false);
    }
  };

  if (isEditing) {
    return (
      <ProfileEdit
        user={currentUser}
        onCancel={() => setIsEditing(false)}
        onSave={() => {
          setIsEditing(false);
          api.get("/auth/me").then((res) => {
            if (res.data.success) {
              setCurrentUser(res.data.data);
              if (onUserUpdate) onUserUpdate(res.data.data);
            }
          });
        }}
      />
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-cover" />

        <div className="profile-body">
          <div className="profile-avatar-wrapper">
            <div className={`profile-avatar ${getRoleColor()}`}>
              {currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="profile-avatar-image"
                />
              ) : (
                getRoleIcon()
              )}

              <div className="profile-avatar-actions">
                <button
                  className="btn-change-photo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Cambiar foto de perfil"
                >
                  <Camera size={16} />
                </button>
                {currentUser.profilePicture && (
                  <button
                    className="btn-remove-photo"
                    onClick={handleRemoveProfilePicture}
                    disabled={uploading}
                    title="Eliminar foto de perfil"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleProfilePictureUpload}
              style={{ display: "none" }}
            />
          </div>

          {uploading && (
            <div className="profile-uploading">
              <div className="spinner-small"></div>
              <span>Subiendo foto...</span>
            </div>
          )}

          <div className="profile-info">
            <h1 className="profile-name">{currentUser.name}</h1>
            <span className={`profile-role-badge ${getRoleColor()}`}>
              {currentUser.role.charAt(0).toUpperCase() +
                currentUser.role.slice(1)}
            </span>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <Mail size={18} />
              <span>{currentUser.email}</span>
            </div>

            {currentUser.phone && (
              <div className="profile-detail">
                <Phone size={18} />
                <span>{currentUser.phone}</span>
              </div>
            )}

            {currentUser.churchName && (
              <div className="profile-detail">
                <Church size={18} />
                <span>{currentUser.churchName}</span>
              </div>
            )}

            {currentUser.createdAt && (
              <div className="profile-detail">
                <Calendar size={18} />
                <span>
                  Miembro desde:{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <button
            className="btn-edit-profile"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={18} />
            Editar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};
