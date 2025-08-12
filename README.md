# Road Trip Planner

A web application that solves the Traveling Salesman Problem (TSP) to find the optimal route for visiting multiple locations. Built with Next.js, TypeScript, and Google Maps API.

## 🌐 Live Demo
[Visit the website](https://yourwebsite.com)

## Features

- 🗺️ **Interactive Map**: Visualize your route on Google Maps
- 🧮 **Dynamic Programming**: Uses the Held-Karp algorithm for optimal route calculation
- 📍 **Address Geocoding**: Automatically converts addresses to coordinates
- 🎨 **Dark Theme**: Modern, eye-friendly dark interface
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Maps**: Google Maps JavaScript API, Google Maps Geocoding API
- **Algorithm**: Dynamic Programming (Held-Karp) for TSP
- **Styling**: Tailwind CSS with custom dark theme

## Getting Started

### Prerequisites

- Node.js 18+ 
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/road-trip-planner.git
cd road-trip-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Add Locations**: Enter the addresses of places you want to visit
2. **Optimize Route**: Click "Find Optimal Route" to calculate the shortest path
3. **View Results**: See the optimized route on the map and in the list below

## API Setup

To get a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API key)
5. Restrict the API key to your domain for security

## Algorithm

The application uses the Held-Karp dynamic programming algorithm to solve the TSP:

- **Time Complexity**: O(n²2ⁿ)
- **Space Complexity**: O(n2ⁿ)
- **Optimal Solution**: Guarantees the shortest possible route
- **Limitation**: Practical for up to 20-25 locations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Maps API for geocoding and map visualization
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling
