import { MongoClient, Db } from 'mongodb';

export let mongodb: Db | null = null;

export async function connectToMongoDB() {
  const uri = "mongodb://root:root@ologami-mongodb:27017";
  try {
    const client = await MongoClient.connect(uri);
    console.log("Connesso con successo a ologami-mongodb");
    mongodb = client.db("logger");
  } catch (err) {
    console.error("Errore durante la connessione a ologami-mongodb", err);
  }
}
