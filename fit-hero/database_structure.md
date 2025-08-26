FIT HERO DATABASE STRUCTURE

This database is designed for NextAuth.js authentication with custom player profiles.

=== AUTHENTICATION TABLES (NextAuth.js) ===

1. **users** - Core user authentication
   - id (cuid, primary key)
   - name (optional)
   - email (unique, required)
   - emailVerified (datetime, optional)
   - image (optional)
   - password (hashed, for email/password auth)
   - createdAt, updatedAt (timestamps)

2. **accounts** - OAuth provider accounts
   - Links users to external providers (Google, GitHub)
   - Stores provider tokens and account info

3. **sessions** - Active user sessions
   - JWT session management
   - Links to user via userId

4. **verification_tokens** - Email verification
   - For email verification flows

=== PLAYER SYSTEM ===

5. **players** - Custom player profiles (1:1 with users)
   - id (cuid, primary key)
   - userId (foreign key to users.id)
   - name (player's chosen name)
   - character (enum): FITNESS_WARRIOR, CARDIO_RUNNER, AGILITY_NINJA, VITALITY_GUARDIAN
   - objective (enum): BUILD_MUSCLE, IMPROVE_CARDIO, LOSE_WEIGHT, GENERAL_FITNESS
   - trainingEnvironment (enum): GYM_TRAINING, HOME_TRAINING
   - dietaryRestrictions (array of enums): VEGETARIAN, VEGAN, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, LOW_CARB, KETO, PALEO
   - forbiddenFoods (array of strings) - custom foods to avoid
   - level (integer, default 1)
   - experience (integer, default 0)
   - createdAt, updatedAt (timestamps)

=== CHARACTER TYPES ===

- **FITNESS_WARRIOR**: Strength and muscle building focus
- **CARDIO_RUNNER**: Cardiovascular endurance specialist  
- **AGILITY_NINJA**: Flexibility and functional movement
- **VITALITY_GUARDIAN**: Balanced wellness approach

=== API ENDPOINTS ===

Authentication:
- POST /api/auth/signup - Create new user account
- NextAuth.js handles: /api/auth/[...nextauth] (login, OAuth)

Player Management:
- POST /api/player - Create player profile
- GET /api/player - Get current user's player profile

=== SETUP INSTRUCTIONS ===

1. Install dependencies (already done):
   - next-auth @auth/prisma-adapter
   - prisma @prisma/client
   - bcryptjs @types/bcryptjs

2. Configure environment variables in .env.local:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (for Google OAuth)
   - GITHUB_ID, GITHUB_SECRET (for GitHub OAuth)

3. Database connection in .env:
   - DATABASE_URL (already configured for your PostgreSQL)

4. Run database commands:
   - npx prisma generate (generate client)
   - npx prisma db push (create tables)

=== NEXT STEPS ===

This foundational structure supports:
- Multi-provider authentication (email/password, Google, GitHub)
- Custom player profiles with character types
- Dietary preferences and restrictions
- Training environment preferences
- Experience/leveling system foundation

Ready for extension with:
- Workout tracking
- Achievement systems
- Progress monitoring
- Social features
- Nutrition planning
