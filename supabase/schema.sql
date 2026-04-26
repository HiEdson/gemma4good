-- Supabase Schema Setup

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  age INT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  weight NUMERIC,
  goals TEXT CHECK (goals IN ('lose_weight', 'maintain', 'build_muscle')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT
);

CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id),
  food_name TEXT NOT NULL,
  portion TEXT,
  calories NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fats NUMERIC DEFAULT 0,
  micronutrients JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE daily_totals (
  user_id UUID REFERENCES users(id),
  date DATE,
  nutrients JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
