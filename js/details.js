const apiKey = 'af1f708691a1a8fa6862a85e2cc240ea'; // Your TMDB API key
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
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`Fetch attempt ${attempt} failed with status:`, res.status);
      if (attempt < 2) {
        console.log('Retrying fetch for movie details...');
        return loadMovieDetails(movieId, attempt + 1);
      } else {
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
  document.getElementById('bannerTitle').textContent = data.title || 'No Title';
  document.getElementById('bannerOverview').textContent = data.overview || '';

  document.getElementById('movieTitle').textContent = data.title || 'No Title';
  document.getElementById('movieOverview').textContent = data.overview || '';
  document.getElementById('movieReleaseDate').textContent = data.release_date || 'N/A';
  document.getElementById('movieRating').textContent = data.vote_average || 'N/A';

  // Banner image
  const bannerImage = document.getElementById('bannerImage');
  if (data.backdrop_path) {
    bannerImage.src = imageBaseUrl + data.backdrop_path;
  } else {
    bannerImage.src = fallbackImage;
  }
  bannerImage.onerror = () => handleImageError(bannerImage, bannerImage.src);

  // Poster
  const posterEl = document.getElementById('moviePoster');
  const src = data.poster_path ? (imageBaseUrl + data.poster_path) : fallbackImage;
  posterEl.src = src;
  posterEl.onerror = () => handleImageError(posterEl, src);
}

/** Show a fallback UI if movie not found */
function showMovieNotFound() {
  document.getElementById('bannerTitle').textContent = 'Movie not found.';
  document.getElementById('bannerOverview').textContent = '';

  document.getElementById('movieTitle').textContent = 'Movie not found.';
  document.getElementById('movieOverview').textContent = '';
  document.getElementById('movieReleaseDate').textContent = '';
  document.getElementById('movieRating').textContent = '';

  const bannerImage = document.getElementById('bannerImage');
  bannerImage.src = fallbackImage;

  const posterEl = document.getElementById('moviePoster');
  posterEl.src = fallbackImage;
}

// On DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const movieId = getMovieIdFromURL();
  if (movieId) {
    loadMovieDetails(movieId);
  } else {
    console.error('No movie ID provided in URL');
    showMovieNotFound();
  }

  // Download button => calls /download?objectId=someMongoId
  // Note: The "movieId" from TMDB is NOT the same as the "objectId" from Mongo.
  // So you must link them or pass the real Mongo _id in the query param if you want to download from your DB.
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.addEventListener('click', () => {
    // For the Telegram DB approach, you want ?objectId=someMongoId
    // But right now we only have "movieId" from TMDB in the URL.
    // Example usage:
    //  movie.html?id=ABC123&objectId=67cd02c39eec498e22cea41a
    // Then parse objectId from the URL too.

    const params = new URLSearchParams(window.location.search);
    const objectId = params.get('objectId'); 
    if (!objectId) {
      alert('No objectId found in URL! Cannot download from DB.');
      return;
    }

    const downloadUrl = `/download?objectId=${objectId}`;
    window.location.href = downloadUrl;
  });
});
