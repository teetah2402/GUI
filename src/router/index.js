//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/router/index.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { createRouter, createWebHistory } from 'vue-router';

const Lander = () => import(/* webpackChunkName: "view-home" */ '@/views/Lander.vue');
const CanvasApp = () => import(/* webpackChunkName: "view-os" */ '@/views/CanvasApp.vue');
const AppStore = () => import(/* webpackChunkName: "view-store" */ '@/views/AppStore.vue');
const AppDirectView = () => import(/* webpackChunkName: "view-runner" */ '@/views/AppDirectView.vue');
const LoginView = () => import(/* webpackChunkName: "view-login" */ '@/views/LoginView.vue');
const RegisterView = () => import(/* webpackChunkName: "view-register" */ '@/views/RegisterView.vue');
const FlowDesigner = () => import(/* webpackChunkName: "view-flow-designer" */ '@/views/FlowDesigner.vue');
const WorkflowLibrary = () => import(/* webpackChunkName: "view-workflow-library" */ '@/views/WorkflowLibrary.vue');
const AboutUs = () => import(/* webpackChunkName: "view-about-us" */ '@/views/AboutUs.vue');
const ContactUs = () => import(/* webpackChunkName: "view-contact-us" */ '@/views/ContactUs.vue');
const DMCA = () => import(/* webpackChunkName: "view-dmca" */ '@/views/DMCA.vue');
const PrivacyPolicy = () => import(/* webpackChunkName: "view-privacy-policy" */ '@/views/PrivacyPolicy.vue');
const TermsOfService = () => import(/* webpackChunkName: "view-terms-of-service" */ '@/views/TermsOfService.vue');
const WaRotator = () => import(/* webpackChunkName: "view-wa-rotator" */ '@/views/WaRotator.vue');
const Error404 = () => import(/* webpackChunkName: "view-error" */ '@/views/Error404.vue');
const NexusBioViewer = () => import(/* webpackChunkName: "app-nexus" */ '@/views/apps/NexusBioViewer.vue');
const PromoView = () => import(/* webpackChunkName: "app-promo" */ '@/views/apps/PromoView.vue');
const BlogIndex = () => import(/* webpackChunkName: "view-blog" */ '@/views/BlogIndex.vue');
const BlogReader = () => import(/* webpackChunkName: "view-blog-reader" */ '@/views/BlogReader.vue');
const TagReader = () => import(/* webpackChunkName: "view-tag" */ '@/views/TagReader.vue');
const ExtensionGuide = () => import(/* webpackChunkName: "view-extension" */ '@/views/ExtensionGuide.vue');

