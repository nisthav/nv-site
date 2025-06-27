/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applyEmbossEffect(imgEl, angle, strength) {
    try {
      const form = new FormData();
      const originalBlob = await fetch(imgEl.src).then((r) => r.blob());
      form.append('file', originalBlob);
      form.append('angle', angle);         // '0', '45', '90', etc.
      form.append('strength', String(strength)); // '0.5' to '5.0'

      const res = await fetch('https://oyyi.xyz/api/image/emboss', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Emboss API error: ${res.status}`);

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
      console.error('Emboss effect error:', e);
      alert('❌ Failed to apply emboss effect.');
    }
  }

  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  // Angle dropdown
  const selectAngle = document.createElement('select');
  ['0', '45', '90', '135', '180', '225', '270', '315'].forEach((angle) => {
    const option = document.createElement('option');
    option.value = angle;
    option.textContent = `Angle ${angle}°`;
    selectAngle.appendChild(option);
  });

  // Strength dropdown
  const selectStrength = document.createElement('select');
  [
    ['Soft (0.5)', 0.5],
    ['Medium (2.5)', 2.5],
    ['Strong (5.0)', 5.0],
  ].forEach(([label, val]) => {
    const option = document.createElement('option');
    option.value = val;
    option.textContent = label;
    selectStrength.appendChild(option);
  });

  // Button
  const button = document.createElement('button');
  button.textContent = '💠 Apply Emboss';
  Object.assign(button.style, {
    padding: '8px 12px',
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    background: '#f0f0f0',
  });

  controls.append(selectAngle, selectStrength, button);
  imgEl.closest('picture')?.parentNode.appendChild(controls);

  button.addEventListener('click', async () => {
    button.textContent = '🛠️ Applying...';
    await applyEmbossEffect(imgEl, selectAngle.value, parseFloat(selectStrength.value));
    button.textContent = '✅ Done';
  });
}
