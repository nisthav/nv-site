/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applySketchEffect(imgEl, style, intensity) {
    try {
      const form = new FormData();
      form.append('file', await fetch(imgEl.src).then((r) => r.blob()));
      form.append('style', style); // pencil | charcoal | pen
      form.append('intensity', String(intensity)); // 0.1–1.0

      const res = await fetch('https://oyyi.xyz/api/image/sketch', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const blob = await res.blob();
      const blobURL = URL.createObjectURL(blob);
      const cacheBustURL = `${blobURL}?t=${Date.now()}`;

      // 🔁 Set new src on <img>
      imgEl.src = cacheBustURL;

      // 🔁 Also update <source> tags in the same <picture>
      const picture = imgEl.closest('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((srcTag) => {
          srcTag.removeAttribute('srcset');
          srcTag.setAttribute('srcset', cacheBustURL);
        });
      }

      // 🧹 Optional: Cleanup after a few seconds
      setTimeout(() => URL.revokeObjectURL(blobURL), 3000);
    } catch (e) {
      console.error('Sketch effect error:', e);
      alert('Failed to apply sketch effect.');
    }
  }

  const imgEl = block.querySelector('img');
  if (!imgEl) return;

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
