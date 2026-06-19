import { useState, useEffect } from 'react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../../lib/firebase';
import { Folder, FileText, CheckSquare, Plus, Loader2, Database, RefreshCw, Mail } from 'lucide-react';
import { User } from 'firebase/auth';

interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export default function GoogleWorkspaceIntegration() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [driveFiles, setDriveFiles] = useState<WorkspaceFile[]>([]);
  const [forms, setForms] = useState<WorkspaceFile[]>([]);
  const [emails, setEmails] = useState<Record<string, unknown>[]>([]);
  const [activeTab, setActiveTab] = useState<'drive' | 'forms' | 'gmail'>('drive');

  useEffect(() => {
    return initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
        setLoading(false);
        fetchDriveFiles(token);
        // Note: Google Forms API currently doesn't have a simple list endpoint like Drive without specific Drive queries.
        // We will fetch forms using Drive API with mimeType query for forms.
        fetchForms(token);
        fetchEmails(token);
      },
      () => {
        setNeedsAuth(true);
        setLoading(false);
      }
    );
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        fetchDriveFiles(result.accessToken);
        fetchForms(result.accessToken);
        fetchEmails(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriveFiles = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink)&q=trashed=false', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.files) setDriveFiles(data.files);
    } catch (err) {
      console.error('Error fetching Drive files', err);
    }
  };

  const fetchForms = async (token: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink)&q=mimeType='application/vnd.google-apps.form' and trashed=false", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.files) setForms(data.files);
    } catch (err) {
      console.error('Error fetching Forms', err);
    }
  };

  const fetchEmails = async (token: string) => {
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:unread', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.messages) {
        const emailDetails = await Promise.all(
          data.messages.map(async (msg: Record<string, unknown>) => {
            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return await msgRes.json();
          })
        );
        setEmails(emailDetails as Record<string, unknown>[]);
      }
    } catch (err) {
      console.error('Error fetching Emails', err);
    }
  };

  const handleRefresh = async () => {
    const token = await getAccessToken();
    if (token) {
      setLoading(true);
      fetchDriveFiles(token);
      fetchForms(token);
      fetchEmails(token);
      setLoading(false);
    }
  };

  if (loading && !driveFiles.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
         <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
         <p>Connecting to Google Workspace...</p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
        <Database size={64} className="text-slate-300 mb-6" />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Connect Google Workspace</h3>
        <p className="text-slate-600 mb-8 max-w-md text-center">
          Link your Google Drive and Google Forms to seamlessly manage teaching materials, access assessments, and organize student resources directly inside DARE.
        </p>
        <button onClick={handleLogin} className="gsi-material-button">
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper flex items-center bg-white border border-slate-300 rounded-lg pr-4 shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-600 font-medium">
            <div className="gsi-material-button-icon p-3 bg-white rounded-l-lg mr-3 border-r border-slate-200">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents py-3">Sign in with Google</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-emerald-500" /> Workspace Hub
          </h2>
          <p className="text-sm text-slate-500 mt-1">Connected as {user?.email}</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleRefresh} className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <RefreshCw size={18} />
           </button>
           <button onClick={logout} className="px-4 py-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm">
              Disconnect
           </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('drive')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'drive' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          <Folder size={16} /> My Drive Files
        </button>
        <button 
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'forms' ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          <CheckSquare size={16} /> My Assessments (Forms)
        </button>
        <button 
          onClick={() => setActiveTab('gmail')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'gmail' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          <Mail size={16} /> Recent Emails
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'drive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driveFiles.map(file => (
              <a 
                key={file.id} 
                href={file.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 border border-slate-200 rounded-2xl hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors text-emerald-600 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-700 truncate line-clamp-1">{file.name}</h4>
                  <p className="text-xs text-slate-500 truncate mt-1">Click to open in Drive</p>
                </div>
              </a>
            ))}
            {driveFiles.length === 0 && (
              <p className="text-slate-500 col-span-full">No recent files found in your Drive.</p>
            )}
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <a 
                href="https://docs.google.com/forms/u/0/create" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-200 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all group cursor-pointer h-full min-h-[90px]"
              >
                <Plus size={20} className="text-purple-500" />
                <span className="font-bold text-purple-700">Create New Assessment</span>
              </a>

            {forms.map(form => (
              <a 
                key={form.id} 
                href={form.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 border border-slate-200 rounded-2xl hover:shadow-md hover:border-purple-200 transition-all group"
              >
                <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors text-purple-600 shrink-0">
                  <CheckSquare size={20} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-700 truncate line-clamp-1">{form.name}</h4>
                  <p className="text-xs text-slate-500 truncate mt-1">Open Form</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'gmail' && (
          <div className="flex flex-col gap-4">
            {emails.map(email => {
              const payload = email.payload as { headers: { name: string; value: string }[] } | undefined;
              const subject = payload?.headers?.find((h) => h.name === 'Subject')?.value || 'No Subject';
              const from = payload?.headers?.find((h) => h.name === 'From')?.value || 'Unknown';
              return (
                <a 
                  key={email.id as string} 
                  href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 border border-slate-200 rounded-2xl hover:shadow-md hover:border-rose-200 transition-all group"
                >
                  <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors text-rose-600 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-700 truncate line-clamp-1">{from}</h4>
                    <p className="text-sm text-slate-600 truncate mt-1">{subject}</p>
                    <p className="text-xs text-slate-400 mt-1">{email.snippet}</p>
                  </div>
                </a>
              );
            })}
            {emails.length === 0 && (
              <p className="text-slate-500 col-span-full">No unread emails found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
