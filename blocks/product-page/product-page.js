/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applyCartoonEffect(imgEl, intensity) {
    try {
      const form = new FormData();
      const originalBlob = await fetch(imgEl.src).then((r) => r.blob());
      form.append('file', originalBlob);
      form.append('intensity', String(intensity)); // typically between 0.1 and 1.0

      const res = await fetch('https://oyyi.xyz/api/image/cartoon', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Cartoon API error: ${res.status}`);

      const blob = await res.blob();
      const blobURL = URL.createObjectURL(blob);
      imgEl.src = blobURL;

      const picture = imgEl.closest('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((srcTag) => {
          srcTag.removeAttribute('srcset');
          srcTag.setAttribute('srcset', blobURL);
        });
      }

      imgEl.onload = () => {
        URL.revokeObjectURL(blobURL);
      };
    } catch (e) {
      console.error('Cartoon effect error:', e);
      alert('❌ Failed to apply cartoon effect.');
    }
  }

  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  // Intensity selector
  const selectIntensity = document.createElement('select');
  [
    ['Light (0.3)', 0.3],
    ['Medium (0.6)', 0.6],
    ['Strong (0.9)', 0.9],
  ].forEach(([label, val]) => {
    const option = document.createElement('option');
    option.value = val;
    option.textContent = label;
    selectIntensity.appendChild(option);
  });

  const button = document.createElement('button');
  button.textContent = '🎭 Apply Cartoon';
  Object.assign(button.style, {
    padding: '8px 12px',
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    background: '#f0f0f0',
  });

  controls.append(selectIntensity, button);
  imgEl.closest('picture')?.parentNode.appendChild(controls);

  button.addEventListener('click', async () => {
    button.textContent = '🎨 Applying...';
    await applyCartoonEffect(imgEl, parseFloat(selectIntensity.value));
    button.textContent = '✅ Done';
  });
}
