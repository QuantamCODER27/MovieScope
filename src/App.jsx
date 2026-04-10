import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_KEY = 'b174c362';
const DEFAULT_SEARCH = 'Star Wars';

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [heroMovie, setHeroMovie] = useState(null);

  const observer = useRef();
  const lastMovieElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && movies.length < totalResults) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, movies.length, totalResults]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchMovies = async (query, pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${pageNum}`);
      const data = await response.json();
      if (data.Response === 'True') {
        if (append) {
          setMovies(prev => [...prev, ...data.Search]);
        } else {
          setMovies(data.Search);
          setTotalResults(parseInt(data.totalResults));
          // Set hero movie from first result if it's page 1
          if (pageNum === 1 && data.Search.length > 0) {
            fetchHeroDetails(data.Search[0].imdbID);
          }
        }
      } else {
        if (!append) {
          setMovies([]);
          setError(data.Error);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroDetails = async (id) => {
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
      const data = await response.json();
      if (data.Response === 'True') {
        setHeroMovie(data);
      }
    } catch (err) {
      console.error("Hero fetch error", err);
    }
  };

  const fetchMovieDetails = async (id) => {
    setModalLoading(true);
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
      const data = await response.json();
      if (data.Response === 'True') {
        setSelectedMovie(data);
      }
    } catch (err) {
      console.error("Detail fetch error", err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(DEFAULT_SEARCH, 1, false);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(search || DEFAULT_SEARCH, page, true);
    }
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setPage(1);
      fetchMovies(search, 1, false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-container">
      <nav className="navbar glass">
        <div className="logo" onClick={() => {
          setSearch('');
          setPage(1);
          fetchMovies(DEFAULT_SEARCH, 1, false);
        }}>MovieScope</div>
        
        <div className="nav-actions">
          <form className="search-container" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="search-icon" style={{background: 'none', border: 'none'}}>
              🔍
            </button>
          </form>
          
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      <main className="main-content container">
        {heroMovie && !search && (
          <div className="hero">
            <img src={heroMovie.Poster} alt="Hero backdrop" className="hero-backdrop" />
            <div className="hero-content">
              <span className="hero-badge">Spotlight</span>
              <h1 className="hero-title">{heroMovie.Title}</h1>
              <p className="hero-description">{heroMovie.Plot}</p>
              <div className="movie-meta" style={{marginBottom: '20px'}}>
                <span>{heroMovie.Year}</span>
                <span>•</span>
                <span>{heroMovie.Runtime}</span>
                <span>•</span>
                <span>{heroMovie.Genre}</span>
              </div>
              <button className="btn-primary" onClick={() => fetchMovieDetails(heroMovie.imdbID)}>
                <span>View Details</span>
                <span>➜</span>
              </button>
            </div>
          </div>
        )}

        <div className="movie-grid">
          {movies.map((movie, index) => {
            if (movies.length === index + 1) {
              return (
                <div key={movie.imdbID} ref={lastMovieElementRef} className="movie-card" onClick={() => fetchMovieDetails(movie.imdbID)}>
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Poster'} 
                    alt={movie.Title} 
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.Title}</h3>
                    <div className="movie-meta">
                      <span>{movie.Year}</span>
                      <span>•</span>
                      <span style={{ textTransform: 'capitalize' }}>{movie.Type}</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={movie.imdbID} className="movie-card" onClick={() => fetchMovieDetails(movie.imdbID)}>
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Poster'} 
                    alt={movie.Title} 
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.Title}</h3>
                    <div className="movie-meta">
                      <span>{movie.Year}</span>
                      <span>•</span>
                      <span style={{ textTransform: 'capitalize' }}>{movie.Type}</span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
          {loading && [...Array(4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="movie-card skeleton" />
          ))}
        </div>

        {error && !loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            <p>{error}</p>
            <button 
              onClick={() => fetchMovies(DEFAULT_SEARCH)}
              style={{marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
            >
              Go Back
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMovie(null)}>×</button>
            <img src={selectedMovie.Poster} alt={selectedMovie.Title} className="modal-poster" />
            <div className="modal-body">
              <h2 style={{fontSize: '2.5rem', marginBottom: '10px'}}>{selectedMovie.Title}</h2>
              <div className="movie-meta" style={{marginBottom: '20px'}}>
                <span>{selectedMovie.Year}</span>
                <span>•</span>
                <span>{selectedMovie.Rated}</span>
                <span>•</span>
                <span>{selectedMovie.Runtime}</span>
              </div>
              
              <div className="rating-pill">
                ⭐ {selectedMovie.imdbRating} / 10
              </div>

              <div className="modal-info-item" style={{marginTop: '30px'}}>
                <span className="label">Plot</span>
                <p style={{lineHeight: '1.6', opacity: 0.9}}>{selectedMovie.Plot}</p>
              </div>

              <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
                <div className="modal-info-item">
                  <span className="label">Director</span>
                  <p>{selectedMovie.Director}</p>
                </div>
                <div className="modal-info-item">
                  <span className="label">Genre</span>
                  <p>{selectedMovie.Genre}</p>
                </div>
              </div>

              <div className="modal-info-item">
                <span className="label">Cast</span>
                <p>{selectedMovie.Actors}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>© 2026 MovieScope. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
