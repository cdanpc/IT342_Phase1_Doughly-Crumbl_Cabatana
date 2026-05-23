import { useRef, useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProofUploadForm.css';

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const MAX_PROOF_MB = MAX_PROOF_BYTES / 1024 / 1024;

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
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are accepted (PNG, JPG, etc.).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > MAX_PROOF_BYTES) {
        toast.error(`File too large. Maximum size is ${MAX_PROOF_MB} MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
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
      <label className="proof-upload__label">
        <Upload size={13} /> Upload Proof of Payment
        <span className="proof-upload__required">*</span>
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
          className="proof-upload__drop-area"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={22} />
          <span className="proof-upload__drop-label">Click to upload screenshot</span>
          <span className="proof-upload__drop-hint">PNG, JPG up to {MAX_PROOF_MB}MB</span>
        </button>
      ) : (
        <div className="proof-upload__preview">
          <img
            src={proofPreview}
            alt="Proof"
            className="proof-upload__preview-img"
          />
          <div className="proof-upload__preview-footer">
            <span className="proof-upload__file-name">
              <CheckCircle size={14} /> {proofFile?.name}
            </span>
            <button
              type="button"
              className="proof-upload__remove-btn"
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="proof-upload__submit-btn"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
}
