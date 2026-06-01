import { supabase } from '../supabaseClient';

export async function getAverageRating(userId) {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_id', userId);
  
  if (!data || data.length === 0) return null;
  
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  return {
    average: avg.toFixed(1),
    count: data.length
  };
}

export function StarDisplay({ rating, count, size = '1rem' }) {
  if (!rating) return null;
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <span style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
      <span style={{ color: '#E8A23A' }}>
        {'★'.repeat(full)}{'☆'.repeat(empty)}
      </span>
      <span style={{ color: '#888', fontSize: '0.8rem' }}>
        {rating} {count && `(${count})`}
      </span>
    </span>
  );
}