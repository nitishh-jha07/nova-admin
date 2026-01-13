import React, { useState, useEffect } from 'react';
import { FileText, Users, Search, Filter, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Document, documentService, SUBJECTS, YEARS, DocumentStatus } from '@/services/api';
import DocumentList from './DocumentList';
import ProfileSection from './ProfileSection';
import AnalyticsSection from './AnalyticsSection';
import DocumentReviewModal from './DocumentReviewModal';

const ProfessorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | ''>('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'analytics' | 'profile'>('submissions');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  useEffect(() => {
    let filtered = [...documents];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d => d.title.toLowerCase().includes(q) || d.uploadedBy.name.toLowerCase().includes(q));
    }
    if (subjectFilter) filtered = filtered.filter(d => d.subject === subjectFilter);
    if (yearFilter) filtered = filtered.filter(d => d.year === yearFilter);
    if (statusFilter) filtered = filtered.filter(d => d.status === statusFilter);
    setFilteredDocuments(filtered);
  }, [searchQuery, subjectFilter, yearFilter, statusFilter, documents]);

  const handleDownload = async (doc: Document) => {
    const url = await documentService.downloadDocument(doc.id);
    window.open(url, '_blank');
  };

  const uniqueStudents = new Set(documents.map(d => d.uploadedBy.id)).size;
  const pendingCount = documents.filter(d => d.status === 'submitted').length;

  const tabs = [
    { id: 'submissions', label: 'Student Submissions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">Review and manage student document submissions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Documents</p><p className="text-2xl font-bold mt-1">{documents.length}</p></div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Students</p><p className="text-2xl font-bold mt-1">{uniqueStudents}</p></div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><Users className="w-6 h-6 text-green-500" /></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Pending Review</p><p className="text-2xl font-bold mt-1">{pendingCount}</p></div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center"><Filter className="w-6 h-6 text-warning" /></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background" />
            </div>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background">
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background">
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | '')} className="px-4 py-2.5 rounded-xl border border-border bg-background">
              <option value="">All Status</option>
              <option value="submitted">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <p className="text-sm text-muted-foreground">Showing {filteredDocuments.length} of {documents.length} documents</p>
          <DocumentList documents={filteredDocuments} isLoading={isLoading} showUploader={true} onDownload={handleDownload} onPreview={(doc) => setSelectedDocument(doc)} canDelete={false} showStatus={true} />
        </div>
      )}
      {activeTab === 'analytics' && <AnalyticsSection />}
      {activeTab === 'profile' && <ProfileSection />}

      {selectedDocument && (
        <DocumentReviewModal document={selectedDocument} isOpen={!!selectedDocument} onClose={() => setSelectedDocument(null)} onReviewComplete={fetchDocuments} />
      )}
    </div>
  );
};

export default ProfessorDashboard;
