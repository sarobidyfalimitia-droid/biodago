import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { blogApi } from '../../services/blogApi';
import { useToast } from '../../components/common/ToastContext';
import MemberBlog from '../member/MemberBlog';

/**
 * L'Admin réutilise le formulaire de création de MemberBlog (mêmes champs, même API),
 * mais voit et modère TOUS les articles (all=1) — pas seulement les siens.
 */
export default function AdminBlog() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data } = useQuery({ queryKey: ['blog', 'admin-all'], queryFn: () => blogApi.list({ all: 1, limit: 100 }) });
  const remove = useMutation({
    mutationFn: (id) => blogApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog'] });
      toast.success('Article supprimé');
    },
  });

  const togglePublish = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const fd = new FormData();
    fd.append('status', newStatus);
    try {
      await blogApi.update(post.id, fd);
      qc.invalidateQueries({ queryKey: ['blog'] });
      if (newStatus === 'published') {
        toast.success('Article publié ! Visible sur la page Blog publique.', { duration: 5000 });
      } else {
        toast.success('Article dépublié.');
      }
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  return (
    <div className="space-y-10">
      <MemberBlog />

      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Tous les articles (modération)</h2>
        <div className="mt-4 space-y-2">
          {data?.data?.map((post) => (
            <div key={post.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{post.title}</p>
                <p className="text-xs text-earth-500">{post.author_name} · {post.status}</p>
              </div>
              <div className="flex gap-3 text-sm font-semibold items-center">
                {post.status === 'published' && (
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="text-blue-600 hover:underline">
                    Voir en ligne
                  </Link>
                )}
                <button onClick={() => togglePublish(post)} className="text-forest-700 hover:underline">
                  {post.status === 'published' ? 'Dépublier' : 'Publier'}
                </button>
                <button onClick={() => remove.mutate(post.id)} className="text-red-600 hover:underline">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
