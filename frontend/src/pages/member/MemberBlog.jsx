import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { blogApi } from '../../services/blogApi';
import { assetUrl } from '../../utils/assetUrl';
import { useToast } from '../../components/common/ToastContext';

const EMPTY_FORM = { title: '', excerpt: '', content: '', status: 'draft' };

/**
 * Espace "Mes articles". Bug #35 corrigé : cliquer sur un article charge désormais son
 * contenu dans le formulaire pour modification (au lieu de ne permettre que création/suppression).
 */
export default function MemberBlog() {
  const qc = useQueryClient();
  const toast = useToast();
  const mine = useQuery({ queryKey: ['blog', 'mine'], queryFn: () => blogApi.list({ mine: 1, limit: 50 }) });

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Aperçus des photos en attente d'envoi (recalculés à chaque ajout/retrait), URL libérées ensuite.
  const pendingPreviews = React.useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  React.useEffect(() => () => pendingPreviews.forEach((u) => URL.revokeObjectURL(u)), [pendingPreviews]);

  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM); setFiles([]); setExistingImages([]); };

  const startEdit = async (post) => {
    const full = (await blogApi.get(post.slug)).data;
    setEditingId(full.id);
    setForm({
      title: full.title ?? '', excerpt: full.excerpt ?? '', content: full.content ?? '',
      status: full.status ?? 'draft',
    });
    // Corrigé : on garde bien TOUTES les photos déjà envoyées (pas seulement la première/
    // principale) — elles étaient stockées en base mais jamais montrées ni gérables ici.
    setExistingImages(full.images ?? []);
    setFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeImageMutation = useMutation({
    mutationFn: (imageId) => blogApi.removeImage(imageId),
    onSuccess: (_, imageId) => {
      setExistingImages((imgs) => imgs.filter((i) => i.id !== imageId));
      qc.invalidateQueries({ queryKey: ['blog'] });
      toast.success('Photo supprimée');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images[]', f));
      // La première photo ajoutée (quand il n'y en a encore aucune) devient la principale.
      // S'il y a déjà une photo existante, on n'y touche pas : les nouvelles s'ajoutent
      // simplement à la suite, sans changer la principale (même correction que Faune/Flore).
      if (files.length && existingImages.length === 0) fd.append('primary_index', 0);
      return editingId ? blogApi.update(editingId, fd) : blogApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      // Afficher un message différent selon le statut
      if (form.status === 'published') {
        toast.success('Article publié avec succès ! Consultez-le sur la page Blog publique.', { duration: 5000 });
      } else {
        toast.success(editingId ? 'Article mis à jour' : 'Article enregistré comme brouillon');
      }
      resetForm();
    },
    onError: (err) => toast.error(err.error?.message ?? 'Erreur lors de l\'enregistrement'),
  });

  const [confirmId, setConfirmId] = useState(null);
  const removeMutation = useMutation({
    mutationFn: (id) => blogApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog'] }); qc.invalidateQueries({ queryKey: ['stats'] }); toast.success('Article supprimé'); setConfirmId(null); },
  });

  const togglePublish = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const fd = new FormData();
    fd.append('status', newStatus);
    try {
      await blogApi.update(post.id, fd);
      qc.invalidateQueries({ queryKey: ['blog'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      if (newStatus === 'published') {
        toast.success('Article publié ! Visible maintenant sur la page Blog publique.', { duration: 5000 });
      } else {
        toast.success('Article dépublié. Il n\'est plus visible publiquement.');
      }
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">📰 Mes articles</h1>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="mt-6 card grid gap-3 p-6 sm:grid-cols-2">
        <p className="specimen-tag sm:col-span-2">{editingId ? 'Modification de l\'article' : 'Nouvel article'}</p>

        <input required placeholder="Titre" className="input sm:col-span-2" value={form.title} onChange={set('title')} />
        <input placeholder="Extrait" className="input sm:col-span-2" value={form.excerpt} onChange={set('excerpt')} />
        <textarea required rows={6} placeholder="Contenu complet" className="input sm:col-span-2" value={form.content} onChange={set('content')} />
        <select className="input" value={form.status} onChange={set('status')}>
          <option value="draft">Brouillon</option>
          <option value="published">Publier</option>
        </select>

        <div className="sm:col-span-2">
          <p className="specimen-tag mb-2">Photos de l'article</p>
          {existingImages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img src={assetUrl(img.thumbnail_path ?? img.image_path)} alt="" className="h-20 w-28 rounded-lg object-cover" />
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
                  <img src={pendingPreviews[i]} alt="" className="h-20 w-28 rounded-lg object-cover ring-2 ring-baobab-400" />
                  <span className="absolute bottom-0 left-0 rounded-tr-lg bg-baobab-500 px-1 text-[10px] font-semibold text-white">à envoyer</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="text-sm"
            onChange={(e) => {
              // Cumul : chaque sélection S'AJOUTE aux précédentes (1 par 1, 2 ou plusieurs d'un coup).
              const picked = Array.from(e.target.files);
              if (picked.length) setFiles((prev) => [...prev, ...picked]);
              // Remise à zéro du champ : permet de rouvrir le dialogue et de re-choisir le même fichier.
              e.target.value = '';
            }} />
          <p className="mt-1 text-xs text-earth-500">{'Ajoutez les photos une par une ou plusieurs d\'un coup : chaque sélection s\'ajoute à la précédente.'}</p>
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? '…' : form.status === 'published' ? (editingId ? 'Enregistrer et publier' : 'Publier l\'article') : 'Enregistrer comme brouillon'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Annuler</button>}
        </div>
      </form>

      <div className="mt-8 space-y-2">
        {mine.data?.data?.map((post) => (
          <div key={post.id} className="card flex items-center justify-between p-4">
            <button onClick={() => startEdit(post)} className="flex-1 text-left">
              <p className="font-semibold hover:text-forest-700">{post.title}</p>
              <span className={`badge mt-1 ${post.status === 'published' ? 'bg-forest-100 text-forest-700' : 'bg-earth-100 text-earth-500'}`}>
                {post.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </button>
            <div className="flex gap-3 text-sm font-semibold items-center">
              {post.status === 'published' && (
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="text-blue-600 hover:underline">
                  Voir en ligne
                </Link>
              )}
              <button onClick={() => togglePublish(post)} className="text-forest-700 hover:underline">
                {post.status === 'published' ? 'Dépublier' : 'Publier'}
              </button>
              {confirmId === post.id ? (
                <span className="flex items-center gap-2">
                  Confirmer ?
                  <button onClick={() => removeMutation.mutate(post.id)} className="font-semibold text-red-600 hover:underline">Oui</button>
                  <button onClick={() => setConfirmId(null)} className="text-earth-400 hover:underline">Non</button>
                </span>
              ) : (
                <button onClick={() => setConfirmId(post.id)} className="text-red-600 hover:underline">Supprimer</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
