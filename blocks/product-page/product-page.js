/* eslint-disable linebreak-style */
export default function decorate(block) {
  async function applyAnimeEffect(imgEl) {
    try {
      const imgBlob = await fetch(imgEl.src).then((r) => r.blob());

      // 1. Upload image to Replicate's storage
      const uploadMetaRes = await fetch('https://api.replicate.com/v1/upload/data', {
        method: 'POST',
        headers: {
          Authorization: 'Token YOUR_API_TOKEN', // 🔁 Replace with your Replicate token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'image.png',
          content_type: imgBlob.type,
        }),
      });

      const uploadMeta = await uploadMetaRes.json();

      // 2. Upload actual image blob to the signed URL
      await fetch(uploadMeta.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': imgBlob.type },
        body: imgBlob,
      });

      // 3. Call AnimeGAN model with uploaded image URL
      const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: 'Token YOUR_API_TOKEN', // 🔁 Replace with your token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '4c4f02a3c84c3e2440dc09893c06fb2ee3c9c391739ac00e0a3002bf8e3e5a19',
          input: {
            image: uploadMeta.upload_url,
          },
        }),
      });

      const prediction = await predictionRes.json();

      // 4. Poll until image is ready
      let result;
      while (!result || result.status !== 'succeeded') {
        await new Promise((r) => setTimeout(r, 2000));
        const check = await fetch(prediction.urls.get, {
          headers: { Authorization: 'r8_MZdW7TeVQDQP1X7RDvwas4fkKrdePaA3uByjU' },
        });
        result = await check.json();
        if (result.status === 'failed') throw new Error('Generation failed');
      }

      // 5. Replace <img> with anime-style version
      const animeUrl = result.output;
      imgEl.src = animeUrl;

      const picture = imgEl.closest('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((srcTag) => {
          srcTag.removeAttribute('srcset');
          srcTag.setAttribute('srcset', animeUrl);
        });
      }
    } catch (e) {
      console.error('Anime effect error:', e);
      alert('❌ Failed to apply anime effect.');
    }
  }

  // 🌟 Find the image inside the block
  const imgEl = block.querySelector('img');
  if (!imgEl) return;

  // 🎛️ Create and style the button
  const controls = document.createElement('div');
  controls.style.marginTop = '10px';

  const button = document.createElement('button');
  button.textContent = '🧚 Apply Ghibli Style';
  Object.assign(button.style, {
    padding: '8px 12px',
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    background: '#f0f0f0',
  });

  // Attach button to DOM
  controls.append(button);
  imgEl.closest('picture')?.parentNode.appendChild(controls);

  // Bind click
  button.addEventListener('click', async () => {
    button.textContent = '🎨 Applying...';
    await applyAnimeEffect(imgEl);
    button.textContent = '✅ Done';
  });
}
