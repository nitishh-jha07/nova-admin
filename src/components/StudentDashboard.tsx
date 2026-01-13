import React, { useState, useEffect } from 'react';
import { FileText, Upload, Clock, Eye, FolderOpen, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Document, documentService, SUBJECTS, YEARS } from '@/services/api';
import StudentUpload from './StudentUpload';
import DocumentList from './DocumentList';
import ProfileSection from './ProfileSection';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'my-docs' | 'all-docs' | 'profile'>('upload');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [myDocs, allDocs] = await Promise.all([
        documentService.getMyDocuments(user.id),
        documentService.getDocuments(),
      ]);
      setMyDocuments(myDocs);
      setAllDocuments(allDocs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleDownload = async (doc: Document) => {
    try {
      const url = await documentService.downloadDocument(doc.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.deleteDocument(doc.id);
      setMyDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredAllDocs = allDocuments.filter(doc => {
    const matchesSubject = !subjectFilter || doc.subject === subjectFilter;
    const matchesYear = !yearFilter || doc.year === yearFilter;
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesYear && matchesSearch;
  });

  const stats = [
    { label: 'Total Uploads', value: myDocuments.length, icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Approved', value: myDocuments.filter(d => d.status === 'approved').length, icon: Upload, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Pending', value: myDocuments.filter(d => d.status === 'submitted').length, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  const tabs = [
    { id: 'upload', label: 'Upload Document', icon: Upload },
    { id: 'my-docs', label: `My Documents (${myDocuments.length})`, icon: FileText },
    { id: 'all-docs', label: 'View All Documents', icon: FolderOpen },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Upload and manage your academic documents</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl border border-border p-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 font-medium text-sm transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'upload' && <StudentUpload onUploadSuccess={fetchDocuments} />}
        {activeTab === 'my-docs' && (
          <DocumentList documents={myDocuments} isLoading={isLoading} showUploader={false} onDownload={handleDownload} onDelete={handleDelete} canDelete={true} showStatus={true} />
        )}
        {activeTab === 'all-docs' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground" />
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background">
                <option value="">All Subjects</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background">
                <option value="">All Years</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <DocumentList documents={filteredAllDocs} isLoading={isLoading} showUploader={true} onDownload={handleDownload} canDelete={false} showStatus={true} />
          </div>
        )}
        {activeTab === 'profile' && <ProfileSection />}
      </div>
    </div>
  );
};

export default StudentDashboard;
