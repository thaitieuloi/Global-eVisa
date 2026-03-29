import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Lock, LogOut, LayoutDashboard, ListFilter, Search, User, FileText, Calendar, CreditCard, ChevronDown, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { cn, formatCurrency } from '../lib/utils';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    
    if (previewImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage]);

  useEffect(() => {
    if (isAuthenticated && isInitialLoad) {
      fetchOrders();
      setIsInitialLoad(false);
    }
  }, [isAuthenticated, isInitialLoad]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      fetchOrders();
    } else {
      setError(t('admin.errors.invalidCredentials'));
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(t('admin.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    setUsername('admin');
    setPassword('123456');
    setOrders([]);
    setSearchQuery('');
    setStatusFilter('all');
    setVisaTypeFilter('all');
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(t('admin.errors.updateFailed'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.passport_data.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.visa_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.visa_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesVisaType = visaTypeFilter === 'all' || order.visa_code === visaTypeFilter;

    return matchesSearch && matchesStatus && matchesVisaType;
  });

  const uniqueVisaTypes = Array.from(new Set(orders.map(o => o.visa_code)));

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] p-10 w-full max-w-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-600" />
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-sky-500" />
            </div>
            <h2 className="text-3xl font-black text-brand-text mb-2">{t('admin.loginTitle')}</h2>
            <p className="text-brand-muted">{t('admin.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" aria-label="Admin Login Form">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-bold text-brand-muted uppercase tracking-widest">{t('admin.username')}</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-5 py-4 text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="admin"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-brand-muted uppercase tracking-widest">{t('admin.password')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-5 py-4 text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="••••••"
                required
                aria-required="true"
              />
            </div>

            {error && (
              <div 
                role="alert"
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-4 rounded-xl hover:shadow-xl hover:shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? t('admin.loggingIn') : t('admin.loginButton')}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-brand-text mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-sky-500" />
            {t('admin.dashboardTitle')}
          </h2>
          <p className="text-brand-muted font-medium">{t('admin.dashboardSubtitle')}</p>
        </div>
        <button
          onClick={handleLogout}
          aria-label={t('admin.aria.logout')}
          className="flex items-center gap-2 px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-muted font-bold hover:text-red-500 hover:border-red-500/30 transition-all focus:ring-2 focus:ring-red-500 outline-none"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {t('admin.logout')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-brand-border bg-brand-surface/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-3">
                <ListFilter className="w-5 h-5 text-sky-500" />
                <h3 className="text-xl font-bold text-brand-text">{t('admin.recentOrders')}</h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto" role="search" aria-label={t('admin.aria.search')}>
                <div className="relative flex-1 min-w-[200px]">
                  <label htmlFor="search-orders" className="sr-only">{t('admin.aria.search')}</label>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" aria-hidden="true" />
                  <input
                    id="search-orders"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('admin.searchPlaceholder')}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl pl-11 pr-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label htmlFor="status-filter" className="sr-only">{t('admin.aria.filterStatus')}</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  >
                    <option value="all">{t('admin.allStatuses')}</option>
                    <option value="pending">{t('admin.status.pending')}</option>
                    <option value="processing">{t('admin.status.processing')}</option>
                    <option value="completed">{t('admin.status.completed')}</option>
                    <option value="cancelled">{t('admin.status.cancelled')}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="visa-filter" className="sr-only">{t('admin.aria.filterVisa')}</label>
                  <select
                    id="visa-filter"
                    value={visaTypeFilter}
                    onChange={(e) => setVisaTypeFilter(e.target.value)}
                    className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  >
                    <option value="all">{t('admin.allVisaTypes')}</option>
                    {uniqueVisaTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={fetchOrders}
                  aria-label={t('admin.refreshData')}
                  className="p-2 hover:bg-brand-surface rounded-xl transition-colors text-brand-muted border border-brand-border focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/50">
                  <th scope="col" className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">{t('admin.table.date')}</th>
                  <th scope="col" className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">{t('admin.table.applicant')}</th>
                  <th scope="col" className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">{t('admin.table.visaType')}</th>
                  <th scope="col" className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">{t('admin.table.amount')}</th>
                  <th scope="col" className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">{t('admin.table.status')}</th>
                  <th scope="col" className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredOrders.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-brand-muted font-medium">
                      {orders.length === 0 ? t('admin.noOrders') : t('admin.noMatches')}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className={cn(
                        "hover:bg-brand-surface/30 transition-colors cursor-pointer",
                        selectedOrder === order.id && "bg-sky-500/5"
                      )}>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-brand-muted" />
                            <span className="text-sm font-bold text-brand-text">
                              {new Date(order.created_at).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-brand-muted" />
                            <span className="text-sm font-bold text-brand-text">{order.passport_data.fullName}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">{order.visa_code}</span>
                            <p className="text-sm font-bold text-brand-text">{order.visa_name}</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-brand-muted" />
                            <span className="text-sm font-black text-brand-text">
                              {formatCurrency(order.total_fee, order.currency)}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            order.status === 'pending' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                            order.status === 'processing' && "bg-sky-500/10 text-sky-500 border-sky-500/20",
                            order.status === 'completed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            order.status === 'cancelled' && "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                            {t(`admin.status.${order.status}`)}
                          </span>
                        </td>
                        <td className="p-6">
                          <button 
                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                            aria-label={selectedOrder === order.id ? "Collapse order details" : "Expand order details"}
                            aria-expanded={selectedOrder === order.id}
                            aria-controls={`order-details-${order.id}`}
                            className="p-2 hover:bg-brand-surface rounded-lg transition-colors text-brand-muted focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <ChevronDown className={cn("w-5 h-5 transition-transform", selectedOrder === order.id && "rotate-180")} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {selectedOrder === order.id && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-brand-surface/20 border-b border-brand-border"
                              >
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                  <div className="space-y-6" id={`order-details-${order.id}`}>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-sky-500 flex items-center gap-2">
                                      <FileText className="w-4 h-4" aria-hidden="true" />
                                      {t('admin.details.passport')}
                                    </h4>
                                    {order.passport_image_url && (
                                      <div className="mb-4">
                                        <img 
                                          src={order.passport_image_url} 
                                          alt="Passport" 
                                          className="w-full h-auto rounded-2xl border border-brand-border cursor-pointer hover:opacity-90 transition-opacity"
                                          referrerPolicy="no-referrer"
                                          onClick={() => setPreviewImage(order.passport_image_url)}
                                        />
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-6">
                                      {[
                                        { label: t('ocr.full_name'), value: order.passport_data.fullName },
                                        { label: t('ocr.passport_number'), value: order.passport_data.passportNumber },
                                        { label: t('ocr.nationality'), value: order.passport_data.nationality },
                                        { label: t('ocr.dob'), value: order.passport_data.dateOfBirth },
                                        { label: t('ocr.doi'), value: order.passport_data.dateOfIssue },
                                        { label: t('ocr.doe'), value: order.passport_data.dateOfExpiry },
                                      ].map((item) => (
                                        <div key={item.label}>
                                          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{item.label}</p>
                                          <p className="text-sm font-bold text-brand-text">{item.value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-sky-500 flex items-center gap-2">
                                      <CreditCard className="w-4 h-4" aria-hidden="true" />
                                      {t('admin.details.orderSummary')}
                                    </h4>
                                    <div className="bg-brand-surface/50 border border-brand-border rounded-2xl p-6 space-y-4">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted font-medium">{t('admin.details.govFee')}</span>
                                        <span className="text-brand-text font-bold">{formatCurrency(order.government_fee, order.currency)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted font-medium">{t('admin.details.serviceFee')}</span>
                                        <span className="text-brand-text font-bold">{formatCurrency(order.service_fee, order.currency)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted font-medium">{t('admin.details.processingFee')}</span>
                                        <span className="text-brand-text font-bold">{formatCurrency(order.processing_fee, order.currency)}</span>
                                      </div>
                                      <div className="pt-4 border-t border-brand-border flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest text-brand-muted">{t('admin.details.totalPaid')}</span>
                                        <span className="text-2xl font-black text-brand-text">{formatCurrency(order.total_fee, order.currency)}</span>
                                      </div>
                                    </div>

                                  <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{t('admin.details.updateStatus')}</h4>
                                    <div className="flex flex-wrap gap-2" role="group" aria-label="Order status update options">
                                      {(['pending', 'processing', 'completed', 'cancelled'] as Order['status'][]).map((status) => (
                                        <button
                                          key={status}
                                          disabled={
                                            updatingStatus === order.id || 
                                            order.status === status || 
                                            order.status === 'completed' || 
                                            order.status === 'cancelled'
                                          }
                                          onClick={() => handleStatusUpdate(order.id, status)}
                                          aria-label={`Update status to ${status}`}
                                          className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all focus:ring-2 focus:ring-sky-500 outline-none",
                                            order.status === status 
                                              ? "bg-brand-text text-brand-surface border-brand-text" 
                                              : "bg-brand-surface text-brand-muted border-brand-border hover:border-sky-500 hover:text-sky-500",
                                            (updatingStatus === order.id || (order.status !== status && (order.status === 'completed' || order.status === 'cancelled'))) && "opacity-50 cursor-not-allowed"
                                          )}
                                        >
                                          {t(`admin.status.${status}`)}
                                        </button>
                                      ))}
                                    </div>
                                    {updatingStatus === order.id && (
                                      <p className="text-xs text-sky-500 animate-pulse font-bold" aria-live="polite">
                                        {t('admin.details.updating')}
                                      </p>
                                    )}
                                  </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={previewImage}
              alt="Passport Preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
