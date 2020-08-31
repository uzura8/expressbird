import Top from '@/templates/Top';
import About from '@/templates/About';
import NotFound from '@/templates/Notfound';
import SignUp from '@/templates/SignUp'
import SignIn from '@/templates/SignIn'
import SentVerificationMail from '@/templates/SentVerificationMail'
import RequiredEmailVerification from '@/templates/RequiredEmailVerification'
import UserVerifyEmail from '@/templates/UserVerifyEmail'
import UserTop from '@/templates/UserTop'
import Settings from '@/templates/Settings'
import Chats from '@/templates/Chats'
import ChatkDetail from '@/templates/ChatDetail'
import ChatCreate from '@/templates/ChatCreate'
import ChatEdit from '@/templates/ChatEdit'
import AdminTop from '@/templates/AdminTop'
import AdminUsers from '@/templates/AdminUsers'
import UserCreate from '@/templates/UserCreate'
import UserEdit from '@/templates/UserEdit'
import AdminChats from '@/templates/AdminChats'
import AdminChatCreate from '@/templates/AdminChatCreate'
import AdminChatEdit from '@/templates/AdminChatEdit'
import AdminChatDetail from '@/templates/AdminChatDetail'
import AdminSignIn from '@/templates/AdminSignIn'

export default [
  {
    path: '/',
    component: Top,
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/signup/sent',
    name: 'SentVerificationMail',
    component: SentVerificationMail
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn
  },
  {
    path: '/errors/required-email-verification',
    name: 'RequiredEmailVerification',
    component: RequiredEmailVerification
  },
  {
    path: '/user/verify-email',
    name: 'UserVerifyEmail',
    component: UserVerifyEmail
  },
  {
    path: '/user',
    name: 'UserTop',
    component: UserTop,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/chats',
    name: 'Chats',
    component: Chats,
  },
  {
    path: '/chats/create',
    name: 'ChatCreate',
    component: ChatCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/chats/:id/edit',
    name: 'ChatEdit',
    component: ChatEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/chats/:id',
    name: 'chatkDetail',
    component: ChatkDetail,
  },
  {
    path: '/admin/signin',
    name: 'AdminSignIn',
    component: AdminSignIn
  },
  {
    path: '/admin/chats/create',
    name: 'AdminChatCreate',
    component: AdminChatCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/chats/:id/edit',
    name: 'AdminChatEdit',
    component: AdminChatEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/chats/:id',
    name: 'AdminChatDetail',
    component: AdminChatDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/chats',
    name: 'AdminChats',
    component: AdminChats,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users/create',
    name: 'AdminUserCreate',
    component: UserCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users/:id/edit',
    name: 'AdminUserEdit',
    component: UserEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminTop',
    component: AdminTop,
    meta: { requiresAuth: true }
  },
  { path: '/about', component: About },
  { path: '/notfound', component: NotFound },
  { path: '*', redirect: '/notfound' }
]
