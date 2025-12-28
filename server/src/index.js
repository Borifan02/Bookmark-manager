const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const { createApp } = require('./app');

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dabasaborifan_db_user:Avjqz1lwZWukQnYH@cluster0.waerydc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = createApp();
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
