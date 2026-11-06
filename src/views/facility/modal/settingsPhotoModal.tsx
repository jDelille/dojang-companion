import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { AV_COLORS, initials } from "../../../utils/json/settingsData";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Change Photo — ported from #modal-photo in tailwind/src/settings.html and
   openPhoto()/confirmPhoto() in assets/js/settings.js.
*/

type SettingsPhotoModalProps = {
  open: boolean;
  name: string;
  avatar: string;
  photo: string;
  onClose: () => void;
  onConfirm: (avatar: string, photo: string) => void;
};

const SettingsPhotoModal = ({
  open,
  name,
  avatar,
  photo,
  onClose,
  onConfirm,
}: SettingsPhotoModalProps) => {
  const [pick, setPick] = useState(avatar || "av-gold");
  const [url, setUrl] = useState(photo || "");
  const [err, setErr] = useState("");

  const submit = () => {
    const value = url.trim();
    if (value && !/^https?:\/\/.+/i.test(value)) {
      setErr("Enter a full URL starting with http:// or https://");
      return;
    }
    setErr("");
    onConfirm(pick, value);
    onClose();
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Change Photo</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className={`set-avatar${url.trim() ? "" : " " + pick}`}>
            {url.trim() ? <ImageWithBasePath src={url.trim()} alt="Preview" /> : initials(name)}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold c-text">Preview</div>
            <div className="text-[11px] c-dim">Pick a colour tile, or paste an image URL</div>
          </div>
        </div>
        <div className="mb-4">
          <span className="f-label">Avatar colour</span>
          <div className="av-grid" role="radiogroup" aria-label="Avatar colour">
            {AV_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`av-pick av ${c}${c === pick ? " sel" : ""}`}
                role="radio"
                aria-checked={c === pick}
                aria-label={c.replace("av-", "")}
                onClick={() => setPick(c)}
              >
                {initials(name)}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="f-label" htmlFor="ph-url">
            Image URL <span className="c-dim2 font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            id="ph-url"
            className="fp-input py-2.5 text-sm"
            placeholder="https://…/photo.jpg"
            autoComplete="off"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className={`f-error${err ? " show" : ""}`}>
            <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={submit}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPhotoModal;
