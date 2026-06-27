import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export default function CameraPage() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 800;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setPhotoUrl(canvas.toDataURL('image/jpeg', 0.8));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const goManual = () => {
    if (!photoUrl) return;
    nav('/analysis', {
      state: {
        lunch: { id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), photo: photoUrl, dishes: [], colorScore: 0, nutritionScore: 0, aiComment: '' },
        readonly: false,
      },
    });
  };

  return (
    <div className="page">
      <div className="header"><h1>📷 写真を撮る</h1></div>
      <div className="camera-page">
        {photoUrl ? (
          <>
            <img src={photoUrl} className="photo-preview" alt="プレビュー" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button className="btn-primary" onClick={goManual}>おかずを入力する</button>
              <button className="btn-secondary" onClick={() => setPhotoUrl(null)}>撮り直す</button>
            </div>
          </>
        ) : (
          <>
            <span className="emoji">🍱</span>
            <h2>お弁当の写真を選んでください</h2>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
            <button className="btn-primary" onClick={() => inputRef.current?.click()}>📷 カメラで撮影</button>
            <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} id="gallery-input" />
            <button className="btn-secondary" onClick={() => document.getElementById('gallery-input')?.click()}>
              🖼 ライブラリから選ぶ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
