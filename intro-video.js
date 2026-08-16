(() => {
  'use strict';
  const actions = document.querySelector('.hero-actions');
  if (!actions || document.querySelector('#intro-video-dialog')) return;

  const trigger = document.createElement('button');
  trigger.id = 'open-intro-video';
  trigger.type = 'button';
  trigger.className = 'button secondary large video-button';
  trigger.innerHTML = '<span class="play-icon" aria-hidden="true">▶</span> Watch video';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'intro-video-dialog');
  actions.append(trigger);

  const dialog = document.createElement('dialog');
  dialog.id = 'intro-video-dialog';
  dialog.className = 'video-dialog';
  dialog.setAttribute('aria-labelledby', 'intro-video-title');
  dialog.innerHTML = `
    <div class="video-dialog-head">
      <h2 id="intro-video-title">NexaTrade introduction</h2>
      <button class="video-close" type="button" aria-label="Close video">×</button>
    </div>
    <video controls playsinline preload="metadata">
      <source src="video/intro.mp4" type="video/mp4">
      Your browser does not support HTML video.
    </video>`;
  document.body.append(dialog);

  const video = dialog.querySelector('video');
  const closeButton = dialog.querySelector('.video-close');
  const closeDialog = () => {
    video.pause();
    video.currentTime = 0;
    dialog.close();
  };

  trigger.addEventListener('click', () => {
    dialog.showModal();
    video.play().catch(() => {});
  });
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });
})();
