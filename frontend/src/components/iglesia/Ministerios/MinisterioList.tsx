import React from 'react'
import { FolderOpen, PlusCircle } from 'lucide-react'
import { MinisterioCard } from './MinisterioCard'
import { MinisterioForm } from './MinisterioForm'
import { Ministerio } from '../../../types'

interface MinisterioListProps {
  ministerios: Ministerio[]
  loading: boolean
  canCreate: boolean
  canEdit: (ministerio: Ministerio) => boolean
  canDelete: boolean
  showForm: boolean
  editData: Ministerio | null
  onNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onFormSuccess: () => void
  onFormCancel: () => void
}

export const MinisterioList: React.FC<MinisterioListProps> = ({
  ministerios,
  loading,
  canCreate,
  canEdit,
  canDelete,
  showForm,
  editData,
  onNew,
  onEdit,
  onDelete,
  onFormSuccess,
  onFormCancel
}) => {
  if (loading) {
    return <div className="loading-spinner">Cargando...</div>
  }

  return (
    <div>
      {canCreate && (
        <div className="section-header">
          <h2>Ministerios</h2>
          <button className="btn-iglesia btn-primary-iglesia" onClick={onNew}>
            <PlusCircle size={18} />
            Nuevo Ministerio
          </button>
        </div>
      )}

      {showForm && (
        <MinisterioForm
          onSuccess={onFormSuccess}
          onCancel={onFormCancel}
          editData={editData}
        />
      )}

      {ministerios.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} className="empty-icon" />
          <p>No hay ministerios</p>
          {canCreate ? (
            <p className="empty-sub">Crea tu primer ministerio con el botón de arriba</p>
          ) : (
            <p className="empty-sub">Los ministerios serán creados por pastores y líderes</p>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {ministerios.map((m) => (
            <MinisterioCard
              key={m._id}
              ministerio={m}
              canEdit={canEdit(m)}
              canDelete={canDelete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}