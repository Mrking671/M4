const apiKey = 'af1f708691a1a8fa6862a85e2cc240ea';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const fallbackImage = 'https://via.placeholder.com/500x750?text=No+Image';

/* Helper to handle image loading errors */
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

/* ========== CATEGORIES (WITH CLICK TO DETAILS) ========== */
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

async function loadCategory(pageKey, url, containerId) {
  try {
    const container = document.getElementById(containerId);
    const fetchUrl = `${url}&page=${categoryPages[pageKey]}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const results = data.results || [];

    results.forEach(movie => {
      const item = document.createElement('div');
      item.className = 'movie-item';

      // On click => go to movie.html?id=MOVIE_ID
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

    // Next page next time
    categoryPages[pageKey]++;
  } catch (error) {
    console.error(`Error loading category for ${pageKey}:`, error);
  }
}

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

// Show overlay & load trending movies initially
async function openSearchOverlay() {
  searchOverlay.style.display = 'flex';
  searchInput.value = '';
  searchResults.innerHTML = '';
  await loadTrendingInSearch();
}

// Hide overlay
function closeSearchOverlay() {
  searchOverlay.style.display = 'none';
}

async function loadTrendingInSearch() {
  const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const results = data.results || [];
    renderSearchResults(results);
  } catch (error) {
    console.error('Error loading trending for search:', error);
  }
}

// Perform a search
async function searchMovies(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const results = data.results || [];
    renderSearchResults(results);
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

    // On click => go to movie.html?id=MOVIE_ID
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Top Slideshow
  loadTopSlideshow();

  // Categories
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

  // Search overlay open/close
  searchIcon.addEventListener('click', openSearchOverlay);
  searchCloseBtn.addEventListener('click', closeSearchOverlay);

  // On "Search" button
  searchGoBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      loadTrendingInSearch();
    }
  });

  // On pressing Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchGoBtn.click();
    }
  });
});
