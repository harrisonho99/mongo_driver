const { MongoClient, } = require("mongodb")
const http = require("http")
require("util").inspect.defaultOptions.depth = null



const MONGODB_URI = 'mongodb://HARRISON-HO-PC:27017,HARRISON-HO-PC:27018,HARRISON-HO-PC:27019?replicaSet=rs'



const MONGDB_REPLICASET_URI = "mongodb://localhost:27017,localhost:27018/?replicaSet=rs0"

const print = console.log

/**
 * 
 * @param {MongoClient} client 
 */
async function updateWithTransation(client) {
    const usersCollection = await client.db("transaction").collection("users")


    const session = client.startSession()
    try {

        session.startTransaction()
        await usersCollection.bulkWrite([
            { updateOne: { filter: { name: "hoang" }, update: { $inc: { coin: 10 }, }, upsert: true }, },
            { updateOne: { filter: { name: "random" }, update: { $inc: { coin: -10 }, }, upsert: true } },
        ], { session })
        await session.commitTransaction()

        print("commited transaction")
    } catch (error) {
        print(error)
        await session.abortTransaction()
    } finally {
        await session.endSession()
    }

}






/**
 * 
 * @param {MongoClient} client 
 * @param {http.ServerResponse} res
 */
async function watchUserColChange(client, res) {
    const userCol = client.db("transaction").collection("users")

    const pipeline = [
        { $match: { "fullDocument.name": "hoang" } },
        { $addFields: { newField: "some field" } }
    ]

    const changeStreamIterator = userCol.watch(pipeline)

    const next = await changeStreamIterator.next();

}







const client = new MongoClient(
    //MONGODB_URI
    MONGDB_REPLICASET_URI,

);



async function run() {
    try {
        await client.connect();
        console.log("after connect")
        await client.db("admin").command({ ping: 1 });
        console.log("Connected successfully to server");

        // await watchUserColChange(client)

        await updateWithTransation(client)


    } finally {
        await client.close();
    }
}

run().catch(console.dir);