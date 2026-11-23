-- =============================================================
-- Mi Jardín · Datos semilla
-- ARCHIVO GENERADO con `npm run seed:sql` a partir de src/data/seed/*.json. No editar a mano.
-- =============================================================

insert into public.species
  (id, name, scientific_name, emoji, category, care_riego, care_poda, care_abonado, planting_templado, planting_subtropical)
values
  ('tomate', 'Tomate', 'Solanum lycopersicum', '🍅', 'hortaliza', 2, 10, 21, '{3,4,5}', '{1,2,8,9,10,11}'),
  ('albahaca', 'Albahaca', 'Ocimum basilicum', '🌿', 'aromatica', 2, 14, 30, '{4,5,6}', '{2,3,4,5,9,10}'),
  ('lechuga', 'Lechuga', 'Lactuca sativa', '🥬', 'hortaliza', 2, null, 30, '{2,3,4,8,9,10}', '{1,2,3,10,11,12}'),
  ('pimiento', 'Pimiento', 'Capsicum annuum', '🫑', 'hortaliza', 3, null, 21, '{4,5}', '{1,2,3,8,9}'),
  ('berenjena', 'Berenjena', 'Solanum melongena', '🍆', 'hortaliza', 3, null, 21, '{4,5}', '{2,3,4,8,9}'),
  ('calabacin', 'Calabacín', 'Cucurbita pepo', '🥒', 'hortaliza', 2, null, 21, '{4,5,6}', '{2,3,4,9,10}'),
  ('pepino', 'Pepino', 'Cucumis sativus', '🥒', 'hortaliza', 2, null, 21, '{4,5,6}', '{2,3,4,9,10}'),
  ('zanahoria', 'Zanahoria', 'Daucus carota', '🥕', 'hortaliza', 3, null, null, '{2,3,4,7,8}', '{1,2,3,9,10,11,12}'),
  ('cebolla', 'Cebolla', 'Allium cepa', '🧅', 'hortaliza', 4, null, 45, '{1,2,9,10}', '{10,11,12,1}'),
  ('ajo', 'Ajo', 'Allium sativum', '🧄', 'hortaliza', 7, null, null, '{10,11,12}', '{10,11,12}'),
  ('judia', 'Judía verde', 'Phaseolus vulgaris', '🫛', 'hortaliza', 3, null, 30, '{4,5,6}', '{2,3,4,9,10}'),
  ('haba', 'Haba', 'Vicia faba', '🫘', 'hortaliza', 5, null, null, '{10,11,12}', '{10,11,12,1}'),
  ('fresa', 'Fresa', 'Fragaria × ananassa', '🍓', 'frutal', 2, 30, 30, '{3,4,9,10}', '{9,10,11,12}'),
  ('perejil', 'Perejil', 'Petroselinum crispum', '🌱', 'aromatica', 3, null, 45, '{3,4,5,9}', '{1,2,3,9,10,11,12}'),
  ('cilantro', 'Cilantro', 'Coriandrum sativum', '🌱', 'aromatica', 3, null, null, '{3,4,9,10}', '{1,2,10,11,12}'),
  ('romero', 'Romero', 'Salvia rosmarinus', '🌿', 'aromatica', 10, 90, null, '{3,4,9,10}', '{1,2,3,10,11,12}'),
  ('lavanda', 'Lavanda', 'Lavandula angustifolia', '💜', 'aromatica', 10, 180, null, '{3,4,10}', '{1,2,10,11,12}'),
  ('menta', 'Hierbabuena', 'Mentha spicata', '🌿', 'aromatica', 2, 30, 60, '{3,4,5,9}', '{1,2,3,4,9,10,11,12}'),
  ('rosal', 'Rosal', 'Rosa sp.', '🌹', 'ornamental', 3, 60, 30, '{1,2,11,12}', '{11,12,1,2}'),
  ('aloe', 'Aloe vera', 'Aloe vera', '🪴', 'suculenta', 14, null, null, '{4,5,6,7}', '{1,2,3,4,5,6,7,8,9,10,11,12}'),
  ('buganvilla', 'Buganvilla', 'Bougainvillea glabra', '🌺', 'ornamental', 7, 90, 60, '{4,5,6}', '{2,3,4,5,6,9,10}'),
  ('geranio', 'Geranio', 'Pelargonium sp.', '🌸', 'ornamental', 4, 30, 30, '{3,4,5}', '{1,2,3,4,10,11,12}'),
  ('papaya', 'Papaya', 'Carica papaya', '🥭', 'frutal', 4, null, 30, '{}', '{3,4,5,6,7}'),
  ('platanera', 'Platanera', 'Musa acuminata', '🍌', 'frutal', 3, 90, 30, '{}', '{3,4,5,6,9}'),
  ('aguacate', 'Aguacate', 'Persea americana', '🥑', 'frutal', 7, 365, 60, '{4,5}', '{2,3,4,5,9,10}')
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
  ('tomate', 'albahaca', 'compatible', 'La albahaca ahuyenta la mosca blanca'),
  ('tomate', 'zanahoria', 'compatible', 'Raíces a distinta profundidad'),
  ('tomate', 'perejil', 'compatible', 'Atrae insectos beneficiosos'),
  ('tomate', 'cebolla', 'compatible', 'Repele pulgones'),
  ('tomate', 'ajo', 'compatible', 'Ayuda contra hongos y ácaros'),
  ('tomate', 'lechuga', 'compatible', 'La lechuga aprovecha la sombra'),
  ('tomate', 'pepino', 'incompatible', 'Comparten enfermedades (mildiu)'),
  ('tomate', 'berenjena', 'incompatible', 'Misma familia: comparten plagas'),
  ('lechuga', 'zanahoria', 'compatible', null),
  ('lechuga', 'fresa', 'compatible', null),
  ('lechuga', 'cebolla', 'compatible', 'La cebolla aleja a las babosas'),
  ('lechuga', 'perejil', 'incompatible', 'El perejil frena su crecimiento'),
  ('zanahoria', 'cebolla', 'compatible', 'Se protegen de la mosca de la zanahoria'),
  ('zanahoria', 'ajo', 'compatible', null),
  ('zanahoria', 'romero', 'compatible', 'El romero despista a la mosca de la zanahoria'),
  ('judia', 'zanahoria', 'compatible', 'La judía fija nitrógeno'),
  ('judia', 'pepino', 'compatible', null),
  ('judia', 'calabacin', 'compatible', null),
  ('judia', 'berenjena', 'compatible', null),
  ('judia', 'cebolla', 'incompatible', 'Los Allium inhiben a las leguminosas'),
  ('judia', 'ajo', 'incompatible', 'Los Allium inhiben a las leguminosas'),
  ('judia', 'pimiento', 'incompatible', null),
  ('haba', 'cebolla', 'incompatible', 'Los Allium inhiben a las leguminosas'),
  ('haba', 'ajo', 'incompatible', 'Los Allium inhiben a las leguminosas'),
  ('pepino', 'lechuga', 'compatible', null),
  ('fresa', 'ajo', 'compatible', 'Protege de hongos'),
  ('pimiento', 'albahaca', 'compatible', null),
  ('pimiento', 'cebolla', 'compatible', null),
  ('rosal', 'ajo', 'compatible', 'Aleja pulgones del rosal'),
  ('rosal', 'lavanda', 'compatible', 'Atrae polinizadores y repele pulgones'),
  ('menta', 'perejil', 'incompatible', 'La menta invade y compite'),
  ('calabacin', 'pepino', 'incompatible', 'Compiten y comparten oídio')
on conflict (species_a, species_b) do update set
  kind = excluded.kind,
  note = excluded.note;
