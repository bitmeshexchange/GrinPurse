'use strict';
module.exports = [
  {
    name: 'home',
    path: '/home',
    login: false,
    component: () => import('src/pages/home'),
  },

  {
    name: 'send',
    path: '/send',
    login: false,
    component: () => import('src/pages/send'),
  },

  {
    name: 'receive',
    path: '/receive',
    login: false,
    component: () => import('src/pages/receive'),
  },
  {
    name: 'welcome',
    path: '/',
    layout: false,
    component: () => import('src/pages/welcome'),
  },
  {
    name: 'passphrase',
    path: '/passphrase',
    layout: false,
    component: () => import('src/pages/passphrase'),
  },
  {
    name: 'confirm',
    path: '/confirm',
    layout: false,
    component: () => import('src/pages/confirm'),
  },
  {
    name: 'password',
    path: '/password',
    layout: false,
    component: () => import('src/pages/password'),
  },
  {
    name: 'connect',
    path: '/connect',
    layout: false,
    component: () => import('src/pages/connect'),
  },
  { 
    name: 'login',
    path: '/login',
    layout: false,
    component: () => import('src/pages/login'),
  },
  {
    name: 'sync',
    path: '/sync',
    layout: false,
    component: () => import('src/pages/sync'),
  },
  {
    name: 'restore',
    path: '/restore',
    layout: false,
    component: () => import('src/pages/restore'),
  },

  {
    name: 'exchange',
    path: '/exchange',
    component: () => import('src/pages/exchange'),
  },

];
