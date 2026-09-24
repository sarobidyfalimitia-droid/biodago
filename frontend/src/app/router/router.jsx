import React from 'react';
import { createRoute, createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';

import PublicLayout from '../../components/layout/PublicLayout';
import Landing from '../../pages/public/Landing';
import Dashboard from '../../pages/public/Dashboard';
import FaunaGallery from '../../pages/public/FaunaGallery';
import FaunaDetail from '../../pages/public/FaunaDetail';
import FloraGallery from '../../pages/public/FloraGallery';
import FloraDetail from '../../pages/public/FloraDetail';
import MapPage from '../../pages/public/MapPage';
import Blog from '../../pages/public/Blog';
import BlogDetail from '../../pages/public/BlogDetail';
import About from '../../pages/public/About';
import Contact from '../../pages/public/Contact';
import Login from '../../pages/public/Login';
import Register from '../../pages/public/Register';
import ForgotPassword from '../../pages/public/ForgotPassword';
import Account from '../../pages/public/Account';

import MemberLayout from '../../pages/member/MemberLayout';
import MemberDashboard from '../../pages/member/MemberDashboard';
import MemberFaunaManager from '../../pages/member/MemberFaunaManager';
import MemberFloraManager from '../../pages/member/MemberFloraManager';
import MemberCategories from '../../pages/member/MemberCategories';
import MemberBlog from '../../pages/member/MemberBlog';

import AdminLayout from '../../pages/admin/AdminLayout';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import AdminMembers from '../../pages/admin/AdminMembers';
import AdminFauna from '../../pages/admin/AdminFauna';
import AdminFlora from '../../pages/admin/AdminFlora';
import AdminCategories from '../../pages/admin/AdminCategories';
import AdminBlog from '../../pages/admin/AdminBlog';
import AdminContact from '../../pages/admin/AdminContact';

import SuperAdminLayout from '../../pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from '../../pages/superadmin/SuperAdminDashboard';
import SuperAdminAccounts from '../../pages/superadmin/SuperAdminAccounts';

// ---------------------------------------------------------------------------
// Layout public (Header + Footer visiteur)
// ---------------------------------------------------------------------------
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: PublicLayout,
});

// Bug #19 corrigé : page 404 dédiée pour les sous-routes publiques (pas seulement à la racine).
const publicNotFoundRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '*',
  component: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl">🌴</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Page introuvable</h1>
    </div>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/', component: Landing });
const dashboardRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/dashboard', component: Dashboard });
const faunaListRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/fauna', component: FaunaGallery });
const faunaDetailRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/fauna/$id', component: FaunaDetail });
const floraListRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/flora', component: FloraGallery });
const floraDetailRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/flora/$id', component: FloraDetail });
const mapRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/map', component: MapPage });
const blogRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/blog', component: Blog });
const blogDetailRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/blog/$slug', component: BlogDetail });
const aboutRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/about', component: About });
const contactRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/contact', component: Contact });
const loginRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/login', component: Login });
const registerRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/register', component: Register });
const forgotPasswordRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/forgot-password', component: ForgotPassword });
const accountRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/account', component: Account });

// ---------------------------------------------------------------------------
// Espace Membre
// ---------------------------------------------------------------------------
const memberLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/member', component: MemberLayout });
const memberIndexRoute = createRoute({ getParentRoute: () => memberLayoutRoute, path: '/', component: MemberDashboard });
const memberFaunaRoute = createRoute({ getParentRoute: () => memberLayoutRoute, path: '/fauna', component: MemberFaunaManager });
const memberFloraRoute = createRoute({ getParentRoute: () => memberLayoutRoute, path: '/flora', component: MemberFloraManager });
const memberCategoriesRoute = createRoute({ getParentRoute: () => memberLayoutRoute, path: '/categories', component: MemberCategories });
const memberBlogRoute = createRoute({ getParentRoute: () => memberLayoutRoute, path: '/blog', component: MemberBlog });

// ---------------------------------------------------------------------------
// Espace Admin
// ---------------------------------------------------------------------------
const adminLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminLayout });
const adminIndexRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/', component: AdminDashboard });
const adminMembersRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/members', component: AdminMembers });
const adminFaunaRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/fauna', component: AdminFauna });
const adminFloraRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/flora', component: AdminFlora });
const adminCategoriesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/categories', component: AdminCategories });
const adminBlogRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/blog', component: AdminBlog });
const adminContactRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/contact', component: AdminContact });

// ---------------------------------------------------------------------------
// Espace SuperAdmin — réutilise les composants Admin pour les espèces/blog/etc.
// (mêmes permissions backend), ajoute la gestion des comptes en plus.
// ---------------------------------------------------------------------------
const superAdminLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/superadmin', component: SuperAdminLayout });
const superAdminIndexRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/', component: SuperAdminDashboard });
const superAdminAccountsRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/accounts', component: SuperAdminAccounts });
const superAdminMembersRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/members', component: AdminMembers });
const superAdminFaunaRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/fauna', component: AdminFauna });
const superAdminFloraRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/flora', component: AdminFlora });
const superAdminCategoriesRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/categories', component: AdminCategories });
const superAdminBlogRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/blog', component: AdminBlog });
const superAdminContactRoute = createRoute({ getParentRoute: () => superAdminLayoutRoute, path: '/contact', component: AdminContact });

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    indexRoute, dashboardRoute, faunaListRoute, faunaDetailRoute, floraListRoute, floraDetailRoute,
    mapRoute, blogRoute, blogDetailRoute, aboutRoute, contactRoute, loginRoute, registerRoute,
    forgotPasswordRoute, accountRoute, publicNotFoundRoute,
  ]),
  memberLayoutRoute.addChildren([
    memberIndexRoute, memberFaunaRoute, memberFloraRoute, memberCategoriesRoute, memberBlogRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute, adminMembersRoute, adminFaunaRoute, adminFloraRoute, adminCategoriesRoute,
    adminBlogRoute, adminContactRoute,
  ]),
  superAdminLayoutRoute.addChildren([
    superAdminIndexRoute, superAdminAccountsRoute, superAdminMembersRoute, superAdminFaunaRoute,
    superAdminFloraRoute, superAdminCategoriesRoute, superAdminBlogRoute,
    superAdminContactRoute,
  ]),
]);

export const router = createRouter({ routeTree });
