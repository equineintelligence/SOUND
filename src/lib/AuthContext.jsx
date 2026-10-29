import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const userIdRef = useRef(null);

  // `silent` refreshes the user without showing the full-page spinner. The
  // spinner replaces the whole page, so showing it after the first load would
  // wipe any half-filled form.
  const checkUserAuth = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      userIdRef.current = currentUser.id;
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      userIdRef.current = null;
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      if (!silent) setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    // getSession waits for Supabase to finish any sign-in that came back in the
    // URL (Google sign-in, email confirmation or password-reset links).
    checkUserAuth();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase re-announces SIGNED_IN whenever the tab regains focus. Only
      // react when the signed-in person actually changes.
      const nextId = session?.user?.id || null;
      if (event === 'SIGNED_OUT') {
        if (userIdRef.current) setTimeout(() => checkUserAuth({ silent: true }), 0);
        return;
      }
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && nextId !== userIdRef.current) {
        // Run outside the auth callback, as Supabase recommends.
        setTimeout(() => checkUserAuth({ silent: true }), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [checkUserAuth]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) base44.auth.logout(window.location.href);
    else supabase.auth.signOut();
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState: checkUserAuth,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
