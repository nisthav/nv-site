/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applySketchEffect(imgEl, style, intensity) {
    try {
      // 1. Fetch and prepare image blob
      const form = new FormData();
      const originalBlob = await fetch(imgEl.src).then((r) => r.blob());
      form.append('file', originalBlob);
      form.append('style', style); // pencil | charcoal | pen
      form.append('intensity', String(intensity)); // 0.1–1.0

      // 2. Call Oyyi sketch API
      const res = await fetch('https://oyyi.xyz/api/image/sketch', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      // 3. Convert API response to blob URL
      const blob = await res.blob();
      const blobURL = URL.createObjectURL(blob);
      const finalURL = `${blobURL}?t=${Date.now()}`; // Cache-busting

      // 4. Replace <img> src
      imgEl.src = finalURL;

      // 5. Replace all <source> srcsets to avoid overrides
      const picture = imgEl.closest('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((srcTag) => {
          srcTag.removeAttribute('srcset');
          srcTag.setAttribute('srcset', finalURL);
        });
      }

      // 6. Wait for image to load before revoking blob
      imgEl.onload = () => {
        URL.revokeObjectURL(blobURL);
      };
    } catch (e) {
      console.error('Sketch effect error:', e);
      alert('Failed to apply sketch effect.');
    }
  }

  // Get image inside the block
  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  // Create controls container
  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  // Style dropdown
  const selectStyle = document.createElement('select');
  ['pencil', 'charcoal', 'pen'].forEach((s) => {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s[0].toUpperCase() + s.slice(1);
    selectStyle.appendChild(o);
  });

  // Intensity dropdown
  const selectIntensity = document.createElement('select');
  [
    ['Light (0.3)', 0.3],
    ['Medium (0.6)', 0.6],
    ['Strong (0.9)', 0.9],
  ].forEach(([label, v]) => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = label;
    selectIntensity.appendChild(o);
  });

  // Sketch button
  const button = document.createElement('button');
  button.textContent = '✏️ Apply Sketch';
  Object.assign(button.style, {
    padding: '8px 12px',
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    background: '#f0f0f0',
  });

  // Append controls and bind click
  controls.append(selectStyle, selectIntensity, button);
  imgEl.closest('picture')?.parentNode.appendChild(controls);

  button.addEventListener('click', async () => {
    button.textContent = '🎨 Applying...';
    await applySketchEffect(
      imgEl,
      selectStyle.value,
      parseFloat(selectIntensity.value),
    );
    button.textContent = '✅ Done';
  });
}
