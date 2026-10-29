import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { horseLimit } from '@/lib/plans';

export default function useAccess() {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const me = await base44.auth.me();
    const page = await base44.entities.Membership.filter({ user_id: me.id }, { limit: 1 });
    setUser(me);
    setMembership((page.items || [])[0] || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isAdmin = user?.role === 'admin';
  const plan = isAdmin ? 'admin' : membership?.plan === 'pro' ? 'pro' : 'free';

  return {
    loading,
    user,
    membership,
    isAdmin,
    plan,
    canLearn: plan === 'pro' || plan === 'admin',
    horseLimit: horseLimit(plan),
    businessActive: isAdmin || Boolean(membership?.business_membership),
    refresh: load,
  };
}