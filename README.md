# ASW Backend with Supabase

This backend application connects to Supabase for database operations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment Variables:
Create a `.env` file in the root directory with the following variables:
```
SUPABASE_URL=https://idoaahigjtsppwdgzums.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
```

## Supabase Integration

This project uses `@supabase/supabase-js` to connect to Supabase. The connection is set up in `supabaseClient.js` with two clients:

- `supabaseClient`: Uses the anonymous key with limited permissions
- `supabaseAdmin`: Uses the service role key for backend operations with full access

## Running the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /`: Test server endpoint
- `GET /api/test-supabase`: Test Supabase connection
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get a specific user
- `POST /api/users`: Create a new user
- `PUT /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user

## Usage Example

```javascript
// Example: Using Supabase in a controller
const { supabaseClient } = require('./supabaseClient');

async function getUserData(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('registration_and_other_details')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
} 