import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
    const { data, error } = await supabase
      .from('visa_orders')
      .insert({
        ...orderData,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('visa_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('visa_orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) throw error;
  }
};
