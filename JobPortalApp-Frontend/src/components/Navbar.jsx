import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { fetchMySubscriptions } from '../redux/subscriptionSlice';
import { fetchNotifications, addNotification, markAsRead } from '../redux/NotificationSlice';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {
  Briefcase, LogOut, LayoutDashboard,
  Bell, Search, Menu, X, Plus,
  FileCode, Zap, User, ChevronDown, ExternalLink
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { active: subscriptions } = useSelector((state) => state.subscription);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const stompClientRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isRecruiter = user?.role === 'RECRUITER';
  const hasActiveSubscription = subscriptions?.some(sub => sub.status === 'SUBSCRIBED');
  const DOCS_URL = `/webjars/swagger-ui/index.html`;

  // 1. Initial Data Fetch & Scroll Listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    if (isAuthenticated) {
      if (isRecruiter) dispatch(fetchMySubscriptions());
      dispatch(fetchNotifications());
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch, isAuthenticated, isRecruiter]);

  // 2. Production-Grade WebSocket Setup
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const socket = new SockJS("/api/notifications/ws-notifications");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        const topic = `/topic/notifications/${user.email.toLowerCase()}`;
        client.subscribe(topic, (msg) => {
          try {
            const newNotif = JSON.parse(msg.body);
            dispatch(addNotification(newNotif));
          } catch (err) {
            console.error("Notification Parse Error", err);
          }
        });
      },
      onStompError: (frame) => console.error('Broker error:', frame.headers['message']),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [isAuthenticated, user?.email, dispatch]);

  // 3. Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  }, [location]);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 py-2 shadow-sm'
          : 'bg-white py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">

            {/* BRAND SECTION */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Job<span className="text-indigo-600">Portal</span>
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                <NavTab to="/jobs" label="Browse" icon={<Search size={18} />} />
                {isAuthenticated && (
                  <>
                    <NavTab to="/dashboard" label="Dashboard" icon={<LayoutDashboard size={18} />} />
                    {isRecruiter && (
                      <NavTab to="/post-job" label="Post Job" icon={<Plus size={18} />} />
                    )}
                  </>
                )}
                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"><FileCode size={18} /> Docs</a>
                <NavTab to="/about-us" label="About Us" icon={<User size={18} />} />
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  {isRecruiter && !hasActiveSubscription && (
                    <button
                      onClick={() => navigate('/subscription')}
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold hover:bg-amber-100 transition-all active:scale-95"
                    >
                      <Zap size={14} className="fill-amber-500" /> Upgrade
                    </button>
                  )}

                  <div className="relative">
                    <button
                      aria-label="Notifications"
                      onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
                      className={`p-2.5 rounded-2xl transition-all relative ${showNotifDropdown ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                      <Bell size={22} />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </button>

                    {showNotifDropdown && (
                      <div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-full mt-3 sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <span className="font-bold text-slate-800">Notifications</span>
                          <Link to="/notifications" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
                        </div>
                        <div className="max-h-[380px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-sm italic">No new notifications</div>
                          ) : (
                            notifications.slice(0, 5).map(n => (
                              <div
                                key={n.notificationId}
                                onClick={() => { if (!n.read) dispatch(markAsRead(n.notificationId)); navigate('/notifications'); }}
                                className={`px-5 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-indigo-50/30' : ''}`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* USER MENU */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
                      className="flex items-center gap-2 p-1 pr-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm ${hasActiveSubscription ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                        {user?.email[0].toUpperCase()}
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-5 py-3 border-b border-slate-100 mb-2">
                          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{user?.role}</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                        </div>
                        <DropdownItem to="/ai-assistant" icon={<Zap size={18} />} label="AI Assistant" />
                        <DropdownItem to="/manage-profile" icon={<User size={18} />} label="My Profile" />
                        {isRecruiter && <DropdownItem to="/subscription" icon={<Zap size={18} />} label="Subscription" />}
                        <hr className="my-2 border-slate-50" />
                        <button
                          onClick={() => dispatch(logoutUser()).then(() => navigate('/'))}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600">Login</Link>
                  <Link to="/signup" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100">
                    Join Now
                  </Link>
                </div>
              )}

              {/* MOBILE MENU TOGGLE */}
              <button
                aria-label="Toggle Menu"
                onClick={() => { setIsMenuOpen(!isMenuOpen); setShowNotifDropdown(false); setShowUserDropdown(false); }}
                className="lg:hidden p-2 text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <nav className="p-5 space-y-2">
              <MobileNavLink to="/jobs" icon={<Search size={20} />} label="Browse Jobs" />
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                  {isRecruiter && <MobileNavLink to="/post-job" icon={<Plus size={20} />} label="Post a Job" />}
                  <button onClick={() => dispatch(logoutUser())} className="w-full flex items-center gap-3 p-4 text-rose-600 font-bold bg-rose-50 rounded-2xl">
                    <LogOut size={20} /> Logout
                  </button>
                  <a href={DOCS_URL} className="flex items-center justify-between p-4 text-slate-600 font-bold bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3"><FileCode size={20} /> API Docs</div>
                    <ExternalLink size={16} className="text-slate-400" />
                  </a>
                  <MobileNavLink to="/about-us" icon={<User size={20} />} label="About Us" />
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link to="/login" className="py-4 text-center font-bold text-slate-600 bg-slate-50 rounded-2xl">Login</Link>
                  <Link to="/signup" className="py-4 text-center font-bold bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">Join</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* CLICK-OUTSIDE BACKDROP */}
      {(showNotifDropdown || showUserDropdown || isMenuOpen) && (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/5 backdrop-blur-[1px]"
          onClick={closeAllMenus}
        />
      )}
    </>
  );
};

// HELPER COMPONENTS
const NavTab = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
  >
    {icon} {label}
  </NavLink>
);

const DropdownItem = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-semibold">
    <span className="text-slate-400">{icon}</span>
    {label}
  </Link>
);

const MobileNavLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-4 p-4 text-slate-700 font-bold rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
    <div className="text-slate-400 group-hover:text-indigo-600">{icon}</div>
    <span>{label}</span>
  </Link>
);

export default Navbar;