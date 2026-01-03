import React, { useState, useEffect } from 'react';
import { FileText, Upload, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Document, documentService } from '@/services/api';
import StudentUpload from './StudentUpload';
import DocumentList from './DocumentList';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents'>('upload');

  const fetchDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const docs = await documentService.getMyDocuments(user.id);
      setDocuments(docs);
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
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const stats = [
    {
      label: 'Total Uploads',
      value: documents.length,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'This Month',
      value: documents.filter(d => {
        const docDate = new Date(d.createdAt);
        const now = new Date();
        return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
      }).length,
      icon: Upload,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Latest Upload',
      value: documents.length > 0 
        ? new Date(documents[0].createdAt).toLocaleDateString() 
        : 'N/A',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage your academic documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-card rounded-xl border border-border p-5 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.isText ? 'text-base' : ''} text-foreground`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'upload'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </span>
          {activeTab === 'upload' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'documents'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Documents ({documents.length})
          </span>
          {activeTab === 'documents' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'upload' ? (
          <StudentUpload onUploadSuccess={fetchDocuments} />
        ) : (
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            showUploader={false}
            onDownload={handleDownload}
            onDelete={handleDelete}
            canDelete={true}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
