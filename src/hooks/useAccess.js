import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { horseLimit } from '@/lib/plans';

export default function useAccess() {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      const page = await base44.entities.Membership.filter({ user_id: me.id }, { limit: 1 });
      setUser(me);
      setMembership((page.items || [])[0] || null);
    } catch (err) {
      console.error('Could not load your plan', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isAdmin = user?.role === 'admin';
  const membershipActive = Boolean(membership) && (membership.status || 'active') === 'active';
  const plan = isAdmin ? 'admin' : membership?.plan === 'pro' ? 'pro' : 'free';

  return {
    loading,
    user,
    membership,
    isAdmin,
    plan,
    canLearn: plan === 'pro' || plan === 'admin',
    // AI Tools: paying Pro members and admins.
    canUseAiTools: isAdmin || (plan === 'pro' && membershipActive),
    // Resource Library downloads: paying Pro or Business members, and admins.
    canDownloadLibrary:
      isAdmin || (membershipActive && (plan === 'pro' || Boolean(membership?.business_membership))),
    horseLimit: horseLimit(plan),
    businessActive: isAdmin || Boolean(membership?.business_membership),
    refresh: load,
  };
}