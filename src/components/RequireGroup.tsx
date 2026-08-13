import { Navigate, Outlet } from 'react-router-dom'
import { useGroup } from '../context/GroupContext'
import { Spinner } from './ui'

/** Sin grupo no hay nada que enseñar: se manda a crear o unirse a uno. */
export function RequireGroup() {
  const { group, groups, loading } = useGroup()

  if (loading) return <Spinner label="Cargando tu grupo…" />
  if (!group && groups.length === 0) return <Navigate to="/grupo/nuevo" replace />

  return <Outlet />
}
