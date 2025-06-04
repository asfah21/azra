import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '../auth/[...nextauth]/route';
import { Session } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: breakdowns, error } = await supabase
    .from('Breakdown')
    .select('*')
    .eq('reportedById', session.user.id);

  if (error) {
    return new Response(JSON.stringify({ error }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ breakdowns }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}