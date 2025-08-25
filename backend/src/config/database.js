import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Supabase client for easier queries
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PostgreSQL pool for direct SQL queries
export const pool = new Pool({
    host: 'db.dxbxqqfspwhkapmgrylz.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'UcpZcZIc943etV5V',
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

// Helper function to execute queries
export const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
};

// Helper function to get a client from the pool
export const getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds
    const timeout = setTimeout(() => {
        console.error('❌ A client has been checked out for more than 5 seconds!');
    }, 5000);
    
    client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };
    
    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release.apply(client);
    };
    
    return client;
};
