import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Hash, Calendar, ShieldCheck, Save, Camera } from 'lucide-react';
import { Layout } from '../components/Layout';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Widget } from '@uploadcare/react-widget';

export const StudentProfile: React.FC = () => {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [semester, setSemester] = useState(userData?.semester || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = async (fileInfo: any) => {
    if (!user || !fileInfo) return;

    try {
      await updateDoc(doc(db, 'students', user.uid), {
        photoURL: fileInfo.cdnUrl
      });
      toast.success("Profile photo updated successfully!");
    } catch (error: any) {
      toast.error("Failed to save photo: " + error.message);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    // Indian Phone Number Validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return toast.error("Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.");
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'students', user.uid), {
        semester: semester,
        phone: phone
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and settings.</p>
        
        {supabase.storage.from('test').getPublicUrl('test').data.publicUrl.includes('missing-url') && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium animate-pulse">
            ⚠️ SYSTEM ALERT: Vercel is missing your Supabase Keys! Photo upload will not work until you fix the Environment Variables in the Vercel Dashboard.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-background shadow-lg relative group">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-primary">
                  {userData?.name?.charAt(0) || 'S'}
                </span>
              )}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Widget 
                  publicKey={import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || 'demopublickey'} 
                  onFileSelect={handlePhotoUpload}
                  previewStep={true}
                  clearable={true}
                  crop="1:1"
                  imagesOnly={true}
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">{userData?.name || 'Student Name'}</h2>
            <p className="text-muted-foreground mb-4">{userData?.email}</p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Account
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              {!isEditing ? (
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setSemester(userData?.semester || '');
                    setPhone(userData?.phone || '');
                  }}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="text-muted-foreground text-sm font-bold">Cancel</button>
                  <button 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    className="text-primary text-sm font-bold flex items-center gap-1"
                  >
                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border opacity-70">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{userData?.name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Student ID</label>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border opacity-70">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{userData?.studentId}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Current Semester</label>
                  {isEditing ? (
                    <select 
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full p-3 bg-background border border-primary rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                        const suffix = sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th';
                        const val = `${sem}${suffix} Sem`;
                        return (
                          <option key={sem} value={val}>
                            {sem}{suffix} Semester
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{userData?.semester || 'Not Specified'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full p-3 bg-background border border-primary rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{userData?.phone || 'Not Specified'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border opacity-70">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{userData?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
