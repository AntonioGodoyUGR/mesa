import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '../lib/api'
import { useAuth } from './AuthContext'
import type { Group, Player } from '../lib/types'

const ACTIVE_GROUP_KEY = 'mesa.activeGroup'

interface GroupValue {
  groups: Group[]
  group: Group | null
  setGroupId: (id: string) => void
  players: Player[]
  /** El jugador que corresponde a la cuenta con la sesión iniciada. */
  me: Player | null
  loading: boolean
}

const GroupContext = createContext<GroupValue | null>(null)

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [activeId, setActiveId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_GROUP_KEY),
  )

  const groupsQuery = useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => api.listGroups(),
    enabled: !!user,
  })

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data])

  // Si el grupo guardado ya no existe (o aún no hay ninguno elegido), se usa el primero.
  const group = useMemo(() => {
    if (groups.length === 0) return null
    return groups.find((candidate) => candidate.id === activeId) ?? groups[0]
  }, [groups, activeId])

  useEffect(() => {
    if (group && group.id !== activeId) {
      setActiveId(group.id)
      localStorage.setItem(ACTIVE_GROUP_KEY, group.id)
    }
  }, [group, activeId])

  const playersQuery = useQuery({
    queryKey: queryKeys.players(group?.id ?? ''),
    queryFn: () => api.listPlayers(group!.id),
    enabled: !!group,
  })

  const players = useMemo(() => playersQuery.data ?? [], [playersQuery.data])

  const me = useMemo(
    () => players.find((player) => player.user_id && player.user_id === user?.id) ?? null,
    [players, user?.id],
  )

  const value = useMemo<GroupValue>(
    () => ({
      groups,
      group,
      setGroupId: (id: string) => {
        setActiveId(id)
        localStorage.setItem(ACTIVE_GROUP_KEY, id)
      },
      players,
      me,
      loading: groupsQuery.isLoading || (!!group && playersQuery.isLoading),
    }),
    [groups, group, players, me, groupsQuery.isLoading, playersQuery.isLoading],
  )

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}

export function useGroup(): GroupValue {
  const value = useContext(GroupContext)
  if (!value) throw new Error('useGroup debe usarse dentro de <GroupProvider>')
  return value
}
