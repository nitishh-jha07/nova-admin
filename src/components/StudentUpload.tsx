import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { documentService, SUBJECTS, YEARS, BRANCHES, DocumentType } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface StudentUploadProps {
  onUploadSuccess?: () => void;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'notes', label: 'Notes' },
  { value: 'project', label: 'Project' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'other', label: 'Other' },
];

const StudentUpload: React.FC<StudentUploadProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('assignment');
  const [year, setYear] = useState(user?.year || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    setUploadSuccess(false);

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF or DOCX files only.');
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a document title.');
      return;
    }

    if (!subject) {
      setError('Please select a subject.');
      return;
    }

    if (!year) {
      setError('Please select a year.');
      return;
    }

    if (!branch) {
      setError('Please select a branch.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject);
      formData.append('documentType', documentType);
      formData.append('year', year);
      formData.append('branch', branch);

      await documentService.uploadDocument(formData);
      
      setUploadSuccess(true);
      setFile(null);
      setTitle('');
      setDescription('');
      setSubject('');
      setDocumentType('assignment');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Upload Document</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Once uploaded, documents are read-only and submitted for professor review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-primary bg-primary/5'
              : file
              ? 'border-green-500 bg-green-500/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />

          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">
                Drag & drop your file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supported: PDF, DOCX (max 10MB)
              </p>
            </>
          )}
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Subject <span className="text-destructive">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            >
              <option value="">Select Subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Document Type <span className="text-destructive">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Year <span className="text-destructive">*</span>
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            >
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Branch <span className="text-destructive">*</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            >
              <option value="">Select Branch</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title Input */}
        <Input
          id="title"
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title"
          required
        />

        {/* Description Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description of this document"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Document uploaded successfully! It is now pending review.
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!file || isUploading}
          isLoading={isUploading}
          leftIcon={!isUploading ? <Upload className="w-5 h-5" /> : undefined}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </form>
    </div>
  );
};

export default StudentUpload;
