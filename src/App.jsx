import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import GenerateScreen from './components/GenerateScreen';
import { getProfile } from './api';
import './index.css';

const SESSION_KEY = 'responde_session';
const PROFILE_KEY = 'responde_profile';

export default function App() {
  const [screen, setScreen]   = useState('loading');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [welcome, setWelcome] = useState(null); // { type: 'first'|'returning', remaining }

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!savedSession) { setScreen('login'); return; }

    try {
      const s = JSON.parse(savedSession);
      setSession(s);
      const cachedProfile = localStorage.getItem(PROFILE_KEY);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        setWelcome({ type: 'returning', remaining: s.data.usage.remaining });
        setScreen('generate');
      } else {
        getProfile(s.accessCode)
          .then(p => {
            if (p) {
              localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
              setProfile(p);
              setWelcome({ type: 'returning', remaining: s.data.usage.remaining });
              setScreen('generate');
            } else {
              setWelcome({ type: 'first', remaining: s.data.usage.remaining });
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
          setWelcome({ type: 'returning', remaining: data.usage.remaining });
          setScreen('generate');
        } else {
          setWelcome({ type: 'first', remaining: data.usage.remaining });
          setScreen('profile');
        }
      })
      .catch(() => {
        setWelcome({ type: 'first', remaining: data.usage.remaining });
        setScreen('profile');
      });
  }

  function handleProfileSaved(savedProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile));
    setProfile(savedProfile);
    setScreen('generate');
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setSession(null);
    setProfile(null);
    setWelcome(null);
    setScreen('login');
  }

  if (screen === 'loading') return null;
  if (screen === 'login')   return <LoginScreen onLogin={handleLogin} />;
  if (screen === 'profile') return (
    <ProfileScreen
      accessCode={session.accessCode}
      initialProfile={profile}
      welcome={welcome}
      onSaved={handleProfileSaved}
      onSkip={profile ? () => setScreen('generate') : null}
    />
  );

  return (
    <GenerateScreen
      accessCode={session.accessCode}
      initialData={session.data}
      profile={profile}
      welcome={welcome}
      onEditProfile={() => setScreen('profile')}
      onLogout={handleLogout}
    />
  );
}
