
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, X } from 'lucide-react';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

interface DocumentUploadProps {
  applicationId: string;
  onUploadComplete?: () => void;
}

export const DocumentUpload = ({ applicationId, onUploadComplete }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const { uploadDocument, uploading } = useDocumentUpload();

  const documentTypes = [
    { value: 'identity_proof', label: 'Identity Proof' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'income_proof', label: 'Income Proof' },
    { value: 'caste_proof', label: 'Caste Proof' },
    { value: 'other', label: 'Other Document' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !documentName) {
      return;
    }

    try {
      await uploadDocument(applicationId, {
        file: selectedFile,
        documentType,
        documentName
      });
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      setDocumentName('');
      
      // Clear file input
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onUploadComplete?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDocumentName('');
    const fileInput = document.getElementById('document-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload supporting documents for your certificate application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-name">Document Name</Label>
          <Input
            id="document-name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter document name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-file">Select File</Label>
          <Input
            id="document-file"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || !documentName || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
