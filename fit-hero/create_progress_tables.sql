-- Create the progress tracking tables manually

-- Drop existing enum if exists
DROP TYPE IF EXISTS "public"."meal_type" CASCADE;

-- Create WorkoutSession table
CREATE TABLE IF NOT EXISTS "workout_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "workout_type" TEXT,
    "duration" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workout_sessions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint for workout sessions
CREATE UNIQUE INDEX IF NOT EXISTS "workout_sessions_player_id_date_key" ON "workout_sessions"("player_id", "date");

-- Create MealPlanEntry table
CREATE TABLE IF NOT EXISTS "meal_plan_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "meal_type" TEXT,
    "calories" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_plan_entries_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create WeightEntry table
CREATE TABLE IF NOT EXISTS "weight_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weight_entries_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create ProgressStats table
CREATE TABLE IF NOT EXISTS "progress_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL UNIQUE,
    "current_workout_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_workout_streak" INTEGER NOT NULL DEFAULT 0,
    "total_workout_days" INTEGER NOT NULL DEFAULT 0,
    "current_meal_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_meal_streak" INTEGER NOT NULL DEFAULT 0,
    "total_meal_plan_days" INTEGER NOT NULL DEFAULT 0,
    "starting_weight" DOUBLE PRECISION,
    "current_weight" DOUBLE PRECISION,
    "goal_weight" DOUBLE PRECISION,
    "last_workout_date" TIMESTAMP(3),
    "last_meal_plan_date" TIMESTAMP(3),
    "last_weight_update" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progress_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint for progress stats
CREATE UNIQUE INDEX IF NOT EXISTS "progress_stats_player_id_key" ON "progress_stats"("player_id");
