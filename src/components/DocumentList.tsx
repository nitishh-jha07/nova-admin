import React from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Clock, 
  User,
  FileIcon,
  MoreVertical
} from 'lucide-react';
import { Document } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  isLoading?: boolean;
  showUploader?: boolean;
  onDownload?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  canDelete?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  showUploader = true,
  onDownload,
  onDelete,
  canDelete = false,
}) => {
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
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
              {getFileIcon(doc.fileType)}
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">
                {doc.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {doc.description}
              </p>
              
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
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onDownload && (
                <button
                  onClick={() => onDownload(doc)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(doc)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
