"use server";

import { MongoClient, WithId, Document } from "mongodb";

// Types
interface MongoDoc {
  _id?: any;
}

export interface UserSettings {
  user_id: string;
  display_name: string;
  avatar_url: string;
  preferred_difficulty: string;
  sound_enabled: boolean;
  piece_set: string;
  default_color: string;
  show_coordinates: boolean;
  enable_animations: boolean;
}

interface UserSettingsDoc extends UserSettings, MongoDoc {}

export interface GameHistory {
  id: string;
  user_id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  date: string;
  moves_count: number;
  time_taken: number;
  difficulty: string;
  fen: string;
}

interface GameHistoryDoc extends Omit<GameHistory, "id">, MongoDoc {}

// MongoDB connection
let client: MongoClient | null = null;

async function getClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }

  if (client) {
    return client;
  }

  client = await MongoClient.connect(process.env.MONGODB_URI);
  return client;
}

// Helper function to serialize MongoDB documents
function serializeDocument<T extends { _id?: any }>(
  doc: T | null
): (Omit<T, "_id"> & { id?: string }) | null {
  if (!doc) return null;

  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id?.toString(),
  };
}

// User Settings Operations
export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  const client = await getClient();
  const collection = client.db("chess").collection("user_settings");
  const doc = await collection.findOne<UserSettingsDoc>({ user_id: userId });
  return serializeDocument(doc);
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<boolean> {
  const client = await getClient();
  const collection = client.db("chess").collection("user_settings");

  const result = await collection.updateOne(
    { user_id: userId },
    { $set: { ...settings, user_id: userId } },
    { upsert: true }
  );

  return result.acknowledged;
}

// Game History Operations
export async function saveGameResult(
  gameData: Omit<GameHistory, "id">
): Promise<GameHistory | null> {
  const client = await getClient();
  const collection = client.db("chess").collection("game_history");

  const result = await collection.insertOne(gameData);
  if (result.acknowledged) {
    return {
      ...gameData,
      id: result.insertedId.toString(),
    } as GameHistory;
  }
  return null;
}

export async function getUserGameHistory(
  userId: string
): Promise<GameHistory[]> {
  const client = await getClient();
  const collection = client.db("chess").collection("game_history");

  const games = await collection
    .find<GameHistoryDoc>({ user_id: userId })
    .sort({ date: -1 })
    .toArray();

  return games.map((game) => serializeDocument(game)) as GameHistory[];
}

export async function clearUserGameHistory(userId: string): Promise<boolean> {
  const client = await getClient();
  const collection = client.db("chess").collection("game_history");

  const result = await collection.deleteMany({ user_id: userId });
  return result.acknowledged;
}
