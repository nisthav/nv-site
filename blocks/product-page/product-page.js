/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applyOilEffect(imgEl) {
    try {
      const form = new FormData();
      form.append('file', await fetch(imgEl.src).then((r) => r.blob()));
      form.append('radius', '4');
      form.append('intensity_levels', '20');

      const res = await fetch('https://oyyi.xyz/api/image/oil-paint', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      imgEl.src = url;
    } catch (e) {
      console.error('Oil effect error:', e);
      alert('Failed to apply oil painting.');
    }
  }

  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  const button = document.createElement('button');
  button.textContent = '🎨 Oil Painting';
  Object.assign(button.style, {
    marginTop: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
  });
  imgEl.closest('picture').parentNode.appendChild(button);

  button.addEventListener('click', async () => {
    button.textContent = '🛠️ Applying...';
    await applyOilEffect(imgEl);
    button.textContent = '🖼️ Done';
  });
}
