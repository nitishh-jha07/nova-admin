import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Clock, 
  User,
  FileIcon,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Document, DocumentStatus } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  isLoading?: boolean;
  showUploader?: boolean;
  onDownload?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
  canDelete?: boolean;
  showStatus?: boolean;
}

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  const config = {
    submitted: {
      icon: AlertCircle,
      label: 'Submitted',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  showUploader = true,
  onDownload,
  onDelete,
  onPreview,
  canDelete = false,
  showStatus = true,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileText className="w-8 h-8 text-green-500" />;
    }
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <FileText className="w-8 h-8 text-orange-500" />;
    }
    return <FileIcon className="w-8 h-8 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-card rounded-xl border border-border p-4 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Documents</h3>
        <p className="text-muted-foreground">
          No documents have been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div 
          key={doc.id}
          className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all duration-200 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* File Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                {getFileIcon(doc.fileType)}
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {doc.title}
                  </h3>
                  {showStatus && <StatusBadge status={doc.status} />}
                </div>
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {doc.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full">
                    {doc.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full">
                    {doc.year}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full capitalize">
                    {doc.documentType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {doc.fileName}
                  </span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                  </span>
                  {showUploader && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {doc.uploadedBy.name}
                      {doc.uploadedBy.rollNumber && ` (${doc.uploadedBy.rollNumber})`}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onPreview && (
                  <button
                    onClick={() => onPreview(doc)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={() => onDownload(doc)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
                {canDelete && onDelete && doc.status === 'submitted' && (
                  <button
                    onClick={() => onDelete(doc)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                {doc.professorComment && (
                  <button
                    onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="View feedback"
                  >
                    {expandedId === doc.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Professor Feedback Section */}
          {doc.professorComment && expandedId === doc.id && (
            <div className="px-4 pb-4">
              <div className={`p-4 rounded-lg ${
                doc.status === 'approved' 
                  ? 'bg-green-500/5 border border-green-500/20' 
                  : 'bg-destructive/5 border border-destructive/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {doc.reviewedBy?.name || 'Professor'}
                  </span>
                  {doc.reviewedAt && (
                    <span className="text-xs text-muted-foreground">
                      • {formatDistanceToNow(new Date(doc.reviewedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{doc.professorComment}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
