const apiKey = 'af1f708691a1a8fa6862a85e2cc240ea';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const fallbackImage = 'https://via.placeholder.com/500x750?text=No+Image';

/* Helper: handle image loading errors (retry once, then fallback) */
function handleImageError(imgEl, originalSrc) {
  if (!imgEl.dataset.retry) {
    imgEl.dataset.retry = 'true';
    setTimeout(() => {
      imgEl.src = originalSrc;
    }, 500);
  } else {
    imgEl.src = fallbackImage;
  }
}

/* ========== TOP SLIDESHOW (Hindi Movies) ========== */
let topSlides = [];
let currentSlideIndex = 0;

async function loadTopSlideshow() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=hi&sort_by=popularity.desc&api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    topSlides = data.results.slice(0, 10);
    const slidesContainer = document.getElementById('slidesContainer');

    topSlides.forEach(movie => {
      const slide = document.createElement('div');
      slide.className = 'slide';

      // Make slideshow clickable
      slide.addEventListener('click', () => {
        window.location.href = `movie.html?id=${movie.id}`;
      });

      const img = document.createElement('img');
      let src = movie.backdrop_path
        ? (imageBaseUrl + movie.backdrop_path)
        : (movie.poster_path ? (imageBaseUrl + movie.poster_path) : fallbackImage);
      img.src = src;
      img.onerror = () => handleImageError(img, src);

      slide.appendChild(img);
      slidesContainer.appendChild(slide);
    });

    // Show initial movie title
    updateTopMovieTitle(0);

    // Auto-scroll every 4 seconds
    setInterval(() => {
      if (topSlides.length > 0) {
        currentSlideIndex = (currentSlideIndex + 1) % topSlides.length;
        scrollToSlide(currentSlideIndex);
        updateTopMovieTitle(currentSlideIndex);
      }
    }, 4000);
  } catch (error) {
    console.error('Error loading top slideshow:', error);
  }
}

function scrollToSlide(index) {
  const slidesContainer = document.getElementById('slidesContainer');
  const containerWidth = slidesContainer.clientWidth;
  slidesContainer.scrollTo({
    left: containerWidth * index,
    behavior: 'smooth'
  });
}

function updateTopMovieTitle(index) {
  const topMovieTitleEl = document.getElementById('topMovieTitle');
  const movie = topSlides[index];
  topMovieTitleEl.textContent = movie ? (movie.title || 'No Title') : '';
}

/* ========== ENDLESS CATEGORIES (WITH LOAD MORE TILE) ========== */
const categoryPages = {
  recommended: 1,
  action: 1,
  new: 1,
  bollywood: 1,
  hollywood: 1,
  south: 1,
  punjabi: 1,
  anime: 1,
  kdrama: 1,
  chinese: 1,
};

/**
 * Load one page of movies for a category, then add a "Load More" tile.
 */
