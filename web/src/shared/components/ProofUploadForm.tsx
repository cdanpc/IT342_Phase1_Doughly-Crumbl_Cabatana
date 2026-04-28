import { useRef, useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProofUploadFormProps {
  onSubmit: (file: File) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function ProofUploadForm({
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Submit Payment Proof',
}: ProofUploadFormProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setProofFile(file);
    setProofPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleRemove() {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!proofFile) return;
    await onSubmit(proofFile);
  }

  const canSubmit = !!proofFile && !isSubmitting;

  return (
    <div>
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, marginBottom: 8,
        }}
      >
        <Upload size={13} /> Upload Proof of Payment
        <span style={{ color: 'var(--color-primary)' }}>*</span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!proofPreview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', padding: '24px 16px',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-sm)', background: '#FAFAFA',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)',
            marginBottom: 12,
          }}
        >
          <Upload size={22} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Click to upload screenshot</span>
          <span style={{ fontSize: 12 }}>PNG, JPG up to 10MB</span>
        </button>
      ) : (
        <div
          style={{
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', marginBottom: 12,
          }}
        >
          <img
            src={proofPreview}
            alt="Proof"
            style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }}
          />
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', background: '#F7F7F7',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: '#16a34a', fontWeight: 600,
              }}
            >
              <CheckCircle size={14} /> {proofFile?.name}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)', fontSize: 12,
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: 12,
          background: canSubmit ? 'var(--color-primary)' : '#ccc',
          color: '#fff', fontWeight: 700, fontSize: 14,
          border: 'none', borderRadius: 'var(--radius-sm)',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
}
