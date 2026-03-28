import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, LayoutDashboard, ListFilter, Search, User, FileText, Calendar, CreditCard, ChevronDown, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { cn, formatCurrency } from '../lib/utils';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      setError('Invalid credentials. Please use admin/123456');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders from the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setOrders([]);
  };

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
            <h2 className="text-3xl font-black text-brand-text mb-2">Admin Login</h2>
            <p className="text-brand-muted">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-5 py-4 text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-5 py-4 text-brand-text focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-4 rounded-xl hover:shadow-xl hover:shadow-sky-500/20 transition-all active:scale-[0.98]"
            >
              LOGIN
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
            Admin Dashboard
          </h2>
          <p className="text-brand-muted font-medium">Manage and process visa applications</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-muted font-bold hover:text-red-500 hover:border-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-brand-border bg-brand-surface/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ListFilter className="w-5 h-5 text-sky-500" />
              <h3 className="text-xl font-bold text-brand-text">Recent Orders</h3>
            </div>
            <button 
              onClick={fetchOrders}
              className="p-2 hover:bg-brand-surface rounded-lg transition-colors text-brand-muted"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">Applicant</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">Visa Type</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">Amount</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-brand-border">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {orders.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-brand-muted font-medium">
                      No orders found in the system.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className={cn(
                        "hover:bg-brand-surface/30 transition-colors cursor-pointer",
                        selectedOrder === order.id && "bg-sky-500/5"
                      )}>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-brand-muted" />
                            <span className="text-sm font-bold text-brand-text">
                              {new Date(order.created_at).toLocaleDateString()}
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
                            {order.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <button 
                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                            className="p-2 hover:bg-brand-surface rounded-lg transition-colors text-brand-muted"
                          >
                            <ChevronDown className={cn("w-5 h-5 transition-transform", selectedOrder === order.id && "rotate-180")} />
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
                                  <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-sky-500 flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      Passport Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                      {[
                                        { label: 'Full Name', value: order.passport_data.fullName },
                                        { label: 'Passport No.', value: order.passport_data.passportNumber },
                                        { label: 'Nationality', value: order.passport_data.nationality },
                                        { label: 'DOB', value: order.passport_data.dateOfBirth },
                                        { label: 'Issue Date', value: order.passport_data.dateOfIssue },
                                        { label: 'Expiry Date', value: order.passport_data.dateOfExpiry },
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
                                      <CreditCard className="w-4 h-4" />
                                      Order Summary
                                    </h4>
                                    <div className="bg-brand-surface/50 border border-brand-border rounded-2xl p-6 space-y-4">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted font-medium">Government Fee</span>
                                        <span className="text-brand-text font-bold">{formatCurrency(order.government_fee, order.currency)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted font-medium">Service Fee</span>
                                        <span className="text-brand-text font-bold">{formatCurrency(order.service_fee, order.currency)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted font-medium">Processing Fee</span>
                                        <span className="text-brand-text font-bold">{formatCurrency(order.processing_fee, order.currency)}</span>
                                      </div>
                                      <div className="pt-4 border-t border-brand-border flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest text-brand-muted">Total Paid</span>
                                        <span className="text-2xl font-black text-brand-text">{formatCurrency(order.total_fee, order.currency)}</span>
                                      </div>
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
