// Genera supabase/migrations/*_seed.sql a partir del catálogo JSON de src/data/seed.
// Así el modo demo y Supabase usan exactamente las mismas especies.
// Uso: npm run seed:sql
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('..', import.meta.url)
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'))
const species = read('src/data/seed/species.json')
const rules = read('src/data/seed/companions.json')

const str = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replaceAll("'", "''")}'`)
const num = (v) => (v === null || v === undefined ? 'null' : String(v))
const arr = (v) => `'{${v.join(',')}}'`

const speciesRows = species.map(
  (s) =>
    `  (${str(s.id)}, ${str(s.name)}, ${str(s.scientificName)}, ${str(s.emoji)}, ${str(s.category)}, ` +
    `${num(s.care.riego)}, ${num(s.care.poda)}, ${num(s.care.abonado)}, ` +
    `${arr(s.plantingMonths.templado)}, ${arr(s.plantingMonths.subtropical)})`,
)

const ruleRows = rules.map(
  (r) => `  (${str(r.speciesA)}, ${str(r.speciesB)}, ${str(r.kind)}, ${str(r.note)})`,
)

const sql = `-- =============================================================
-- Mi Jardín · Datos semilla
-- ARCHIVO GENERADO con \`npm run seed:sql\` a partir de src/data/seed/*.json. No editar a mano.
-- =============================================================

insert into public.species
  (id, name, scientific_name, emoji, category, care_riego, care_poda, care_abonado, planting_templado, planting_subtropical)
values
${speciesRows.join(',\n')}
on conflict (id) do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  emoji = excluded.emoji,
  category = excluded.category,
  care_riego = excluded.care_riego,
  care_poda = excluded.care_poda,
  care_abonado = excluded.care_abonado,
  planting_templado = excluded.planting_templado,
  planting_subtropical = excluded.planting_subtropical;

insert into public.companion_rules (species_a, species_b, kind, note)
values
${ruleRows.join(',\n')}
on conflict (species_a, species_b) do update set
  kind = excluded.kind,
  note = excluded.note;
`

const out = fileURLToPath(new URL('supabase/migrations/20261123000003_seed.sql', root))
writeFileSync(out, sql)
console.log(`Escrito ${out}: ${species.length} especies, ${rules.length} asociaciones.`)
