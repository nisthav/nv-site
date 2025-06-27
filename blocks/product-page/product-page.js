/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applyAnimationEffect(imgEl, style, intensity) {
    try {
      // 1. Create FormData with original image blob
      const form = new FormData();
      const originalBlob = await fetch(imgEl.src).then((r) => r.blob());
      form.append('file', originalBlob);
      form.append('style', style); // 'pencil' | 'charcoal' | 'pen' or other animation styles
      form.append('intensity', String(intensity)); // 0.1–1.0

      // 2. Send to animation API
      const res = await fetch('https://oyyi.xyz/api/image/animate', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Animation API error: ${res.status}`);

      // 3. Read and apply blob result
      const blob = await res.blob();
      const blobURL = URL.createObjectURL(blob);

      // 4. Replace <img> with <video>
      const videoEl = document.createElement('video');
      videoEl.src = blobURL;
      videoEl.autoplay = true;
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.style.maxWidth = '100%';

      const picture = imgEl.closest('picture');
      if (picture) {
        picture.replaceWith(videoEl);
      } else {
        imgEl.replaceWith(videoEl);
      }

      videoEl.onloadeddata = () => {
        URL.revokeObjectURL(blobURL);
      };
    } catch (e) {
      console.error('Animation effect error:', e);
      alert('❌ Failed to apply animation effect.');
    }
  }

  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  // 🎛️ Controls
  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  const selectStyle = document.createElement('select');
  ['dance', 'cartoon', 'glitch'].forEach((s) => {
    const option = document.createElement('option');
    option.value = s;
    option.textContent = s[0].toUpperCase() + s.slice(1);
    selectStyle.appendChild(option);
  });

  const selectIntensity = document.createElement('select');
  [
    ['Subtle (0.3)', 0.3],
    ['Medium (0.6)', 0.6],
    ['Intense (0.9)', 0.9],
  ].forEach(([label, val]) => {
    const option = document.createElement('option');
    option.value = val;
    option.textContent = label;
    selectIntensity.appendChild(option);
  });

  const button = document.createElement('button');
  button.textContent = '🎞️ Animate Image';
  Object.assign(button.style, {
    padding: '8px 12px',
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    background: '#f0f0f0',
  });

  controls.append(selectStyle, selectIntensity, button);
  imgEl.closest('picture')?.parentNode.appendChild(controls);

  button.addEventListener('click', async () => {
    button.textContent = '🔄 Animating...';
    await applyAnimationEffect(
      imgEl,
      selectStyle.value,
      parseFloat(selectIntensity.value),
    );
    button.textContent = '✅ Done';
  });
}
