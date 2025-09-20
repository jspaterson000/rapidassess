import { supabase } from '@/lib/supabase';

// Generic CRUD operations for Supabase
const createSupabaseEntity = (tableName) => ({
  async list(sortField = null) {
    let query = supabase.from(tableName).select('*');
    
    if (sortField && sortField.startsWith('-')) {
      const field = sortField.substring(1);
      query = query.order(field, { ascending: false });
    } else if (sortField) {
      query = query.order(sortField, { ascending: true });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async filter(filters = {}, sortField = null, limit = null) {
    let query = supabase.from(tableName).select('*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      if (typeof value === 'object' && value.$ne) {
        query = query.neq(key, value.$ne);
      } else if (typeof value === 'object' && value.$in) {
        query = query.in(key, value.$in);
      } else if (typeof value === 'object' && value.$nin) {
        query = query.not(key, 'in', `(${value.$nin.join(',')})`);
      } else if (typeof value === 'object' && value.$gte && value.$lt) {
        query = query.gte(key, value.$gte).lt(key, value.$lt);
      } else {
        query = query.eq(key, value);
      }
    });

    // Apply sorting
    if (sortField && sortField.startsWith('-')) {
      const field = sortField.substring(1);
      query = query.order(field, { ascending: false });
    } else if (sortField) {
      query = query.order(sortField, { ascending: true });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
});

// Authentication functions
const auth = {
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    return profile;
  },

  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Not authenticated');
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw profileError;
    return profile;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateMyUserData(data) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Not authenticated');
    
    const { data: result, error: updateError } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    return result;
  }
};

// Export entities with both CRUD operations and auth for User
export const User = {
  ...auth,
  ...createSupabaseEntity('users')
};

export const Company = createSupabaseEntity('companies');
export const Job = createSupabaseEntity('jobs');
export const Assessment = createSupabaseEntity('assessments');
export const Comment = createSupabaseEntity('comments');
export const Notification = createSupabaseEntity('notifications');
export const PdsDocument = createSupabaseEntity('pds_documents');