const apiKey = 'af1f708691a1a8fa6862a85e2cc240ea';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const fallbackImage = 'https://via.placeholder.com/500x750?text=No+Image';

/* Basic error handling for images */
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

/* Parse movie ID from the URL: movie.html?id=XXXX */
function getMovieIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadMovieDetails(movieId) {
  try {
    // Using TMDB's /movie/{movie_id} endpoint
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    // Update UI
    document.getElementById('movieTitle').textContent = data.title || 'No Title';
    document.getElementById('movieOverview').textContent = data.overview || '';
    document.getElementById('movieReleaseDate').textContent = data.release_date || 'N/A';
    document.getElementById('movieRating').textContent = data.vote_average || 'N/A';

    // Poster
    const posterEl = document.getElementById('moviePoster');
    const src = data.poster_path ? (imageBaseUrl + data.poster_path) : fallbackImage;
    posterEl.src = src;
    posterEl.onerror = () => handleImageError(posterEl, src);

  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const movieId = getMovieIdFromURL();
  if (movieId) {
    loadMovieDetails(movieId);
  } else {
    console.error('No movie ID provided in URL');
  }
});
