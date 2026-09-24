import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faunaApi } from '../../services/faunaApi';
import { categoryApi } from '../../services/categoryApi';
import { assetUrl } from '../../utils/assetUrl';
import { CONSERVATION_STATUSES } from '../../utils/conservationStatus';
import LocationPointsEditor from '../../components/species/LocationPointsEditor';
import RegionSelectList from '../../components/species/RegionSelectList';
import SpeciesFormSections from '../../components/species/SpeciesFormSections';
import { FAUNA_SECTIONS, FAUNA_EXTRA_EMPTY } from '../../config/faunaFields';
import { useToast } from '../../components/common/ToastContext';

const EMPTY_FORM = {
  name: '', scientific_name: '', category_id: '', family: '',
  conservation_status: 'DD', description: '', habitat: '', diet: '', reproduction: '',
  behavior: '', status: 'published',
  ...FAUNA_EXTRA_EMPTY,
};

/**
 * CRUD Faune côté Membre (identique pour Admin/SuperAdmin, qui réutilisent ce composant).
 * Item : barre de recherche pour retrouver une fiche existante avant de la modifier.
 * Item : régions en liste déroulante manuelle (bouton +), séparées du GPS.
 * Item : un ou plusieurs points GPS (bouton Ajouter, à la main ou via la carte).
 */
