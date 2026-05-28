import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import { initAuth, googleSignIn, getAccessToken } from '../firebase';

export function GoogleMeetIntegration() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, cachedToken) => setToken(cachedToken),
      () => setToken(null)
    );
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError('Failed to connect Google account');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateMeet = async () => {
    if (!token) return;
    setIsCreating(true);
    setError('');
    try {
      const res = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        throw new Error('Failed to create space');
      }

      const data = await res.json();
      setMeetLink(data.meetingUri);
    } catch (err: any) {
      console.error('Create meet error:', err);
      setError('Failed to generate Meet link');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
         <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Video className="text-emerald-400" size={24} />
         </div>
         <h2 className="text-lg font-semibold text-white">Peer Mock Interviews</h2>
      </div>
      
      <p className="text-slate-400 text-sm mb-6">
        Practice with a friend. Connect your Google Account to generate instant Google Meet links for live mock interviews.
      </p>

      {error && (
        <div className="text-rose-400 text-sm mb-4 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          {error}
        </div>
      )}

      {!token ? (
        <button
          onClick={handleConnect}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          {isLoggingIn ? 'Connecting...' : 'Connect Google Workspace'}
        </button>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleCreateMeet}
            disabled={isCreating}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Video size={18} />
            {isCreating ? 'Generating Link...' : 'Create Meet Link'}
          </button>
          
          {meetLink && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
              <p className="text-slate-400 text-xs mb-1">Share this link to start</p>
              <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:underline break-all">
                {meetLink}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
