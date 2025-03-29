import Layout from '../components/Layout';
import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // Start the trading algorithm when the app loads
  useEffect(() => {
    // Function to start the trading algorithm
    const startAlgorithm = async () => {
      try {
        // Make a request to start the algorithm
        const response = await fetch('/api/algorithm/start', {
          method: 'POST',
        });
        
        if (!response.ok) {
          console.error('Failed to start algorithm:', await response.text());
        } else {
          console.log('Trading algorithm started successfully');
        }
      } catch (error) {
        console.error('Error starting algorithm:', error);
      }
    };

    // Call the function to start the algorithm
    startAlgorithm();

    // No cleanup needed as the algorithm should keep running
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp; 