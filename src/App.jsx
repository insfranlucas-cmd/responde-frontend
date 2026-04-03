import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import GenerateScreen from './components/GenerateScreen';
import { getProfile } from './api';
import './index.css';

const SESSION_KEY = 'responde_session';
const PROFILE_KEY = 'responde_profile';

export default function App() {
  const [screen, setScreen] = useState('loading'); // loading | login | profile | generate
  const [session, setSession] = useState(null);    // { accessCode, data }
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!savedSession) { setScreen('login'); return; }

    try {
      const s = JSON.parse(savedSession);
      setSession(s);
      const cachedProfile = localStorage.getItem(PROFILE_KEY);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        setScreen('generate');
      } else {
        // Fetch profile from backend
        getProfile(s.accessCode)
          .then(p => {
            if (p) {
              localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
              setProfile(p);
              setScreen('generate');
            } else {
              setScreen('profile');
            }
          })
          .catch(() => setScreen('profile'));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setScreen('login');
    }
  }, []);

  function handleLogin(accessCode, data) {
    const s = { accessCode, data };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);

    getProfile(accessCode)
      .then(p => {
        if (p) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
          setProfile(p);
          setScreen('generate');
        } else {
          setScreen('profile');
        }
      })
      .catch(() => setScreen('profile'));
  }

  function handleProfileSaved(savedProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile));
    setProfile(savedProfile);
    setScreen('generate');
  }

  function handleEditProfile() {
    setScreen('profile');
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setSession(null);
    setProfile(null);
    setScreen('login');
  }

  if (screen === 'loading') return null;

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        accessCode={session.accessCode}
        initialProfile={profile}
        onSaved={handleProfileSaved}
        onSkip={profile ? () => setScreen('generate') : null}
      />
    );
  }

  return (
    <GenerateScreen
      accessCode={session.accessCode}
      initialData={session.data}
      profile={profile}
      onEditProfile={handleEditProfile}
      onLogout={handleLogout}
    />
  );
}
