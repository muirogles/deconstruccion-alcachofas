// Full-screen QR in a native modal dialog
export function initQrDialog() {
  const dialog = document.getElementById('qr-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-qr-image]');
  const caption = dialog.querySelector('[data-qr-caption]');
  const title = dialog.querySelector('[data-qr-title]');

  document.querySelectorAll('[data-open-qr]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      image.src = button.dataset.qrSrc;
      image.alt = button.dataset.qrAlt;
      caption.textContent = button.dataset.qrCaption;
      title.textContent = button.dataset.qrTitle;
      dialog.returnTo = button;
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.returnTo?.focus());
}
