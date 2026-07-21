import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Nota Zip';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 64,
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, marginBottom: 24 }}>
          Nota Zip
        </div>
        <div style={{ fontSize: 36, color: '#e2e8f0', maxWidth: 800 }}>
          Mensagens e áudios de WhatsApp viram finanças automáticas
        </div>
      </div>
    ),
    { ...size }
  );
}
