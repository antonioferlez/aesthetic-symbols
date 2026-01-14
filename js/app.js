const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const tooltip = document.getElementById('tooltip');

// Cargar likes desde localStorage
function loadLikes() {
  const saved = localStorage.getItem('symbolLikes');
  return saved ? JSON.parse(saved) : {};
}

// Guardar likes en localStorage
function saveLikes(likes) {
  localStorage.setItem('symbolLikes', JSON.stringify(likes));
}

// Obtener emojis ordenados por likes
function getSortedEmojis() {
  const likes = loadLikes();
  return [...emojis].sort((a, b) => {
    const likesA = likes[a.symbol] || 0;
    const likesB = likes[b.symbol] || 0;
    return likesB - likesA;
  });
}

function renderEmojis(list) {
  grid.innerHTML = '';
  
  if (list.length === 0) {
    grid.innerHTML = '<div class="no-results">No se encontraron símbolos con ese nombre o tags ･ﾟ･(｡>ω<｡)</div>';
    return;
  }

  const likes = loadLikes();

  list.forEach(emoji => {
    const card = document.createElement('div');
    card.className = 'card';
    
    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'card-symbol';
    symbolSpan.textContent = emoji.symbol;
    
    const likeBtn = document.createElement('div');
    likeBtn.className = 'like-btn';
    const isLiked = likes[emoji.symbol] > 0;
    likeBtn.classList.toggle('liked', isLiked);
    likeBtn.innerHTML = isLiked ? '♥' : '♡';
    
    // Click en el símbolo para copiar
    symbolSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(emoji.symbol);
      
      const rect = card.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + 'px';
      tooltip.style.top = rect.top - 50 + 'px';
      tooltip.style.transform = 'translateX(-50%)';
      
      tooltip.classList.add('show');
      
      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 1500);
    });
    
    // Click en el botón de like
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentLikes = loadLikes();
      
      if (currentLikes[emoji.symbol]) {
        delete currentLikes[emoji.symbol];
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = '♡';
      } else {
        currentLikes[emoji.symbol] = 1;
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = '♥';
      }
      
      saveLikes(currentLikes);
      
      // Re-renderizar para actualizar el orden si no hay búsqueda activa
      if (searchInput.value.trim() === '') {
        renderEmojis(getSortedEmojis());
      }
    });
    
    card.appendChild(symbolSpan);
    card.appendChild(likeBtn);
    card.title = emoji.name;
    
    grid.appendChild(card);
  });
}

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  if (query === '') {
    renderEmojis(getSortedEmojis());
    return;
  }

  const filtered = emojis.filter(emoji => 
    emoji.tags.some(tag => tag.includes(query)) ||
    emoji.name.toLowerCase().includes(query)
  );
  
  // Ordenar resultados filtrados por likes también
  const likes = loadLikes();
  filtered.sort((a, b) => {
    const likesA = likes[a.symbol] || 0;
    const likesB = likes[b.symbol] || 0;
    return likesB - likesA;
  });
  
  renderEmojis(filtered);
});

// Renderizar con orden inicial por likes
renderEmojis(getSortedEmojis());