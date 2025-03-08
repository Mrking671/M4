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

/**
 * Attempts to fetch movie details from TMDB.
 * If a 404 or error occurs, we retry once more.
 */
async function loadMovieDetails(movieId, attempt = 1) {
  try {
    // Using TMDB's /movie/{movie_id} endpoint
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`Fetch attempt ${attempt} failed with status:`, res.status);
      if (attempt < 2) {
        // Retry once
        console.log('Retrying fetch for movie details...');
        return loadMovieDetails(movieId, attempt + 1);
      } else {
        // Second fail => show "Movie not found" message
        showMovieNotFound();
        return;
      }
    }

    const data = await res.json();
    updateMovieUI(data);
  } catch (error) {
    console.error(`Error fetching movie details (attempt ${attempt}):`, error);
    if (attempt < 2) {
      console.log('Retrying fetch for movie details after error...');
      return loadMovieDetails(movieId, attempt + 1);
    } else {
      showMovieNotFound();
    }
  }
}

/** Update the page UI with movie details */
function updateMovieUI(data) {
  document.getElementById('movieTitle').textContent = data.title || 'No Title';
  document.getElementById('movieOverview').textContent = data.overview || '';
  document.getElementById('movieReleaseDate').textContent = data.release_date || 'N/A';
  document.getElementById('movieRating').textContent = data.vote_average || 'N/A';

  // Poster
  const posterEl = document.getElementById('moviePoster');
  const src = data.poster_path ? (imageBaseUrl + data.poster_path) : fallbackImage;
  posterEl.src = src;
  posterEl.onerror = () => handleImageError(posterEl, src);
}

/** Show a fallback UI if movie not found */
function showMovieNotFound() {
  document.getElementById('movieTitle').textContent = 'Movie not found.';
  document.getElementById('movieOverview').textContent = '';
  document.getElementById('movieReleaseDate').textContent = '';
  document.getElementById('movieRating').textContent = '';
  document.getElementById('moviePoster').src = fallbackImage;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const movieId = getMovieIdFromURL();
  if (movieId) {
    loadMovieDetails(movieId);
  } else {
    console.error('No movie ID provided in URL');
    showMovieNotFound();
  }
});
