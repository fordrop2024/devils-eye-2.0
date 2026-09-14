import { Subtitle } from '../types';

export function downloadFile(content: string | Blob, filename: string, mimeType = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSubtitlesAsSrt(subtitles: Subtitle[]): string {
  return subtitles
    .map((sub, idx) => {
      const formatTime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
      };
      return `${idx + 1}\n${formatTime(sub.startTimeSec ?? sub.startSec ?? 0)} --> ${formatTime(sub.endTimeSec ?? sub.endSec ?? 0)}\n${sub.text}\n`;
    })
    .join('\n');
}

export function exportSubtitlesAsVtt(subtitles: Subtitle[]): string {
  const srt = exportSubtitlesAsSrt(subtitles);
  return `WEBVTT\n\n${srt.replace(/,/g, '.')}`;
}
