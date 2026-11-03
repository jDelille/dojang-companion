'use client';

import { useRef, type PointerEvent } from 'react';
import { Button } from '@/templates/roster/components/ui/button';

export default function SignaturePad({ onChange }: { onChange: (signature: string) => void }) {
  const canvas = useRef<HTMLCanvasElement | null>(null), drawing = useRef(false), hasInk = useRef(false);
  function point(event: PointerEvent<HTMLCanvasElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - box.left) * event.currentTarget.width / box.width, y: (event.clientY - box.top) * event.currentTarget.height / box.height };
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault(); const ctx = event.currentTarget.getContext('2d'); if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId); drawing.current = true;
    const p = point(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.strokeStyle = '#111111'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    event.preventDefault(); const ctx = event.currentTarget.getContext('2d'); if (!ctx) return;
    const p = point(event); ctx.lineTo(p.x, p.y); ctx.stroke(); hasInk.current = true;
  }
  function end() { if (!drawing.current) return; drawing.current = false; if (hasInk.current && canvas.current) onChange(canvas.current.toDataURL('image/png')); }
  return <div className="space-y-2"><p className="text-sm font-semibold">Signer’s signature</p>
    <canvas ref={canvas} width={800} height={240} aria-label="Signature drawing area; the selected signer must sign using touch, pen or mouse" className="h-40 w-full touch-none rounded-lg border border-(--crm-line) bg-white" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      Drawing a signature requires a device with a pointer or touch input.
    </canvas>
    <Button type="button" onClick={() => { canvas.current?.getContext('2d')?.clearRect(0, 0, 800, 240); drawing.current = false; hasInk.current = false; onChange(''); }}>Clear signature</Button>
    <p className="text-xs muted">The signer must personally provide their signature. If they cannot use this input, use the academy’s assisted signing process in Odoo.</p>
  </div>;
}
