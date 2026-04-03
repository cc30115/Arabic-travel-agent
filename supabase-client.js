import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://jwassvspufiemqdimatm.supabase.co';
const supabaseKey = 'sb_publishable_DsfnYU5nTxK_ZtaG8-z99Q_xfEAttI0';

export const supabase = createClient(supabaseUrl, supabaseKey);
