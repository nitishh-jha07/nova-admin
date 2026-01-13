import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, User, Clock, Download } from 'lucide-react';
import { Document, documentService } from '@/services/api';
import Button from '@/components/common/Button';
import { formatDistanceToNow } from 'date-fns';

interface DocumentReviewModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onReviewComplete: () => void;
}

const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onReviewComplete,
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setAction('approve');
    try {
      await documentService.approveDocument(document.id, comment);
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Failed to approve document:', error);
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setIsSubmitting(true);
    setAction('reject');
    try {
      await documentService.rejectDocument(document.id, comment);
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Failed to reject document:', error);
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  const handleDownload = async () => {
    try {
      const url = await documentService.downloadDocument(document.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Review Document</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Document Info */}
          <div className="bg-muted/30 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{document.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {document.subject}
                  </span>
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                    {document.year}
                  </span>
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full capitalize">
                    {document.documentType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {document.uploadedBy.name}
                    {document.uploadedBy.rollNumber && ` (${document.uploadedBy.rollNumber})`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
                  </span>
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview/Download */}
          <div className="mb-5">
            <Button
              variant="secondary"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Download & Preview Document
            </Button>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Remark / Comment {action === 'reject' && <span className="text-destructive">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your feedback or remarks here..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border bg-muted/30">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            isLoading={isSubmitting && action === 'reject'}
            leftIcon={!isSubmitting ? <XCircle className="w-4 h-4" /> : undefined}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            isLoading={isSubmitting && action === 'approve'}
            leftIcon={!isSubmitting ? <CheckCircle className="w-4 h-4" /> : undefined}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewModal;