async function loadCategory(pageKey, url, containerId) {
  const container = document.getElementById(containerId);

  // Remove old load-more tile if present
  const oldTile = container.querySelector('.load-more-tile');
  if (oldTile) {
    container.removeChild(oldTile);
  }

  try {
    const fetchUrl = `${url}&page=${categoryPages[pageKey]}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const results = data.results || [];

    results.forEach(movie => {
      const item = document.createElement('div');
      item.className = 'movie-item';

      // Clicking the poster => go to details
      item.addEventListener('click', () => {
        window.location.href = `movie.html?id=${movie.id}`;
      });

      const img = document.createElement('img');
      const src = movie.poster_path
        ? (imageBaseUrl + movie.poster_path)
        : fallbackImage;
      img.src = src;
      img.onerror = () => handleImageError(img, src);
      img.alt = movie.title || 'Movie Poster';

      item.appendChild(img);
      container.appendChild(item);
    });

    // Increment page for next time
    categoryPages[pageKey]++;

    // Append new load-more tile
    const loadMoreTile = document.createElement('div');
    loadMoreTile.className = 'movie-item load-more-tile';
    loadMoreTile.style.display = 'flex';
    loadMoreTile.style.alignItems = 'center';
    loadMoreTile.style.justifyContent = 'center';
    loadMoreTile.style.backgroundColor = '#444';
    loadMoreTile.style.cursor = 'pointer';
    loadMoreTile.style.fontSize = '1.2rem';
    loadMoreTile.style.color = '#fff';
    loadMoreTile.style.fontWeight = 'bold';
    loadMoreTile.textContent = '+'; // Or "See More"
    loadMoreTile.addEventListener('click', () => {
      loadCategory(pageKey, url, containerId);
    });

    container.appendChild(loadMoreTile);

  } catch (error) {
    console.error(`Error loading category for ${pageKey}:`, error);
  }
}

/* Initialize each category (first load) */
function initRecommended() {
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`;
  loadCategory('recommended', url, 'recommended-carousel');
}
function initAction() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_genres=28&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('action', url, 'action-carousel');
}
function initNew() {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`;
  loadCategory('new', url, 'new-carousel');
}
function initBollywood() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=hi&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('bollywood', url, 'bollywood-carousel');
}
function initHollywood() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=en&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('hollywood', url, 'hollywood-carousel');
}
function initSouth() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('south', url, 'south-carousel');
}
function initPunjabi() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=pa&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('punjabi', url, 'punjabi-carousel');
}
function initAnime() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=ja&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('anime', url, 'anime-carousel');
}
function initKdrama() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=ko&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('kdrama', url, 'kdrama-carousel');
}
function initChinese() {
  const url = `https://api.themoviedb.org/3/discover/movie?with_original_language=zh&sort_by=popularity.desc&api_key=${apiKey}`;
  loadCategory('chinese', url, 'chinese-carousel');
}

/* ========== SEARCH OVERLAY ========== */
const searchOverlay = document.getElementById('searchOverlay');
const searchIcon = document.getElementById('searchIcon');
const searchCloseBtn = document.getElementById('searchCloseBtn');
const searchInput = document.getElementById('searchInput');
const searchGoBtn = document.getElementById('searchGoBtn');
const searchResults = document.getElementById('searchResults');

async function openSearchOverlay() {
  searchOverlay.style.display = 'flex';
  searchInput.value = '';
  searchResults.innerHTML = '';
  await loadTrendingInSearch();
}

function closeSearchOverlay() {
  searchOverlay.style.display = 'none';
}

async function loadTrendingInSearch() {
  const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    renderSearchResults(data.results || []);
  } catch (error) {
    console.error('Error loading trending for search:', error);
  }
}

async function searchMovies(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    renderSearchResults(data.results || []);
  } catch (error) {
    console.error('Error searching movies:', error);
  }
}

function renderSearchResults(results) {
  searchResults.innerHTML = '';
  if (!results.length) {
    const msg = document.createElement('p');
    msg.textContent = 'No movies found.';
    searchResults.appendChild(msg);
    return;
  }
  results.forEach(movie => {
    const div = document.createElement('div');
    div.className = 'search-item';
    div.addEventListener('click', () => {
      window.location.href = `movie.html?id=${movie.id}`;
    });

    const img = document.createElement('img');
    const src = movie.poster_path
      ? (imageBaseUrl + movie.poster_path)
      : fallbackImage;
    img.src = src;
    img.onerror = () => handleImageError(img, src);

    const title = document.createElement('div');
    title.className = 'search-item-title';
    title.textContent = movie.title || 'No Title';

    div.appendChild(img);
    div.appendChild(title);
    searchResults.appendChild(div);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Slideshow
  loadTopSlideshow();

  // Categories (first load)
  initRecommended();
  initAction();
  initNew();
  initBollywood();
  initHollywood();
  initSouth();
  initPunjabi();
  initAnime();
  initKdrama();
  initChinese();

  // Search overlay
  searchIcon.addEventListener('click', openSearchOverlay);
  searchCloseBtn.addEventListener('click', closeSearchOverlay);

  searchGoBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      loadTrendingInSearch();
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchGoBtn.click();
    }
  });
});
