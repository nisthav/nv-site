/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applySketchEffect(imgEl, style, intensity) {
    try {
      const form = new FormData();
      form.append('file', await fetch(imgEl.src).then(r => r.blob()));
      form.append('style', style);          // 'pencil' | 'charcoal' | 'pen'
      form.append('intensity', String(intensity)); // 0.1–1.0

      const res = await fetch('https://oyyi.xyz/api/image/sketch', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const blob = await res.blob();
      const objectURL = URL.createObjectURL(blob);

      // 🛠️ Apply blob with cache-busting param to ensure visual update
      imgEl.src = objectURL + `?t=${Date.now()}`;

      // (Optional) Cleanup object URL after some time
      setTimeout(() => URL.revokeObjectURL(objectURL), 3000);
    } catch (e) {
      console.error('Sketch effect error:', e);
      alert('Failed to apply sketch effect.');
    }
  }

  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  // Style chooser dropdown
  const selectStyle = document.createElement('select');
  ['pencil', 'charcoal', 'pen'].forEach(s => {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s[0].toUpperCase() + s.slice(1);
    selectStyle.appendChild(o);
  });

  // Intensity chooser dropdown
  const selectIntensity = document.createElement('select');
  [
    ['Light (0.3)', 0.3],
    ['Medium (0.6)', 0.6],
    ['Strong (0.9)', 0.9]
  ].forEach(([label, v]) => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = label;
    selectIntensity.appendChild(o);
  });

  const button = document.createElement('button');
  button.textContent = '✏️ Apply Sketch';
  Object.assign(button.style, {
    padding: '8px 12px',
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    background: '#f5f5f5',
  });

  controls.append(selectStyle, selectIntensity, button);
  imgEl.closest('picture').parentNode.appendChild(controls);

  button.addEventListener('click', async () => {
    button.textContent = '🎨 Applying...';
    await applySketchEffect(
      imgEl,
      selectStyle.value,
      parseFloat(selectIntensity.value)
    );
    button.textContent = '✅ Done';
  });
}