export default function MemberFaunaManager() {
  const qc = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['fauna', 'member', search], queryFn: () => faunaApi.list({ limit: 100, q: search }) });
  const categories = useQuery({ queryKey: ['categories', 'fauna'], queryFn: () => categoryApi.list({ type: 'fauna' }) });

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [points, setPoints] = useState([]);
  const [regionIds, setRegionIds] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  // Aperçus des photos en attente d'envoi (recalculés à chaque ajout/retrait), URL libérées ensuite.
  const pendingPreviews = React.useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  React.useEffect(() => () => pendingPreviews.forEach((u) => URL.revokeObjectURL(u)), [pendingPreviews]);

  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM); setPoints([]); setRegionIds([]); setFiles([]); setExistingImages([]); };

  const startEdit = async (f) => {
    const full = (await faunaApi.get(f.id)).data;
    setEditingId(full.id);
    const extra = {};
    Object.keys(FAUNA_EXTRA_EMPTY).forEach((k) => { extra[k] = full[k] ?? ''; });
    setForm({
      name: full.name ?? '', scientific_name: full.scientific_name ?? '', category_id: full.category_id ?? '',
      family: full.family ?? '', conservation_status: full.conservation_status ?? 'DD',
      description: full.description ?? '', habitat: full.habitat ?? '', diet: full.diet ?? '',
      reproduction: full.reproduction ?? '', behavior: full.behavior ?? '', status: full.status ?? 'published',
      ...extra,
    });
    setPoints(full.locations ?? []);
    setRegionIds((full.regions ?? []).map((r) => String(r.id)));
    setFiles([]);
    setExistingImages(full.images ?? []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeImageMutation = useMutation({
    mutationFn: (imageId) => faunaApi.removeImage(imageId),
    onSuccess: (_, imageId) => {
      setExistingImages((imgs) => imgs.filter((i) => i.id !== imageId));
      qc.invalidateQueries({ queryKey: ['fauna'] });
      toast.success('Photo supprimée');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('locations_touched', '1');
      fd.append('locations_json', JSON.stringify(points.filter((p) => p.latitude && p.longitude)));
      fd.append('regions_touched', '1');
      regionIds.filter(Boolean).forEach((id) => fd.append('region_ids[]', id));
      files.forEach((f) => fd.append('images[]', f));
      // La première photo ajoutée (quand il n'y en a encore aucune) devient la principale.
      // S'il y a déjà une photo existante, on n'y touche pas : les nouvelles s'ajoutent
      // simplement à la suite, dans l'ordre de sélection, sans changer la principale.
      if (files.length && existingImages.length === 0) fd.append('primary_index', 0);
      return editingId ? faunaApi.update(editingId, fd) : faunaApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fauna'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(editingId ? 'Espèce mise à jour' : 'Espèce ajoutée');
      resetForm();
    },
    onError: (err) => toast.error(err.error?.message ?? 'Erreur lors de l\'enregistrement'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => faunaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fauna'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Espèce supprimée');
      setConfirmId(null);
    },
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">🐾 Faune — Gestion</h1>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="mt-6 grid gap-3 rounded-[2rem] border border-earth-100 bg-white p-6 sm:grid-cols-2">
        <p className="specimen-tag sm:col-span-2">{editingId ? `Modification — Espèce N°${String(editingId).padStart(3, '0')}` : 'Nouvelle espèce'}</p>

        <p className="specimen-tag sm:col-span-2">🟢 1. Identification</p>
        <input required placeholder="Nom" className="input" value={form.name} onChange={set('name')} />
        <input required placeholder="Nom scientifique" className="input" value={form.scientific_name} onChange={set('scientific_name')} />
        <select required className="input" value={form.category_id} onChange={set('category_id')}>
          <option value="">— Choisir une catégorie —</option>
          {categories.data?.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Famille" className="input" value={form.family} onChange={set('family')} />
        <SpeciesFormSections sections={[FAUNA_SECTIONS[0]]} form={form} set={set} />

        <p className="specimen-tag sm:col-span-2 mt-2 border-t border-earth-100 pt-4">📋 2. Général</p>
        <select className="input sm:col-span-2" value={form.conservation_status} onChange={set('conservation_status')}>
          {CONSERVATION_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
        </select>
        <textarea placeholder="Description" className="input sm:col-span-2" value={form.description} onChange={set('description')} />
        <textarea placeholder="Habitat" className="input sm:col-span-2" value={form.habitat} onChange={set('habitat')} />
        <textarea placeholder="Alimentation" className="input" value={form.diet} onChange={set('diet')} />
        <textarea placeholder="Reproduction" className="input" value={form.reproduction} onChange={set('reproduction')} />
        <textarea placeholder="Comportement" className="input sm:col-span-2" value={form.behavior} onChange={set('behavior')} />

        <SpeciesFormSections sections={FAUNA_SECTIONS.slice(1, 8)} form={form} set={set} />

        <p className="specimen-tag sm:col-span-2 mt-2 border-t border-earth-100 pt-4">🇲🇬 10. Importance pour Madagascar</p>
        <div className="sm:col-span-2">
          <p className="specimen-tag mb-2">Localisation GPS (un ou plusieurs points)</p>
          <LocationPointsEditor points={points} onChange={setPoints} />
        </div>
        <div className="sm:col-span-2">
          <p className="specimen-tag mb-2">Région(s) — liste déroulante (une ou plusieurs) — présence à Madagascar</p>
          <RegionSelectList regionIds={regionIds} onChange={setRegionIds} />
        </div>
        <SpeciesFormSections sections={[FAUNA_SECTIONS[8]]} form={form} set={set} />

        <SpeciesFormSections sections={FAUNA_SECTIONS.slice(9)} form={form} set={set} />

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={form.status === 'published'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'published' : 'draft' })} />
          Publier immédiatement (sinon enregistré comme brouillon, non visible publiquement)
        </label>

        <div className="sm:col-span-2">
          <p className="specimen-tag mb-2">Photos (1 à 3 maximum par espèce)</p>
          {existingImages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img src={assetUrl(img.thumbnail_path ?? img.image_path)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeImageMutation.mutate(img.id)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="relative">
                  <img src={pendingPreviews[i]} alt="" className="h-20 w-20 rounded-lg object-cover ring-2 ring-baobab-400" />
                  <span className="absolute bottom-0 left-0 rounded-tr-lg bg-baobab-500 px-1 text-[10px] font-semibold text-white">à envoyer</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {(existingImages.length + files.length) < 3 ? (
            <>
              <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="text-sm"
                onChange={(e) => {
                  // Cumul : chaque sélection S'AJOUTE aux précédentes (1 par 1, 2 ou 3 d'un coup).
                  const slots = 3 - existingImages.length - files.length;
                  const picked = Array.from(e.target.files);
                  const kept = picked.slice(0, slots);
                  if (picked.length > slots) {
                    toast.error(`Maximum 3 photos par espèce — ${slots} photo${slots > 1 ? 's' : ''} supplémentaire${slots > 1 ? 's' : ''} seulement.`);
                  }
                  if (kept.length) setFiles((prev) => [...prev, ...kept]);
                  // Remise à zéro du champ : permet de rouvrir le dialogue et de re-choisir le même fichier.
                  e.target.value = '';
                }} />
              <p className="mt-1 text-xs text-earth-500">{'Ajoutez une photo à la fois ou plusieurs d\'un coup : chaque sélection s\'ajoute (3 photos maximum).'}</p>
            </>
          ) : (
            <p className="text-sm text-earth-500">Limite de 3 photos atteinte — supprimez-en une pour en ajouter une autre.</p>
          )}
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? '…' : editingId ? 'Enregistrer les modifications' : 'Ajouter l\'espèce'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Annuler</button>}
        </div>
      </form>

      {/* Item : barre de recherche pour retrouver une fiche avant de la modifier */}
      <div className="mt-8">
        <input
          placeholder="🔎 Rechercher une espèce déjà existante (nom, nom scientifique, famille)..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && [1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-[1.75rem] bg-earth-100" />)}
        {!isLoading && data?.data?.length === 0 && <p className="py-6 text-center text-sm text-earth-400">Aucune espèce trouvée.</p>}
        {data?.data?.map((f) => (
          <div key={f.id} className="flex items-center gap-4 rounded-[1.75rem] border border-earth-100 bg-white p-4">
            {f.primary_image ? (
              <img src={assetUrl(f.primary_image)} alt="" className="h-12 w-12 rounded-2xl object-cover" />
            ) : <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-lg">🐾</div>}
            <div className="flex-1">
              <p className="font-semibold">{f.name}</p>
              <p className="font-display text-xs italic text-earth-500">{f.scientific_name}</p>
            </div>
            {f.status === 'draft' && <span className="badge bg-earth-100 text-earth-500">Brouillon</span>}
            <button onClick={() => startEdit(f)} className="text-sm font-semibold text-forest-700 hover:underline">Modifier</button>
            {confirmId === f.id ? (
              <span className="flex items-center gap-2 text-xs">
                Confirmer ?
                <button onClick={() => removeMutation.mutate(f.id)} className="font-semibold text-red-600 hover:underline">Oui</button>
                <button onClick={() => setConfirmId(null)} className="text-earth-400 hover:underline">Non</button>
              </span>
            ) : (
              <button onClick={() => setConfirmId(f.id)} className="text-sm font-semibold text-red-600 hover:underline">Supprimer</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
