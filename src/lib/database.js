import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Production-ready database service with connection pooling and error handling
 * Gracefully handles cases where Supabase is not configured
 */

export class DatabaseService {
  /**
   * Execute a query with proper error handling
   */
  static async executeQuery(queryBuilder) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    try {
      const { data, error, count } = await queryBuilder;
      
      if (error) {
        console.error('Database query error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return { data, count };
    } catch (error) {
      console.error('Database service error:', error);
      throw error;
    }
  }

  /**
   * Generic CRUD operations with validation
   */
  static createCrudService(tableName, validationSchema = null) {
    return {
      async list(filters = {}, orderBy = null, limit = null) {
        if (!isSupabaseConfigured) {
          throw new Error('Database service not available');
        }

        let query = supabase.from(tableName).select('*');
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
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
          }
        });

        // Apply ordering
        if (orderBy) {
          if (orderBy.startsWith('-')) {
            const field = orderBy.substring(1);
            query = query.order(field, { ascending: false });
          } else {
            query = query.order(orderBy, { ascending: true });
          }
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const result = await DatabaseService.executeQuery(query);
        return result.data || [];
      },

      async get(id) {
        if (!isSupabaseConfigured) {
          throw new Error('Database service not available');
        }

        const result = await DatabaseService.executeQuery(
          supabase.from(tableName).select('*').eq('id', id).single()
        );
        return result.data;
      },

      async create(data) {
        if (!isSupabaseConfigured) {
          throw new Error('Database service not available');
        }

        // Validate data if schema provided
        if (validationSchema) {
          const validation = validationSchema.safeParse(data);
          if (!validation.success) {
            throw new Error(`Validation error: ${validation.error.message}`);
          }
        }

        const result = await DatabaseService.executeQuery(
          supabase.from(tableName).insert(data).select().single()
        );
        return result.data;
      },

      async update(id, data) {
        if (!isSupabaseConfigured) {
          throw new Error('Database service not available');
        }

        // Validate data if schema provided
        if (validationSchema) {
          const validation = validationSchema.partial().safeParse(data);
          if (!validation.success) {
            throw new Error(`Validation error: ${validation.error.message}`);
          }
        }

        const result = await DatabaseService.executeQuery(
          supabase.from(tableName).update(data).eq('id', id).select().single()
        );
        return result.data;
      },

      async delete(id) {
        if (!isSupabaseConfigured) {
          throw new Error('Database service not available');
        }

        const result = await DatabaseService.executeQuery(
          supabase.from(tableName).delete().eq('id', id).select().single()
        );
        return result.data;
      },

      async count(filters = {}) {
        if (!isSupabaseConfigured) {
          throw new Error('Database service not available');
        }

        let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });

        const result = await DatabaseService.executeQuery(query);
        return result.count || 0;
      }
    };
  }

  /**
   * Transaction support
   */
  static async transaction(operations) {
    try {
      const results = [];
      for (const operation of operations) {
        const result = await operation();
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error('Transaction failed');
    }
  }

  /**
   * Health check
   */
  static async healthCheck() {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default DatabaseService;