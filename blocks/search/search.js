export default function decorate(block) {
  const iconWrapper = block.querySelector('.icon-search');
  const iconImg = iconWrapper?.querySelector('img');
  const placeholder = block.querySelector('p')?.textContent?.trim();

  if (!iconWrapper || !iconImg) return;

  // Hide label text
  block.querySelectorAll('p').forEach((p) => {
    if (p.textContent.trim() === placeholder) p.style.display = 'none';
  });

  // Save icon URL
  const searchIconUrl = iconImg.src;

  // Create input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.className = 'search-input';
  input.style.backgroundImage = `url('${searchIconUrl}')`;
  input.style.backgroundRepeat = 'no-repeat';
  input.style.backgroundPosition = '10px center';
  input.style.paddingLeft = '30px';

  // Create top container and add input
  const topContainer = document.createElement('div');
  topContainer.className = 'search-top-fixed';
  topContainer.appendChild(input);
  block.appendChild(topContainer);

  // Create drawer container
  const drawer = document.createElement('div');
  drawer.className = 'search-drawer';
  drawer.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.className = 'drawer-input-wrapper';

  // Close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'drawer-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    drawer.style.display = 'none';
    topContainer.appendChild(input); // Move input back
    input.style.backgroundImage = `url('${searchIconUrl}')`; // Restore icon
    topContainer.style.display = 'block';
  });

  wrapper.appendChild(closeBtn); // Input added dynamically
  drawer.appendChild(wrapper);
  block.appendChild(drawer);

  // On input click → open drawer and move input
  input.addEventListener('click', () => {
    wrapper.insertBefore(input, closeBtn); // Move input into drawer
    input.style.backgroundImage = ''; // Remove search icon
    topContainer.style.display = 'none';
    drawer.style.display = 'block';
    input.focus();
  });
}
