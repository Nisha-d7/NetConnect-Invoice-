# MongoDB Setup Guide

## Option 1: Local MongoDB Installation (Recommended for Development)

### macOS (using Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/mongodb-community

# Verify it's running
brew services list | grep mongodb
```

### Alternative: Manual Start

```bash
# Start MongoDB manually (if not using brew services)
mongod --config /usr/local/etc/mongod.conf --fork
```

## Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update your `.env.local` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/isp-invoice-portal?retryWrites=true&w=majority
   ```

## Option 3: Docker MongoDB

```bash
# Run MongoDB in Docker
docker run --name mongodb -d -p 27017:27017 mongo:latest

# Stop MongoDB
docker stop mongodb

# Start MongoDB (after first run)
docker start mongodb
```

## Verify Connection

After setting up MongoDB, test the connection:

```bash
# Run the database initialization script
npm run init-db
```

If successful, you should see:

```
✅ Connected to MongoDB successfully
Test users created successfully

=== Test Login Credentials ===
CUSTOMER ACCOUNTS:
Email: customer1@gmail.com | Password: password123
...
```

## Troubleshooting

### Connection Refused Error

- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check if port 27017 is in use: `lsof -i :27017`
- Restart MongoDB: `brew services restart mongodb/mongodb-community`

### Authentication Issues

- Check your MongoDB URI format
- Ensure username/password are correct (for Atlas)
- Check network access (for Atlas)

### Permission Issues

- Make sure MongoDB data directory has proper permissions
- On macOS: `sudo chown -R $(whoami) /usr/local/var/mongodb`
