import { useRef } from 'react';
import { CheckCircle, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './FileUploadField.css';

interface FileUploadFieldProps {
  /** Currently selected File (controlled) */
  file?: File | null;
  /** Existing image URL for edit-mode preview (shown when no file is selected yet) */
  previewUrl?: string | null;
  /** Called with the new File when the user picks one, or null when they remove it */
  onChange: (file: File | null) => void;
  /** Accept string passed to <input type="file"> — defaults to "image/*" */
  accept?: string;
  /** Maximum file size in MB — defaults to 5 */
  maxSizeMB?: number;
  /** Field label text */
  label?: string;
  /** Whether the field is required (shows asterisk) */
  required?: boolean;
  /** Hint text shown inside the drop area */
  hint?: string;
  /** Max height for the preview image in px — defaults to 180 */
  previewHeight?: number;
  className?: string;
  /** Disable the field */
  disabled?: boolean;
}

export default function FileUploadField({
  file,
  previewUrl,
  onChange,
  accept = 'image/*',
  maxSizeMB = 5,
  label,
  required = false,
  hint,
  previewHeight = 180,
  className = '',
  disabled = false,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxBytes = maxSizeMB * 1024 * 1024;

  // The URL to show in the preview — prefer a fresh object URL from the
  // selected file; fall back to the pre-existing previewUrl from the server.
  const objectUrl = file ? URL.createObjectURL(file) : null;
  const displayUrl = objectUrl ?? previewUrl ?? null;
  const hasPreview = Boolean(displayUrl);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;

    if (!picked.type.startsWith('image/')) {
      toast.error('Only image files are accepted (PNG, JPG, WebP, etc.).');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (picked.size > maxBytes) {
      toast.error(`File too large. Maximum size is ${maxSizeMB} MB.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    onChange(picked);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const defaultHint = hint ?? `PNG, JPG, WebP — max ${maxSizeMB} MB`;

  return (
    <div className={`file-upload-field${className ? ` ${className}` : ''}`}>
      {label && (
        <label className="file-upload-field__label">
          <Upload size={13} />
          {label}
          {required && <span className="file-upload-field__required">*</span>}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label={label ?? 'Upload file'}
      />

      {hasPreview ? (
        <div className="file-upload-field__preview-wrap">
          <img
            src={displayUrl!}
            alt="Preview"
            className="file-upload-field__preview-img"
            style={{ maxHeight: previewHeight }}
            onError={(ev) => { (ev.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="file-upload-field__preview-footer">
            {file ? (
              <span className="file-upload-field__filename">
                <CheckCircle size={14} /> {file.name}
              </span>
            ) : (
              <span className="file-upload-field__existing-label">Current image</span>
            )}
            <div className="file-upload-field__preview-actions">
              {!disabled && (
                <>
                  <button
                    type="button"
                    className="file-upload-field__change-btn"
                    onClick={() => inputRef.current?.click()}
                  >
                    Change
                  </button>
                  {file && (
                    <button
                      type="button"
                      className="file-upload-field__remove-btn"
                      onClick={handleRemove}
                      aria-label="Remove selected file"
                    >
                      <X size={13} /> Remove
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="file-upload-field__drop-area"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          aria-label={`Upload ${label ?? 'file'}`}
        >
          <Upload size={22} className="file-upload-field__drop-icon" />
          <span className="file-upload-field__drop-label">Click to upload</span>
          <span className="file-upload-field__drop-hint">{defaultHint}</span>
        </button>
      )}
    </div>
  );
}
