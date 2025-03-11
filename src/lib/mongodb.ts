import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
// Optimized connection options for serverless environment
const options = {
  connectTimeoutMS: 10000, // 10 seconds connection timeout
  socketTimeoutMS: 10000, // 10 seconds socket timeout
  serverSelectionTimeoutMS: 10000, // 10 seconds server selection timeout
  maxPoolSize: 10, // Limit connection pool size
  minPoolSize: 1, // Maintain at least one connection
  maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
  waitQueueTimeoutMS: 10000, // How long to wait for a connection from the pool
};

let client;
let clientPromise: Promise<MongoClient>;

// Global variable to track connection status
let isConnected = false;

// Function to check connection status - can be exported and used elsewhere
export const checkConnection = () => isConnected;

// Function to handle connection with retry logic
const connectWithRetry = async (
  client: MongoClient,
  isDevMode = false
): Promise<MongoClient> => {
  const environment = isDevMode ? "dev" : "prod";
  try {
    const connectedClient = await client.connect();
    isConnected = true;
    console.log(`Connected to MongoDB (${environment})`);
    return connectedClient;
  } catch (err) {
    console.error(`Failed to connect to MongoDB (${environment}):`, err);

    // If in production, retry once after a short delay
    if (!isDevMode) {
      console.log("Retrying connection in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const connectedClient = await client.connect();
        isConnected = true;
        console.log(`Connected to MongoDB (${environment}) after retry`);
        return connectedClient;
      } catch (retryErr) {
        console.error(
          `Failed to connect to MongoDB (${environment}) after retry:`,
          retryErr
        );
        isConnected = false;
        throw retryErr;
      }
    }

    isConnected = false;
    throw err;
  }
};

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = connectWithRetry(client, true);
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);

  // Create a promise with retry logic for production
  clientPromise = connectWithRetry(client, false);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
