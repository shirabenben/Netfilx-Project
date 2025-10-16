const axios = require('axios');

class OmdbService {
  constructor() {
    this.baseUrl = 'http://www.omdbapi.com';
    this.apiKey = process.env.OMDB_API_KEY;
  }

  // Get movie/TV details by title and year
  async getContentDetails(title, year = null) {
    try {
      const params = {
        apikey: this.apiKey,
        t: title, // Title search
        plot: 'short',
        r: 'json'
      };

      if (year) {
        params.y = year; // Year for better accuracy
      }

      const response = await axios.get(this.baseUrl, { params });

      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie/TV show not found');
      }

      return response.data;
    } catch (error) {
      console.error('OMDB API Error:', error.message);
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw error;
    }
  }

  // Extract Rotten Tomatoes rating from OMDB response
  extractRottenTomatoesRating(content) {
    if (!content.Ratings || !Array.isArray(content.Ratings)) {
      return null; // No ratings data available
    }

    const rtRating = content.Ratings.find(rating =>
      rating.Source && rating.Source.toLowerCase().includes('rotten tomatoes')
    );

    if (!rtRating) {
      return null; // Rotten Tomatoes rating not found for this content
    }

    // Extract percentage (e.g., "94%" -> 94)
    const percentageMatch = rtRating.Value.match(/(\d+)%/);
    if (!percentageMatch) {
      return null; // Could not parse Rotten Tomatoes percentage
    }

    return parseInt(percentageMatch[1]);
  }

  // Convert RT percentage to Netflix rating categories
  mapRtToNetflixRating(rtPercentage) {
    if (rtPercentage >= 90) {
      return 'TV-MA'; // Mature - highly rated mature content
    } else if (rtPercentage >= 70) {
      return 'TV-14'; // Teens - generally well-rated but may have mature themes
    } else if (rtPercentage >= 50) {
      return 'PG-13'; // Teens - moderately rated
    } else if (rtPercentage >= 30) {
      return 'PG'; // Parental Guidance - lower rated
    } else {
      return 'TV-PG'; // Family with guidance - very low rated
    }
  }

  // Main method to get Netflix rating suggestion from Rotten Tomatoes
  async getNetflixRatingSuggestion(title, year = null) {
    try {
      const content = await this.getContentDetails(title, year);
      const rtPercentage = this.extractRottenTomatoesRating(content);

      const suggestedRating = this.mapRtToNetflixRating(rtPercentage);

      return {
        success: true,
        title: content.Title,
        year: content.Year,
        rtRating: rtPercentage,
        suggestedRating: suggestedRating,
        fullInfo: {
          plot: content.Plot,
          genre: content.Genre,
          director: content.Director,
          actors: content.Actors,
          imdbRating: content.imdbRating
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: 'TV-14' // Default fallback
      };
    }
  }
}

module.exports = new OmdbService();
