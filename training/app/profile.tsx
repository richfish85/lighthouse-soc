import { useEffect, useState } from 'react';
import { ArrowRight, UserRound } from 'lucide-react';
const key = 'lighthouse-profile-v1';
export const focuses = ['Junior analyst foundations', 'Identity', 'Endpoint', 'Email', 'Analyst Practice'];
type Profile = { name: string; focus: string };
export function readProfile(raw: string | null): Profile | null {
  try { const value = JSON.parse(raw ?? 'null'); return value && typeof value.name === 'string' && value.name.trim() && value.name.length <= 60 && focuses.includes(value.focus) ? { name: value.name.trim(), focus: value.focus } : null; } catch { return null; }
}
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState(focuses[0]);
  const [message, setMessage] = useState('');
  const [remove, setRemove] = useState(false);
  useEffect(() => {
    try {
      const saved = readProfile(localStorage.getItem(key));
      // Hydrate the optional device-local profile after the initial render.
      // oxlint-disable-next-line react/react-compiler
      if (saved) { setProfile(saved); setName(saved.name); setFocus(saved.focus); }
    } catch { setMessage('Device storage is unavailable. Guest training still works.'); }
  }, []);
  function save(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!name.trim()) { setMessage('Choose a display name.'); return; }
    const next = { name: name.trim(), focus };
    try { localStorage.setItem(key, JSON.stringify(next)); setProfile(next); setMessage('Your profile is saved on this device. Your existing practice progress is unchanged.'); }
    catch { setMessage('Your profile could not be saved. You can continue as a guest.'); }
  }
  return <section className="orientation-article"><div className="profile-panel"><UserRound size={28}/><p className="eyebrow">YOUR LEARNING SPACE</p><h1>{profile ? `Welcome back, ${profile.name}.` : 'Create your profile.'}</h1><p>Give your practice a name and choose a focus. This is a <strong>device-local profile</strong>, with no password, email address, or account required.</p><p className="small muted">There is no online sign-in or cross-device sync. Anyone using this browser profile can see these details. Clearing browser data removes them. Guest learners have access to every case.</p><form onSubmit={save}><label htmlFor="profile-name">Display name</label><input id="profile-name" maxLength={60} value={name} onChange={e => setName(e.target.value)} autoComplete="off"/><label htmlFor="profile-focus">Learning focus</label><select id="profile-focus" value={focus} onChange={e => setFocus(e.target.value)}>{focuses.map(item => <option key={item}>{item}</option>)}</select><button className="primary" type="submit">{profile ? 'Save profile changes' : 'Create local profile'} <ArrowRight size={16}/></button></form>{message && <output className="notice">{message}</output>}<div className="button-row"><a className="text-button" href="/training">{profile ? 'Continue training' : 'Continue as Guest'} <ArrowRight size={16}/></a><a className="text-button" href="/training/skills">Explore Analyst Skills</a></div>{profile && <><button className="text-button" onClick={() => setRemove(true)}>Remove this local profile</button>{remove && <div className="notice"><p>Remove your display name and focus? Case progress and notes will stay on this device.</p><div className="button-row"><button className="secondary" onClick={() => setRemove(false)}>Keep profile</button><button className="danger" onClick={() => { try { localStorage.removeItem(key); setProfile(null); setName(''); setRemove(false); setMessage('Local profile removed. Your case progress remains available.'); } catch { setMessage('Could not remove the local profile.'); } }}>Remove profile</button></div></div>}</>}</div></section>;
}
