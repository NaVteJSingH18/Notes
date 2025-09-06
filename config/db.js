const mongoose = require('mongoose');

// This function connects to the MongoDB database.
// It uses the MONGO_URI from the .env file.
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Exit the process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
