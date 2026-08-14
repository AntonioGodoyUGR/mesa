import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '../lib/api'
import { useGroup } from '../context/GroupContext'
import { ErrorNote, PageHeader } from '../components/ui'

/** Crear un grupo privado o unirse a uno con el código de invitación. */
export function GroupSetupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { groups, setGroupId } = useGroup()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const create = useMutation({
    mutationFn: (groupName: string) => api.createGroup(groupName.trim()),
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
      setGroupId(group.id)
      navigate('/', { replace: true })
    },
  })

  const join = useMutation({
    mutationFn: (joinCode: string) => api.joinGroup(joinCode.trim().toUpperCase()),
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
      setGroupId(group.id)
      navigate('/', { replace: true })
    },
  })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tu grupo"
        subtitle="Las partidas son privadas: solo las ve quien esté en el grupo."
      />

      <section className="card flex flex-col gap-3 p-4">
        <h2 className="display text-base">Crear un grupo</h2>
        <input
          className="input"
          placeholder="Los del jueves"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
        />
        <ErrorNote error={create.error} />
        <button
          type="button"
          className="btn btn-primary"
          disabled={!name.trim() || create.isPending}
          onClick={() => create.mutate(name)}
        >
          {create.isPending ? 'Creando…' : 'Crear grupo'}
        </button>
      </section>

      <section className="card flex flex-col gap-3 p-4">
        <h2 className="display text-base">Unirte con un código</h2>
        <input
          className="input tracking-[0.3em] uppercase"
          placeholder="XXXXXX"
          value={code}
          maxLength={6}
          autoCapitalize="characters"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
        <ErrorNote error={join.error} />
        <button
          type="button"
          className="btn btn-ghost"
          disabled={code.trim().length < 4 || join.isPending}
          onClick={() => join.mutate(code)}
        >
          {join.isPending ? 'Entrando…' : 'Unirme'}
        </button>
      </section>

      {groups.length > 0 && (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate('/', { replace: true })}
        >
          Volver
        </button>
      )}
    </div>
  )
}
