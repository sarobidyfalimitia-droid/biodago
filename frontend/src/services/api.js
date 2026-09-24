import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // session PHP côté cookie
});

// Bug corrigé (item 11 de l'audit) : si la session serveur expire pendant que
// l'utilisateur reste sur une page protégée, tout appel API renvoie 401 — sans
// gestionnaire global, rien ne le déconnectait proprement côté interface (écran
// blanc/actions silencieusement en échec). On diffuse un évènement global que
// AuthContext écoute pour vider l'utilisateur et rediriger vers /login.
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const payload = err.response?.data ?? {
      success: false,
      error: { code: 'NETWORK', message: 'Erreur réseau' },
    };
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return Promise.reject(payload);
  }
);
