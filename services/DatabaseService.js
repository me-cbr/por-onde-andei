import * as SQLite from "expo-sqlite"

class DatabaseService {
  constructor() {
    this.db = null
  }

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync("porondeandei.db")
      await this.createTables()
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Error initializing database:", error)
      throw error
    }
  }

  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        image TEXT,
        biometric_enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `

    const createPlacesTable = `
      CREATE TABLE IF NOT EXISTS places (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        photo TEXT NOT NULL,
        address TEXT,
        latitude REAL,
        longitude REAL,
        date TEXT NOT NULL,
        photo_date TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `

    const createSessionTable = `
      CREATE TABLE IF NOT EXISTS user_session (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        is_logged_in INTEGER DEFAULT 1,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `

    try {
      await this.db.execAsync(createUsersTable)
      await this.db.execAsync(createPlacesTable)
      await this.db.execAsync(createSessionTable)

      await this.migrateDatabase()

      console.log("Tables created and migrated successfully")
    } catch (error) {
      console.error("Error creating tables:", error)
      throw error
    }
  }

  async migrateDatabase() {
    try {
      console.log("Starting database migration...")

      await this.migrateUsersTable()

      await this.migratePlacesTable()

      console.log("Database migration completed successfully")
    } catch (error) {
      console.error("Error during database migration:", error)
      console.log("Attempting to recreate tables...")
      await this.recreateTables()
    }
  }

  async migrateUsersTable() {
    try {
      const usersTableInfo = await this.db.getAllAsync("PRAGMA table_info(users)")
      console.log("Users table structure:", usersTableInfo)

      const hasBiometricColumn = usersTableInfo.some((column) => column.name === "biometric_enabled")
      const hasImageColumn = usersTableInfo.some((column) => column.name === "image")
      const hasCreatedAtColumn = usersTableInfo.some((column) => column.name === "created_at")

      if (!hasBiometricColumn) {
        console.log("Adding missing biometric_enabled column to users table...")
        await this.db.execAsync("ALTER TABLE users ADD COLUMN biometric_enabled INTEGER DEFAULT 0")
        console.log("Biometric_enabled column added successfully")
      }

      if (!hasImageColumn) {
        console.log("Adding missing image column to users table...")
        await this.db.execAsync("ALTER TABLE users ADD COLUMN image TEXT")
        console.log("Image column added successfully")
      }

      if (!hasCreatedAtColumn) {
        console.log("Adding missing created_at column to users table...")
        await this.db.execAsync("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
        console.log("Created_at column added successfully")
      }

      console.log("Users table migration completed")
    } catch (error) {
      console.error("Error migrating users table:", error)
      throw error
    }
  }

  async migratePlacesTable() {
    try {
      const placesTableInfo = await this.db.getAllAsync("PRAGMA table_info(places)")
      console.log("Places table structure:", placesTableInfo)

      const hasAddressColumn = placesTableInfo.some((column) => column.name === "address")
      const hasPhotoDateColumn = placesTableInfo.some((column) => column.name === "photo_date")
      const hasIsFavoriteColumn = placesTableInfo.some((column) => column.name === "is_favorite")
      const hasLatitudeColumn = placesTableInfo.some((column) => column.name === "latitude")
      const hasLongitudeColumn = placesTableInfo.some((column) => column.name === "longitude")
      const hasCreatedAtColumn = placesTableInfo.some((column) => column.name === "created_at")

      if (!hasAddressColumn) {
        console.log("Adding missing address column to places table...")
        await this.db.execAsync("ALTER TABLE places ADD COLUMN address TEXT")
        console.log("Address column added successfully")
      }

      if (!hasPhotoDateColumn) {
        console.log("Adding missing photo_date column to places table...")
        await this.db.execAsync("ALTER TABLE places ADD COLUMN photo_date TEXT NOT NULL DEFAULT ''")
        console.log("Photo_date column added successfully")
      }

      if (!hasIsFavoriteColumn) {
        console.log("Adding missing is_favorite column to places table...")
        await this.db.execAsync("ALTER TABLE places ADD COLUMN is_favorite INTEGER DEFAULT 0")
        console.log("Is_favorite column added successfully")
      }

      if (!hasLatitudeColumn) {
        console.log("Adding missing latitude column to places table...")
        await this.db.execAsync("ALTER TABLE places ADD COLUMN latitude REAL")
        console.log("Latitude column added successfully")
      }

      if (!hasLongitudeColumn) {
        console.log("Adding missing longitude column to places table...")
        await this.db.execAsync("ALTER TABLE places ADD COLUMN longitude REAL")
        console.log("Longitude column added successfully")
      }

      if (!hasCreatedAtColumn) {
        console.log("Adding missing created_at column to places table...")
        await this.db.execAsync("ALTER TABLE places ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
        console.log("Created_at column added successfully")
      }

      console.log("Places table migration completed")
    } catch (error) {
      console.error("Error migrating places table:", error)
      throw error
    }
  }

  async recreateTables() {
    try {
      console.log("Recreating tables with correct structure...")

      const existingUsers = await this.db.getAllAsync("SELECT * FROM users").catch(() => [])
      const existingPlaces = await this.db
        .getAllAsync("SELECT id, title, photo, date, user_id FROM places")
        .catch(() => [])
      const existingSessions = await this.db.getAllAsync("SELECT * FROM user_session").catch(() => [])

      console.log("Backup completed:", {
        users: existingUsers.length,
        places: existingPlaces.length,
        sessions: existingSessions.length,
      })

      await this.db.execAsync("DROP TABLE IF EXISTS places")
      await this.db.execAsync("DROP TABLE IF EXISTS user_session")
      await this.db.execAsync("DROP TABLE IF EXISTS users")

      const createUsersTable = `
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          image TEXT,
          biometric_enabled INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `

      const createPlacesTable = `
        CREATE TABLE places (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          photo TEXT NOT NULL,
          address TEXT,
          latitude REAL,
          longitude REAL,
          date TEXT NOT NULL,
          photo_date TEXT NOT NULL DEFAULT '',
          is_favorite INTEGER DEFAULT 0,
          user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );
      `

      const createSessionTable = `
        CREATE TABLE user_session (
          id INTEGER PRIMARY KEY,
          user_id INTEGER NOT NULL,
          is_logged_in INTEGER DEFAULT 1,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );
      `

      await this.db.execAsync(createUsersTable)
      await this.db.execAsync(createPlacesTable)
      await this.db.execAsync(createSessionTable)

      for (const user of existingUsers) {
        await this.db.runAsync(
          "INSERT INTO users (id, email, name, password, image, biometric_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            user.id,
            user.email,
            user.name,
            user.password,
            user.image || null,
            user.biometric_enabled || 0,
            user.created_at || new Date().toISOString(),
          ],
        )
      }

      for (const place of existingPlaces) {
        await this.db.runAsync(
          "INSERT INTO places (id, title, photo, address, latitude, longitude, date, photo_date, is_favorite, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            place.id,
            place.title,
            place.photo,
            "Endereço não disponível",
            null,
            null,
            place.date,
            place.date,
            0,
            place.user_id,
            place.created_at || new Date().toISOString(),
          ],
        )
      }

      for (const session of existingSessions) {
        await this.db.runAsync("INSERT INTO user_session (id, user_id, is_logged_in, last_login) VALUES (?, ?, ?, ?)", [
          session.id,
          session.user_id,
          session.is_logged_in,
          session.last_login,
        ])
      }

      console.log("Tables recreated successfully with data preserved")
    } catch (error) {
      console.error("Error recreating tables:", error)
      throw error
    }
  }

  async createUser(email, name, password) {
    try {
      const result = await this.db.runAsync("INSERT INTO users (email, name, password) VALUES (?, ?, ?)", [
        email,
        name,
        password,
      ])
      console.log("User created with ID:", result.lastInsertRowId)
      return result.lastInsertRowId
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await this.db.getFirstAsync("SELECT * FROM users WHERE email = ?", [email])
      console.log("User found by email:", result ? "Yes" : "No")
      return result
    } catch (error) {
      console.error("Error getting user by email:", error)
      throw error
    }
  }

  async updateUserProfile(userId, name, image = null) {
    try {
      if (image) {
        await this.db.runAsync("UPDATE users SET name = ?, image = ? WHERE id = ?", [name, image, userId])
      } else {
        await this.db.runAsync("UPDATE users SET name = ? WHERE id = ?", [name, userId])
      }
      console.log("User profile updated for ID:", userId)
      return true
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  }

  async enableBiometric(userId) {
    try {
      await this.db.runAsync("UPDATE users SET biometric_enabled = 1 WHERE id = ?", [userId])
      console.log("Biometric enabled for user ID:", userId)
      return true
    } catch (error) {
      console.error("Error enabling biometric:", error)
      throw error
    }
  }

  async isBiometricEnabled(userId) {
    try {
      const result = await this.db.getFirstAsync("SELECT biometric_enabled FROM users WHERE id = ?", [userId])
      return result?.biometric_enabled === 1
    } catch (error) {
      console.error("Error checking biometric status:", error)
      return false
    }
  }

  async createSession(userId) {
    try {
      await this.db.runAsync("DELETE FROM user_session WHERE user_id = ?", [userId])
      await this.db.runAsync("INSERT INTO user_session (user_id) VALUES (?)", [userId])
      console.log("Session created for user ID:", userId)
      return true
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const result = await this.db.getFirstAsync(`
        SELECT u.* FROM users u 
        INNER JOIN user_session s ON u.id = s.user_id 
        WHERE s.is_logged_in = 1
        ORDER BY s.last_login DESC
        LIMIT 1
      `)
      console.log("Current user:", result ? `ID: ${result.id}, Email: ${result.email}` : "None")
      return result
    } catch (error) {
      console.error("Error getting current user:", error)
      throw error
    }
  }

  async logout() {
    try {
      await this.db.runAsync("DELETE FROM user_session")
      console.log("User logged out successfully")
      return true
    } catch (error) {
      console.error("Error logging out:", error)
      throw error
    }
  }

  async isUserLoggedIn() {
    try {
      const result = await this.db.getFirstAsync("SELECT COUNT(*) as count FROM user_session WHERE is_logged_in = 1")
      const isLoggedIn = result.count > 0
      console.log("User logged in:", isLoggedIn)
      return isLoggedIn
    } catch (error) {
      console.error("Error checking login status:", error)
      return false
    }
  }

  async createPlace(title, photo, address, latitude, longitude, photoDate, userId) {
    try {
      const id = Date.now().toString()
      const date = new Date().toISOString()

      console.log("Creating place with data:", {
        id,
        title,
        photo: photo ? "Has photo" : "No photo",
        address,
        latitude,
        longitude,
        photoDate,
        userId,
      })

      await this.db.runAsync(
        "INSERT INTO places (id, title, photo, address, latitude, longitude, date, photo_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, title, photo, address, latitude, longitude, date, photoDate, userId],
      )

      console.log("Place created successfully with ID:", id)
      return id
    } catch (error) {
      console.error("Error creating place:", error)
      throw error
    }
  }

  async updatePlace(placeId, title, address, userId) {
    try {
      await this.db.runAsync("UPDATE places SET title = ?, address = ? WHERE id = ? AND user_id = ?", [
        title,
        address,
        placeId,
        userId,
      ])
      console.log("Place updated:", placeId)
      return true
    } catch (error) {
      console.error("Error updating place:", error)
      throw error
    }
  }

  async toggleFavorite(placeId, userId) {
    try {
      const place = await this.db.getFirstAsync("SELECT is_favorite FROM places WHERE id = ? AND user_id = ?", [
        placeId,
        userId,
      ])
      const newFavoriteStatus = place.is_favorite === 1 ? 0 : 1

      await this.db.runAsync("UPDATE places SET is_favorite = ? WHERE id = ? AND user_id = ?", [
        newFavoriteStatus,
        placeId,
        userId,
      ])
      console.log("Place favorite toggled:", placeId, "New status:", newFavoriteStatus)
      return newFavoriteStatus === 1
    } catch (error) {
      console.error("Error toggling favorite:", error)
      throw error
    }
  }

  async getPlacesByUser(userId) {
    try {
      console.log("Getting places for user ID:", userId)

      const result = await this.db.getAllAsync("SELECT * FROM places WHERE user_id = ? ORDER BY created_at DESC", [
        userId,
      ])

      console.log("Raw places from database:", result.length, "places found")

      if (result.length > 0) {
        console.log("First place data:", result[0])
      }

      const places = result.map((place) => ({
        id: place.id,
        title: place.title,
        photo: place.photo,
        address: place.address,
        location:
          place.latitude && place.longitude
            ? {
                latitude: place.latitude,
                longitude: place.longitude,
              }
            : null,
        date: place.date,
        photoDate: place.photo_date,
        isFavorite: place.is_favorite === 1,
      }))

      console.log("Processed places:", places.length, "places")
      return places
    } catch (error) {
      console.error("Error getting places by user:", error)
      throw error
    }
  }

  async deletePlace(placeId, userId) {
    try {
      await this.db.runAsync("DELETE FROM places WHERE id = ? AND user_id = ?", [placeId, userId])
      console.log("Place deleted:", placeId)
      return true
    } catch (error) {
      console.error("Error deleting place:", error)
      throw error
    }
  }

  async getAllPlaces() {
    try {
      const result = await this.db.getAllAsync("SELECT * FROM places ORDER BY created_at DESC")
      console.log("All places count:", result.length)

      return result.map((place) => ({
        id: place.id,
        title: place.title,
        photo: place.photo,
        address: place.address,
        location:
          place.latitude && place.longitude
            ? {
                latitude: place.latitude,
                longitude: place.longitude,
              }
            : null,
        date: place.date,
        photoDate: place.photo_date,
        isFavorite: place.is_favorite === 1,
      }))
    } catch (error) {
      console.error("Error getting all places:", error)
      throw error
    }
  }

  async clearAllData() {
    try {
      await this.db.execAsync("DELETE FROM places")
      await this.db.execAsync("DELETE FROM user_session")
      await this.db.execAsync("DELETE FROM users")
      console.log("All data cleared successfully")
      return true
    } catch (error) {
      console.error("Error clearing all data:", error)
      throw error
    }
  }

  async debugDatabaseContents() {
    try {
      const users = await this.db.getAllAsync("SELECT id, email, name, biometric_enabled FROM users")
      const places = await this.db.getAllAsync("SELECT id, title, address, user_id FROM places")
      const sessions = await this.db.getAllAsync("SELECT user_id, is_logged_in FROM user_session")

      const usersStructure = await this.db.getAllAsync("PRAGMA table_info(users)")
      const placesStructure = await this.db.getAllAsync("PRAGMA table_info(places)")
      const sessionsStructure = await this.db.getAllAsync("PRAGMA table_info(user_session)")

      console.log("=== DATABASE DEBUG ===")
      console.log("Users:", users)
      console.log("Places:", places)
      console.log("Sessions:", sessions)
      console.log("Users table structure:", usersStructure)
      console.log("Places table structure:", placesStructure)
      console.log("Sessions table structure:", sessionsStructure)
      console.log("=== END DEBUG ===")

      return { users, places, sessions, usersStructure, placesStructure, sessionsStructure }
    } catch (error) {
      console.error("Error debugging database:", error)
      return null
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
