import { useCallback } from 'react';

export function useClipboard() {
  const copyToClipboard = useCallback((text: string): boolean => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        // Copiado com sucesso
      }).catch(() => {
        // Erro ao copiar
      });
      return true;
    } else {
      // Fallback com textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const success = document.execCommand('copy');
        return success;
      } catch (err) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, []);

  return { copyToClipboard };
}
