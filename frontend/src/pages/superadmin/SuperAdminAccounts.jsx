import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '../../services/superAdminApi';
import { useAuth } from '../../features/auth/AuthContext';
// Règles partagées avec l'inscription publique : téléphone + pseudo (utils/phone.js)
import { isPhoneValid, isUsernameValid, normalizePhone } from '../../utils/phone';

const ROLE_TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'member', label: 'Membres' },
  { key: 'admin', label: 'Admins' },
  { key: 'superadmin', label: 'SuperAdmins' },
];

const ROLE_BADGE = {
  member: 'bg-forest-100 text-forest-700',
  admin: 'bg-earth-100 text-earth-700',
  superadmin: 'bg-baobab-100 text-baobab-700',
};

// Champs de création : mêmes que le formulaire d'inscription publique
// (nom, pseudo, email, téléphone, mot de passe + confirmation), plus le rôle.
const EMPTY_ACCOUNT = {
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  role: 'admin',
};

/**
 * Item 1 : gestion complète des comptes (Membre/Admin/SuperAdmin) réservée au SuperAdmin.
 * Peut promouvoir/rétrograder Membre <-> Admin, créer un compte Admin ou SuperAdmin
 * directement (déjà actif), et supprimer n'importe quel compte SAUF un SuperAdmin
 * (protection appliquée aussi côté backend, jamais uniquement côté React).
 */
export default function SuperAdminAccounts() {
  const { user: currentUser } = useAuth();
  const [role, setRole] = useState('all');
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['accounts', role], queryFn: () => superAdminApi.listAccounts({ role }) });

  const [newAccount, setNewAccount] = useState(EMPTY_ACCOUNT);
  const [createError, setCreateError] = useState(null);
  const [createNotice, setCreateNotice] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['accounts'] });
  const changeRole = useMutation({ mutationFn: ({ id, role }) => superAdminApi.changeRole(id, role), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: superAdminApi.removeAccount, onSuccess: invalidate });
  const create = useMutation({
    // Pseudo et téléphone partent normalisés (mêmes helpers que l'inscription) et à
    // « null » s'ils sont vides : le compte se connectera alors par email uniquement
    // (AuthController::login teste « email = ? OR username = ? »).
    mutationFn: () => superAdminApi.createAccount({
      ...newAccount,
      name: newAccount.name.trim(),
      username: newAccount.username.trim() || null,
      phone: normalizePhone(newAccount.phone) || null,
    }),
    onSuccess: (res) => {
      invalidate();
      setNewAccount(EMPTY_ACCOUNT);
      setCreateNotice(res?.message ?? 'Compte créé');
    },
    onError: (err) => setCreateError(err?.error?.message ?? 'Erreur lors de la création du compte'),
  });

  // Contrôles AVANT l'appel API : exactement les mêmes règles que le formulaire
  // d'inscription publique (le backend revalide de toute façon — jamais confiance au front).
  const onCreate = (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateNotice(null);
    if (newAccount.phone && !isPhoneValid(newAccount.phone)) {
      setCreateError('Numéro de téléphone invalide (7 à 15 chiffres ; séparateurs espaces . - / _ ( ) tolérés).');
      return;
    }
    if (newAccount.username.trim() && !isUsernameValid(newAccount.username)) {
      setCreateError('Pseudo invalide (3 à 50 caractères, lettres/chiffres/./_/- uniquement).');
      return;
    }
    if (newAccount.password !== newAccount.password_confirmation) {
      setCreateError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newAccount.password.length < 8) {
      setCreateError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    create.mutate();
  };

  return (
    <div>
      <span className="badge bg-baobab-100 text-baobab-700">👑 Réservé au SuperAdmin</span>
      <h1 className="mt-3 font-display text-2xl font-medium text-ink">Gestion des comptes</h1>
      <p className="mt-1 text-sm text-earth-500">Promouvoir, rétrograder, créer ou supprimer des comptes — tous rôles confondus.</p>

      <form onSubmit={onCreate} className="mt-6 grid gap-3 rounded-[2rem] border border-earth-100 bg-white p-6 sm:grid-cols-4">
        <p className="specimen-tag sm:col-span-4">
          Créer un compte Admin ou SuperAdmin (déjà actif, pas d'approbation) — mêmes champs que
          l'inscription : le compte pourra ensuite se connecter par email OU par pseudo
        </p>
        <input required placeholder="Nom" className="input" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} />
        <input placeholder="Pseudo (optionnel)" className="input" value={newAccount.username} onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })} />
        <input required type="email" placeholder="Email" className="input" value={newAccount.email} onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })} />
        <input type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="Téléphone (optionnel)" className="input" value={newAccount.phone} onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })} />
        <input required type="password" autoComplete="new-password" placeholder="Mot de passe (8 caractères min.)" className="input" value={newAccount.password} onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })} />
        <input required type="password" autoComplete="new-password" placeholder="Confirmer le mot de passe" className="input" value={newAccount.password_confirmation} onChange={(e) => setNewAccount({ ...newAccount, password_confirmation: e.target.value })} />
        <select className="input" value={newAccount.role} onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}>
          <option value="admin">Admin</option>
          <option value="superadmin">SuperAdmin</option>
        </select>

        {createError && <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:col-span-4">{createError}</p>}
        {createNotice && <p className="rounded-2xl bg-forest-50 px-4 py-2.5 text-sm text-forest-700 sm:col-span-4">{createNotice}</p>}

        <button type="submit" disabled={create.isPending} className="btn-primary sm:col-span-4">
          {create.isPending ? '…' : 'Créer le compte'}
        </button>
      </form>

      <div className="mt-6 flex gap-2">
        {ROLE_TABS.map((t) => (
          <button key={t.key} onClick={() => setRole(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${role === t.key ? 'bg-baobab-600 text-white' : 'bg-white text-earth-600 ring-1 ring-earth-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {data?.data?.map((acc) => (
          <div key={acc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-earth-100 bg-white p-4">
            <div>
              <p className="font-semibold">{acc.name} {acc.id === currentUser?.id && <span className="text-xs text-earth-400">(vous)</span>}</p>
              <p className="text-xs text-earth-500">{acc.email} {acc.username && `· @${acc.username}`}</p>
            </div>
            <span className={`badge ${ROLE_BADGE[acc.role]}`}>{acc.role}</span>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {acc.role === 'member' && (
                <button onClick={() => changeRole.mutate({ id: acc.id, role: 'admin' })} className="text-forest-700 hover:underline">
                  → Promouvoir Admin
                </button>
              )}
              {acc.role === 'admin' && (
                <button onClick={() => changeRole.mutate({ id: acc.id, role: 'member' })} className="text-baobab-700 hover:underline">
                  → Rétrograder Membre
                </button>
              )}
              {acc.role !== 'superadmin' && (
                <button onClick={() => { if (confirm(`Supprimer définitivement le compte de ${acc.name} ?`)) remove.mutate(acc.id); }}
                  className="text-red-600 hover:underline">
                  Supprimer
                </button>
              )}
              {acc.role === 'superadmin' && <span className="text-earth-300">Protégé — non supprimable</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
