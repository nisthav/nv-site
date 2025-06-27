/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applySketchEffect(imgEl, style, intensity) {
    try {
      // 1. Create FormData with original image blob
      const form = new FormData();
      const originalBlob = await fetch(imgEl.src).then((r) => r.blob());
      form.append('file', originalBlob);
      form.append('style', style); // 'pencil' | 'charcoal' | 'pen'
      form.append('intensity', String(intensity)); // 0.1–1.0

      // 2. Send to sketch API
      const res = await fetch('https://oyyi.xyz/api/image/sketch', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Sketch API error: ${res.status}`);

      // 3. Read and apply blob result
      const blob = await res.blob();
      const blobURL = URL.createObjectURL(blob);

      // 4. Set <img> src to new blob URL
      imgEl.src = blobURL;

      // 5. Also update <source> tags inside <picture>
      const picture = imgEl.closest('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((srcTag) => {
          srcTag.removeAttribute('srcset');
          srcTag.setAttribute('srcset', blobURL);
        });
      }

      // 6. Safely revoke blob URL after image has loaded
      imgEl.onload = () => {
        URL.revokeObjectURL(blobURL);
      };
    } catch (e) {
      console.error('Sketch effect error:', e);
      alert('❌ Failed to apply sketch effect.');
    }
  }

  // 🌟 Find the image inside the block
  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  // 🎛️ Create dropdowns and button
  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  // Style selector
  const selectStyle = document.createElement('select');
  ['pencil', 'charcoal', 'pen'].forEach((s) => {
    const option = document.createElement('option');
    option.value = s;
    option.textContent = s[0].toUpperCase() + s.slice(1);
    selectStyle.appendChild(option);
  });

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

  // Action button
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

  // Attach controls to the DOM
  controls.append(selectStyle, selectIntensity, button);
  imgEl.closest('picture')?.parentNode.appendChild(controls);

  // Bind click to apply sketch
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
