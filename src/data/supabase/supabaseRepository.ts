import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import type { GardenMember } from '@/domain'
import type { GardenRepository } from '../repository'
import { PHOTO_BUCKET } from './client'
import {
  fromPlant,
  fromZone,
  toCareTask,
  toCompanionRule,
  toGarden,
  toMember,
  toPlant,
  toSpecies,
  toZone,
  type CareTaskRow,
  type CompanionRuleRow,
  type GardenRow,
  type MemberRow,
  type PlantRow,
  type SpeciesRow,
  type ZoneRow,
} from './mappers'

/** Lanza el error de Supabase (si lo hay) y devuelve los datos tipados. */
function unwrap<T>({ data, error }: { data: unknown; error: PostgrestError | null }): T {
  if (error) throw new Error(error.message)
  return data as T
}

/** Repositorio real: Postgres con RLS y Storage para las fotos. */
export function createSupabaseRepository(db: SupabaseClient): GardenRepository {
  async function currentUserId(): Promise<string> {
    const { data } = await db.auth.getUser()
    if (!data.user) throw new Error('No hay sesión iniciada')
    return data.user.id
  }

  return {
    mode: 'supabase',

    // ---------- Catálogo ----------
    listSpecies: async () =>
      unwrap<SpeciesRow[]>(await db.from('species').select('*').order('name')).map(toSpecies),
    listCompanionRules: async () =>
      unwrap<CompanionRuleRow[]>(await db.from('companion_rules').select('*')).map(toCompanionRule),

    // ---------- Jardines ----------
    listGardens: async () =>
      unwrap<GardenRow[]>(await db.from('gardens').select('id, name, cols, rows, climate').order('created_at')).map(toGarden),
    createGarden: async (input) =>
      toGarden(
        unwrap<GardenRow>(
          await db.from('gardens').insert({ ...input, owner_id: await currentUserId() }).select('id, name, cols, rows, climate').single(),
        ),
      ),
    updateGarden: async (g) =>
      toGarden(
        unwrap<GardenRow>(
          await db
            .from('gardens')
            .update({ name: g.name, cols: g.cols, rows: g.rows, climate: g.climate })
            .eq('id', g.id)
            .select('id, name, cols, rows, climate')
            .single(),
        ),
      ),

    // ---------- Zonas ----------
    listZones: async (gardenId) =>
      unwrap<ZoneRow[]>(await db.from('zones').select('*').eq('garden_id', gardenId)).map(toZone),
    createZone: async (z) => toZone(unwrap<ZoneRow>(await db.from('zones').insert(fromZone(z)).select().single())),
    updateZone: async (z) =>
      toZone(unwrap<ZoneRow>(await db.from('zones').update(fromZone(z)).eq('id', z.id).select().single())),
    deleteZone: async (id) => {
      unwrap(await db.from('zones').delete().eq('id', id))
    },

    // ---------- Plantas ----------
    listPlants: async (gardenId) =>
      unwrap<PlantRow[]>(await db.from('plants').select('*').eq('garden_id', gardenId)).map(toPlant),
    createPlant: async (p) => toPlant(unwrap<PlantRow>(await db.from('plants').insert(fromPlant(p)).select().single())),
    updatePlant: async (p) =>
      toPlant(unwrap<PlantRow>(await db.from('plants').update(fromPlant(p)).eq('id', p.id).select().single())),
    deletePlant: async (id) => {
      unwrap(await db.from('plants').delete().eq('id', id))
    },
    uploadPhoto: async (gardenId, plantId, file) => {
      const path = `${gardenId}/${plantId}-${Date.now()}.jpg`
      const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: 'image/jpeg' })
      if (error) throw new Error(error.message)
      return db.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
    },

    // ---------- Cuidados ----------
    listCareTasks: async (gardenId) =>
      unwrap<CareTaskRow[]>(await db.from('care_tasks').select('*').eq('garden_id', gardenId)).map(toCareTask),
    completeCareTask: async (t) =>
      toCareTask(
        unwrap<CareTaskRow>(
          await db
            .from('care_tasks')
            .insert({ garden_id: t.gardenId, plant_id: t.plantId, kind: t.kind, done_on: t.doneOn })
            .select()
            .single(),
        ),
      ),
    undoCareTask: async (id) => {
      unwrap(await db.from('care_tasks').delete().eq('id', id))
    },

    // ---------- Miembros e invitaciones ----------
    listMembers: async (gardenId) => {
      const members = unwrap<MemberRow[]>(
        await db.from('garden_members').select('garden_id, user_id, email, role').eq('garden_id', gardenId),
      ).map(toMember)
      const invites = unwrap<{ email: string }[]>(
        await db.from('garden_invites').select('email').eq('garden_id', gardenId),
      ).map((i): GardenMember => ({ gardenId, userId: `invite:${i.email}`, email: i.email, role: 'invited' }))
      return [...members, ...invites]
    },
    inviteMember: async (gardenId, email) => {
      const { error } = await db
        .from('garden_invites')
        .insert({ garden_id: gardenId, email: email.trim().toLowerCase() })
      // 23505 = ya estaba invitado: no es un error para el usuario.
      if (error && error.code !== '23505') throw new Error(error.message)
    },
    removeMember: async (gardenId, userId) => {
      if (userId.startsWith('invite:')) {
        const email = userId.slice('invite:'.length)
        unwrap(await db.from('garden_invites').delete().eq('garden_id', gardenId).eq('email', email))
      } else {
        unwrap(await db.from('garden_members').delete().eq('garden_id', gardenId).eq('user_id', userId))
      }
    },

    // ---------- Tiempo real ----------
    subscribe: (gardenId, onChange) => {
      const channel = db.channel(`garden:${gardenId}`)
      for (const table of ['plants', 'care_tasks', 'zones'] as const) {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: `garden_id=eq.${gardenId}` },
          () => onChange(table),
        )
      }
      channel.subscribe()
      return () => void db.removeChannel(channel)
    },
  }
}
