import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Hash, ShieldCheck, Save, Phone, MapPin } from 'lucide-react';
import { Layout } from '../components/Layout';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export const StudentProfile: React.FC = () => {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    semester: userData?.semester || ''
  });

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'students', user.uid), {
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        semester: editData.semester,
        updatedAt: serverTimestamp()
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-background shadow-lg">
              <span className="text-5xl font-bold text-primary">
                {userData?.name?.charAt(0) || 'S'}
              </span>
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
                    setEditData({
                      name: userData?.name || '',
                      phone: userData?.phone || '',
                      address: userData?.address || '',
                      semester: userData?.semester || ''
                    });
                  }}
                  className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="text-muted-foreground text-xs font-bold hover:text-foreground">Cancel</button>
                  <button 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                  >
                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Full Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="text" 
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-primary/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{userData?.name}</span>
                    </div>
                  )}
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
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <select 
                        value={editData.semester}
                        onChange={(e) => setEditData({...editData, semester: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-primary/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
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
                    </div>
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
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="tel" 
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-primary/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{userData?.phone || 'Not Provided'}</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground font-medium mb-2 block">Residential Address</label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-9 w-5 h-5 text-muted-foreground" />
                      <textarea 
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-primary/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{userData?.address || 'Not Provided'}</span>
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