const routes = [
    {
        path: '/',
        name: 'Lander',
        component: Lander,
        meta: {
            requiresAuth: false,
            title: 'Flowork | The Creative Automation Platform',
            description: 'The neural workspace for creators. Design, code, and automate in one browser tab.',
            keywords: 'web os, creative tools, ai automation, flowork',
            layout: 'guest'
        }
    },

    // [RESTORED] Mengaktifkan kembali route /canvas
    {
        path: '/canvas',
        name: 'CanvasOS',
        component: CanvasApp,
        meta: {
            requiresAuth: false,
            title: 'Workspace - Flowork OS',
            description: 'Your personal AI operating system.',
        }
    },

    // [RESTORED] Mengaktifkan kembali share workspace
    {
        path: '/share/:slug',
        name: 'ShareWorkspace',
        component: CanvasApp,
        meta: {
            requiresAuth: false,
            title: 'CUSTOM WORKFLOW - FLOWORK',
        }
    },

    {
        path: '/flow/:appSlug',
        name: 'AppDirectView',
        component: AppDirectView,
        props: true,
        meta: {
            requiresAuth: false,
            title: 'Loading Flow...',
            skipMeta: true,
            layout: 'blank'
        }
    },

    // [NEW] Route untuk Panduan Ekstensi
    {
        path: '/extension',
        name: 'ExtensionGuide',
        component: ExtensionGuide,
        meta: {
            requiresAuth: false,
            title: 'Extension Guide - Flowork OS Bridge',
            description: 'Manual installation guide for Flowork OS Bridge extension.',
            layout: 'guest'
        }
    },

    {
        path: '/promo/:id',
        name: 'PromoView',
        component: PromoView,
        meta: {
            requiresAuth: false,
            title: 'Flash Sale',
            layout: 'blank'
        }
    },
    {
        path: '/bio/:handle',
        name: 'NexusBio',
        component: NexusBioViewer,
        meta: {
            requiresAuth: false,
            title: 'Bio Link',
            layout: 'blank'
        }
    },

    { path: '/app/:appSlug', redirect: to => `/flow/${to.params.appSlug}` },
    { path: '/canvas-os', redirect: '/canvas' },

    {
        path: '/store',
        name: 'AppStore',
        component: AppStore,
        meta: {
            requiresAuth: false,
            title: 'App Store - Flowork Cloud',
            description: 'Discover & Install powerful AI Modules.',
        }
    },

    // Routing untuk Blog System
    {
        path: '/blog',
        name: 'BlogIndex',
        component: BlogIndex,
        meta: {
            requiresAuth: false,
            title: 'Flowork Blog & Updates',
            description: 'Tutorial, tips, dan pembaruan terbaru seputar AI dan Flowork OS.',
            keywords: 'blog, tutorial ai, flowork updates, artikel'
        }
    },
    {
        path: '/blog/:slug',
        name: 'BlogReader',
        component: BlogReader,
        meta: {
            requiresAuth: false,
            title: 'Membaca Artikel...',
            skipMeta: true
        }
    },
    // [ADDED] Routing untuk Halaman Arsip Tag
    {
        path: '/blog/tag/:tag',
        name: 'TagReader',
        component: TagReader,
        meta: {
            requiresAuth: false,
            title: 'Loading Tag Archive...',
            skipMeta: true // Di-handle secara dinamis oleh komponen TagReader
        }
    },

    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: {
            requiresAuth: false,
            title: 'Login - Flowork OS',
            description: 'Secure access to your Flowork Neural Workspace.'
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView,
        meta: {
            requiresAuth: false,
            title: 'Create Account - Flowork',
            description: 'Join Flowork today.'
        }
    },

    { path: '/dmca', name: 'DMCA', component: DMCA, meta: { requiresAuth: false, title: 'DMCA Policy' } },
    { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicy, meta: { requiresAuth: false, title: 'Privacy Policy' }, alias: '/privacy' },
    { path: '/terms-of-service', name: 'TermsOfService', component: TermsOfService, meta: { requiresAuth: false, title: 'Terms of Service' }, alias: '/terms' },
    { path: '/contact-us', name: 'ContactUs', component: ContactUs, meta: { requiresAuth: false, title: 'Contact Us' }, alias: '/contact' },
    {
        path: '/flow-designer',
        name: 'FlowDesigner',
        component: FlowDesigner,
        meta: {
            requiresAuth: false,
            title: 'Flow Workspace',
            layout: 'blank',
            hideMobileDock: true
        }
    },

    // [NEW] Route untuk Halaman Daftar Workflow (Library)
    {
        path: '/library',
        name: 'WorkflowLibrary',
        component: WorkflowLibrary,
        meta: {
            requiresAuth: false,
            title: 'Workflow Library - Flowork OS',
            description: 'Daftar template workflow gratis siap pakai.',
            layout: 'guest'
        }
    },
    { path: '/about-us', name: 'AboutUs', component: AboutUs, meta: { requiresAuth: false, title: 'About Us' }, alias: '/about' },
    { path: '/w/', name: 'WaRotator', component: WaRotator, meta: { requiresAuth: false, title: 'Redirecting...' } },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: Error404,
        meta: {
            title: '404 - System Meltdown',
            layout: 'blank'
        }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
});


function updateMetaTag(name, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            el.setAttribute('property', name);
        } else {
            el.setAttribute('name', name);
        }
        el.setAttribute('data-vue-router-controlled', '');
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function updateLinkTag(rel, href) {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        el.setAttribute('data-vue-router-controlled', '');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}


router.beforeEach((to, from, next) => {
    if (!to.meta.skipMeta) {
        const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);
        const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.description);
        const nearestWithKeywords = to.matched.slice().reverse().find(r => r.meta && r.meta.keywords);

        const defaultTitle = 'Flowork | Free AI Workflow Automation';
        const defaultDesc = 'Build, train, and command AI agents with a visual, self-hosted workflow automation platform.';
        const defaultKeywords = 'ai, automation, visual programming, flowork, zapier alternative';

        const title = nearestWithTitle ? nearestWithTitle.meta.title : defaultTitle;
        const description = nearestWithMeta ? nearestWithMeta.meta.description : defaultDesc;
        const keywords = nearestWithKeywords ? nearestWithKeywords.meta.keywords : defaultKeywords;

        const fullUrl = `https://floworkos.com${to.path}`;

        if (document.title !== title) document.title = title;

        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:url', fullUrl);
        updateMetaTag('og:type', 'website');
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateLinkTag('canonical', fullUrl);
    }

    next();
});

export default router;