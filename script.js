class MovieExplorer {

    constructor() {
        this.apiKey = "60ff5b28d357cb55797b688329ccb20c";
        this.baseUrl = "https://api.themoviedb.org/3";
        this.imgBaseUrl = "https://image.tmdb.org/t/p/w500";
        this.fallbackImg = "https://via.placeholder.com/500x750?text=No+Image";

        this.genres = {};
        this.currentFilters = {
            genre: "",
            year: "",
            sort: ""
        };

        this.isSearching = false;

        this.init();
    }


    async init() {
        await this.loadGenres();
        this.setupYearFilter();
        this.setupEventListeners();
        await this.loadTrendingMovies();
        await this.loadRandomMovies();
    }


    async loadGenres() {
        try {
            const res = await fetch(
                `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`
            );
            const data = await res.json();

            const genreSelect = document.getElementById("generalFilter");

            data.genres.forEach(g => {
                this.genres[g.id] = g.name;

                const option = document.createElement("option");
                option.value = g.id;
                option.textContent = g.name;
                genreSelect.appendChild(option);
            });

        } catch (err) {
            console.error("Genre load error:", err);
        }
    }


    setupYearFilter() {
        const yearSelect = document.getElementById("yearFilter");
        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year >= 1990; year--) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }


    setupEventListeners() {
        const searchInput = document.getElementById("searchInput");
        let debounce;

        searchInput.addEventListener("input", e => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 500);
        });

        document.getElementById("generalFilter")
            .addEventListener("change", () => this.handleFilterChange());

        document.getElementById("yearFilter")
            .addEventListener("change", () => this.handleFilterChange());

        document.getElementById("sortFilter")
            .addEventListener("change", () => this.handleFilterChange());

        document.getElementById("clearBtn")
            .addEventListener("click", () => this.clearAllFilters());

        document.getElementById("trendingPrev")
            .addEventListener("click", () => this.scrollCarousel("prev"));

        document.getElementById("trendingNext")
            .addEventListener("click", () => this.scrollCarousel("next"));
    }


    async loadTrendingMovies() {
        try {
            const res = await fetch(
                `${this.baseUrl}/trending/movie/day?api_key=${this.apiKey}`
            );
            const data = await res.json();

            this.displayTrendingMovies(data.results.slice(0, 10));

        } catch {
            document.getElementById("trendingCarousel").innerHTML =
                "<p>Error loading trending movies</p>";
        }
    }

    displayTrendingMovies(movies) {
        const carousel = document.getElementById("trendingCarousel");
        carousel.innerHTML = movies
            .map((m, i) => this.createTrendingCard(m, i + 1))
            .join("");
    }

    createTrendingCard(movie, rank) {
        const poster = movie.poster_path
            ? `${this.imgBaseUrl}${movie.poster_path}`
            : this.fallbackImg;

        return `
        <div class="trending-card">
            <img src="${poster}" alt="${movie.title}">
            <div class="trending-rank">#${rank}</div>
            <div class="trending-overlay">
                <h4>${movie.title}</h4>
                <p>⭐ ${movie.vote_average.toFixed(1)}</p>
            </div>
        </div>`;
    }

    scrollCarousel(dir) {
        const carousel = document.getElementById("trendingCarousel");
        carousel.scrollBy({
            left: dir === "prev" ? -320 : 320,
            behavior: "smooth"
        });
    }


    async handleSearch(query) {
        if (!query.trim()) {
            this.isSearching = false;
            document.getElementById("clearBtn").classList.remove("show");
            return this.loadRandomMovies();
        }

        this.isSearching = true;
        document.getElementById("clearBtn").classList.add("show");

        try {
            const res = await fetch(
                `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`
            );
            const data = await res.json();
            this.displayMovies(data.results);

        } catch (err) {
            console.error("Search error:", err);
        }
    }


    async handleFilterChange() {

        const genre = document.getElementById("generalFilter").value;
        const year = document.getElementById("yearFilter").value;
        const sort = document.getElementById("sortFilter").value;

        let url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}`;

        if (genre !== "none") url += `&with_genres=${genre}`;
        if (year !== "all") url += `&primary_release_year=${year}`;

        if (sort === "rating")
            url += "&sort_by=vote_average.desc";

        if (sort === "latest")
            url += "&sort_by=release_date.desc";

        document.getElementById("clearBtn").classList.add("show");

        try {
            const res = await fetch(url);
            const data = await res.json();
            this.displayMovies(data.results);

        } catch (err) {
            console.error("Filter error:", err);
        }
    }

    

    async loadRandomMovies() {
        const randomPage = Math.floor(Math.random() * 10) + 1;

        try {
            const res = await fetch(
                `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&page=${randomPage}`
            );
            const data = await res.json();
            this.displayMovies(data.results);

        } catch (err) {
            console.error("Movie load error:", err);
        }
    }

    

    displayMovies(movies) {
        const grid = document.getElementById("movieGrid");

        if (!movies || movies.length === 0) {
            grid.innerHTML = `<h2>No Movies Found</h2>`;
            return;
        }

        grid.innerHTML = movies
            .map(movie => this.createMovieCard(movie))
            .join("");
    }

    createMovieCard(movie) {
        const poster = movie.poster_path
            ? `${this.imgBaseUrl}${movie.poster_path}`
            : this.fallbackImg;

        return `
        <div class="movie-card">
            <img src="${poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                <p>${movie.overview?.slice(0, 100) || "No description"}...</p>
            </div>
        </div>`;
    }

    

    clearAllFilters() {
        document.getElementById("searchInput").value = "";
        document.getElementById("generalFilter").value = "none";
        document.getElementById("yearFilter").value = "all";
        document.getElementById("sortFilter").value = "none";
        document.getElementById("clearBtn").classList.remove("show");

        this.loadRandomMovies();
    }
}



document.addEventListener("DOMContentLoaded", () => {
    new MovieExplorer();
});

