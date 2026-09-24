import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../features/auth/AuthContext';
import { authApi } from '../../services/authApi';

export default function Account() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState(null);

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await authApi.changePassword(pwForm);
      setMessage(res.message);
      setPwForm({ current_password: '', new_password: '' });
    } catch (err) {
      setMessage(err.error?.message ?? 'Erreur');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Mon compte</h1>

      <div className="mt-6 card p-6">
        <p className="text-sm text-earth-500">{t('auth.name')}</p>
        <p className="font-semibold">{user?.name}</p>
        <p className="mt-3 text-sm text-earth-500">{t('auth.email')}</p>
        <p className="font-semibold">{user?.email}</p>
        <p className="mt-3 text-sm text-earth-500">Rôle</p>
        <p className="font-semibold capitalize">{user?.role}</p>
      </div>

      <form onSubmit={changePassword} className="mt-8 card space-y-4 p-6">
        <h2 className="font-semibold text-ink">Changer le mot de passe</h2>
        <input type="password" required placeholder="Mot de passe actuel" className="input"
          value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
        <input type="password" required placeholder="Nouveau mot de passe" className="input"
          value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
        {message && <p className="text-sm text-forest-700">{message}</p>}
        <button type="submit" className="btn-primary">{t('buttons.submit')}</button>
      </form>

      <button onClick={handleLogout} className="btn-secondary mt-6">{t('auth.logout')}</button>
    </div>
  );
}
