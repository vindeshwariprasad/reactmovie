# Project: Movie Database Web App

This project is a Movie Database Web Application built using React, Redux, and the TMDB API. The application allows users to browse and search for movies and TV shows, view detailed information, and explore different genres. The project is powered by Vite for fast development and deployment.

## Features

- **Home Page**: Displays trending movies and TV shows.
- **Details Page**: Displays detailed information about a specific movie or TV show.
- **Search Functionality**: Allows users to search for movies or TV shows by title.
- **Explore by Genre**: Enables users to explore content based on selected genres.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Error Handling**: Displays appropriate messages for errors or missing pages.

## Project Structure

The project follows a well-organized directory structure:

```
├── component/
│   ├── contentwrapper/
│   ├── coursel/
│   ├── footer/
│   ├── genres/
│   ├── header/
│   ├── lazyLoadImage/
│   ├── movieCard/
│   ├── rating/
│   ├── spinner/
│   ├── switchTabs/
│   └── videoPopup/
├── pages/
│   ├── 404/
│   ├── details/
│   ├── explore/
│   ├── home/
│   └── searchResult/
├── store/
│   ├── homeSlice.js
│   └── store.js
├── utils/
│   └── api.js
├── App.js
└── main.js
```

### Main Components

- **Header**: Includes navigation links to various pages like Home, Explore, etc.
- **Footer**: Contains app credits and additional links.
- **Home**: Displays the homepage with trending content.
- **Details**: Fetches and displays details for movies or TV shows.
- **SearchResults**: Shows results based on a user's search query.
- **Explore**: Allows users to explore movies and TV shows by genre.
- **PageNotFound**: A 404 page for handling broken or unknown routes.

### API Integration

The app uses the TMDB API to fetch data. This is handled through the `fetchdatafromapi` utility, which makes the requests to the API with proper authorization headers.

### Global State Management

- **Redux Toolkit** is used to manage global state such as API configuration and genres.
- The `homeSlice` reducer stores the base URL for images and the available genres.

### Custom Hooks

- `useFetch`: A custom hook to handle data fetching, loading states, and errors.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/movie-db-app.git
   ```

2. Navigate to the project directory:

   ```bash
   cd movie-db-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Add your TMDB API token:

   In the root of your project, create a `.env` file and add your TMDB token as shown:

   ```bash
   VITE_APP_TMDB_TOKEN=your_api_token_here
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000` to view the app.

## Build

To create a production build, run:

```bash
npm run build
```

## Dependencies

- **React**: Front-end UI library.
- **Redux Toolkit**: State management.
- **React Router**: Handles routing between pages.
- **Axios**: Used for making API requests.
- **Vite**: Build tool for faster development.


