import React, { useState, useRef } from "react";
import { Send, Image, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useFeed } from "../../hooks/useFeed";
import "./PostForm.css";

interface PostFormProps {
  onPostCreated?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { crearPost } = useFeed();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || loading) return;

    setLoading(true);
    try {
      await crearPost(content.trim(), imageFile); // ✅ Pasar File | null
      setContent("");
      setImageFile(null);
      setImagePreview("");
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Error al crear post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // ✅ Configurar compresión
      const options = {
        maxSizeMB: 1, // Máximo 1MB
        maxWidthOrHeight: 1200, // Máximo 1200px
        useWebWorker: true,
        fileType: "image/webp", // Formato moderno
      };

      const compressedFile = await imageCompression(file, options);

      // Validar que no exceda 5MB después de comprimir
      if (compressedFile.size > 5 * 1024 * 1024) {
        alert(
          "La imagen comprimida aún excede 5MB. Por favor, usa una imagen más pequeña.",
        );
        return;
      }

      setImageFile(compressedFile);

      // Preview de la imagen comprimida
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error al comprimir imagen:", error);
      alert("Error al procesar la imagen. Por favor, intenta con otra.");
    }
  };

  const handleRemoveImage = (): void => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form-input">
        <textarea
          placeholder="¿Qué está pasando en la iglesia?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          disabled={loading}
        />
        <div className="post-form-counter">{content.length}/1000</div>
      </div>

      {imagePreview && (
        <div className="post-form-image-preview">
          <img src={imagePreview} alt="Preview" />
          <button
            type="button"
            className="btn-remove-image"
            onClick={handleRemoveImage}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="post-form-actions">
        <div className="post-form-tools">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="btn-image"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Image size={20} />
            Imagen
          </button>
        </div>
        <button
          type="submit"
          className="btn-post"
          disabled={(!content.trim() && !imageFile) || loading}
        >
          <Send size={18} />
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
};
