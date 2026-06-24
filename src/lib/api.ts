/**
 * FitAI Coach - API client with automatic Mock Data Fallback
 * Target backend: http://127.0.0.1:8000
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper to get auth header
function getAuthHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Check if backend is available (simple ping or quick check)
let isOfflineMode = false;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token: string | null = null,
  fallbackData: T
): Promise<{ data: T; isMock: boolean }> {
  if (isOfflineMode) {
    return { data: fallbackData, isMock: true };
  }

  try {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { data: data as T, isMock: false };
  } catch (error) {
    console.warn(`[FitAI API] Connection to ${API_BASE}${endpoint} failed. Using Local Simulation Mode.`, error);
    // Gracefully toggle to simulated offline mode for subsequent requests
    // (can be reset on page reloads or status check)
    return { data: fallbackData, isMock: true };
  }
}

// Types for responses
export interface AuthResponse {
  token: string;
  user: {
    email: string;
    onboarded: boolean;
  };
}

export interface MacroStats {
  current: number;
  goal: number;
}

export interface DashboardSummary {
  calories: {
    consumed: number;
    goal: number;
    burned: number;
  };
  macros: {
    protein: MacroStats;
    carbs: MacroStats;
    fats: MacroStats;
  };
  workout: {
    completed: boolean;
    name: string;
    description: string;
    setsCompleted: number;
    totalSets: number;
  } | null;
  hydration: {
    currentMl: number;
    goalMl: number;
  };
  aiTip: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: { reps: number; weightKg: number; completed: boolean }[];
  restSeconds: number;
}

export interface WorkoutPlan {
  splitName: string;
  dayName: string;
  exercises: Exercise[];
}

export interface FoodLogEntry {
  id: string;
  timestamp: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence: number; // percentage (e.g. 94)
  sourceType: "photo" | "text";
}

export interface BodyScanResult {
  timestamp: string;
  bodyFatPercent: number;
  muscleMassKg: number;
  weightKg: number;
  confidenceScore: number;
}

export interface WeeklyCheckinSummary {
  score: number; // 0-100 check-in score
  coachSummary: string;
  scoreHistory: { week: string; score: number }[];
  predictionText: string;
  predictedBodyFat: number;
  predictedWeightKg: number;
}

// API functions
export const api = {
  // Auth
  async login(email: string): Promise<{ data: AuthResponse; isMock: boolean }> {
    return request<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password: "password" }), // simple mock
      },
      null,
      {
        token: "simulated_jwt_token",
        user: { email, onboarded: false },
      }
    );
  },

  async register(email: string): Promise<{ data: AuthResponse; isMock: boolean }> {
    return request<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password: "password" }),
      },
      null,
      {
        token: "simulated_jwt_token",
        user: { email, onboarded: false },
      }
    );
  },

  // Dashboard
  async getDashboardSummary(
    token: string,
    goal: string = "Build Muscle",
    dietStrictness: string = "Normal Cut",
    weightKg: number = 80
  ): Promise<{ data: DashboardSummary; isMock: boolean }> {
    const isFatLoss = goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("fat");
    
    // Base maintenance calorie calculation: ~33 kcal per kg of bodyweight
    const maintenanceCalories = Math.round(weightKg * 33);
    
    // Recalculate calorie goal based on goal and strictness pacing
    let calorieGoal = maintenanceCalories;
    if (isFatLoss) {
      if (dietStrictness === "Strict Diet") {
        calorieGoal = maintenanceCalories - 600; // Aggressive cut
      } else if (dietStrictness === "Low Level Cut/Gain") {
        calorieGoal = maintenanceCalories - 200; // Slow cut/recomposition
      } else {
        calorieGoal = maintenanceCalories - 400; // Normal Cut
      }
    } else { // muscle building / lean bulk / endurance
      if (dietStrictness === "Strict Diet") {
        calorieGoal = maintenanceCalories + 150; // Clean bulk
      } else if (dietStrictness === "Low Level Cut/Gain") {
        calorieGoal = maintenanceCalories + 50; // Micro surplus
      } else {
        calorieGoal = maintenanceCalories + 300; // Normal surplus (Standard Bulk)
      }
    }

    // Protein goal based on body weight in KG: ranging from 1.0x to 1.5x of bodyweight
    let proteinMultiplier = 1.2;
    if (isFatLoss) {
      if (dietStrictness === "Strict Diet") proteinMultiplier = 1.5;
      else if (dietStrictness === "Low Level Cut/Gain") proteinMultiplier = 1.3;
      else proteinMultiplier = 1.4;
    } else {
      if (dietStrictness === "Strict Diet") proteinMultiplier = 1.3;
      else if (dietStrictness === "Low Level Cut/Gain") proteinMultiplier = 1.1;
      else proteinMultiplier = 1.2;
    }
    
    const proteinGoal = Math.round(weightKg * proteinMultiplier);
    
    // Fat goal: healthy structural limit of ~0.8g per kg of body weight
    const fatsGoal = Math.round(weightKg * 0.8);
    
    // Carbs fills the remainder to reach the calorie target (1g carbs = 4 kcal)
    const carbsGoal = Math.round((calorieGoal - (proteinGoal * 4) - (fatsGoal * 9)) / 4);

    const mockData: DashboardSummary = {
      calories: {
        consumed: 1820,
        goal: calorieGoal,
        burned: 420,
      },
      macros: {
        protein: { current: 140, goal: proteinGoal },
        carbs: { current: 165, goal: carbsGoal },
        fats: { current: 65, goal: fatsGoal },
      },
      workout: {
        completed: false,
        name: isFatLoss ? "High Intensity Pull" : "Hypertrophy Push A",
        description: isFatLoss ? "Heavy compound lifts and high volume sets" : "Chest, shoulders, and triceps focus",
        setsCompleted: 4,
        totalSets: 16,
      },
      hydration: {
        currentMl: 1500,
        goalMl: 3000,
      },
      aiTip: isFatLoss 
        ? `Adhering to your ${dietStrictness.toLowerCase()} protocol. Calorie goal is set to ${calorieGoal} kcal based on your ${weightKg}kg body weight. Hitting ${proteinGoal}g protein (${proteinMultiplier}x bodyweight in kg) ensures lean muscle mass retention.`
        : `Your ${dietStrictness.toLowerCase()} protocol sets a surplus target of ${calorieGoal} kcal based on your ${weightKg}kg body weight. Fueling with ${carbsGoal}g carbs supports high workout intensity.`,
    };

    return request<DashboardSummary>("/dashboard/summary", { method: "GET" }, token, mockData);
  },

  // Food Log
  async logFood(
    token: string,
    payload: { text?: string; imageBase64?: string }
  ): Promise<{ data: FoodLogEntry; isMock: boolean }> {
    const name = payload.text || "Logged Meal";
    const protein = payload.text ? Math.floor(Math.random() * 25) + 15 : 32;
    const carbs = payload.text ? Math.floor(Math.random() * 40) + 10 : 45;
    const fats = payload.text ? Math.floor(Math.random() * 15) + 5 : 12;
    const calories = protein * 4 + carbs * 4 + fats * 9;
    const confidence = payload.imageBase64 ? 94 : 98;

    const mockData: FoodLogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      name: payload.imageBase64 ? "Grilled Chicken Salad with Avocado" : name,
      calories,
      protein,
      carbs,
      fats,
      confidence,
      sourceType: payload.imageBase64 ? "photo" : "text",
    };

    return request<FoodLogEntry>(
      "/nutrition/log-food",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
      mockData
    );
  },

  // Workout Planner
  async getWorkoutPlan(
    token: string,
    goal: string = "Build Muscle",
    trainingDays: number = 5
  ): Promise<{ data: WorkoutPlan; isMock: boolean }> {
    const isFatLoss = goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("fat");

    // Dynamic splits name depending on days and goals
    let splitName = `${trainingDays}-Day Split`;
    let dayName = "Push Day Focus";
    let exercises = [
      {
        id: "ex1",
        name: "Barbell Bench Press",
        sets: [
          { reps: 8, weightKg: 85, completed: false },
          { reps: 8, weightKg: 85, completed: false },
          { reps: 8, weightKg: 85, completed: false },
          { reps: 6, weightKg: 90, completed: false },
        ],
        restSeconds: 120,
      },
      {
        id: "ex2",
        name: "Overhead Barbell Press",
        sets: [
          { reps: 10, weightKg: 52, completed: false },
          { reps: 8, weightKg: 55, completed: false },
          { reps: 8, weightKg: 55, completed: false },
        ],
        restSeconds: 90,
      },
      {
        id: "ex3",
        name: "Incline Dumbbell Fly",
        sets: [
          { reps: 12, weightKg: 20, completed: false },
          { reps: 12, weightKg: 20, completed: false },
          { reps: 10, weightKg: 22, completed: false },
        ],
        restSeconds: 75,
      },
      {
        id: "ex4",
        name: "Tricep Overhead Extension",
        sets: [
          { reps: 12, weightKg: 30, completed: false },
          { reps: 12, weightKg: 30, completed: false },
          { reps: 12, weightKg: 30, completed: false },
        ],
        restSeconds: 60,
      },
    ];

    if (trainingDays === 3) {
      splitName = isFatLoss ? "3-Day Full Body Deficit Split" : "3-Day Full Body Hypertrophy";
      dayName = "Full Body Workout A";
      exercises = [
        {
          id: "ex1",
          name: "Barbell Squat",
          sets: [
            { reps: 5, weightKg: 100, completed: false },
            { reps: 5, weightKg: 100, completed: false },
            { reps: 5, weightKg: 100, completed: false },
          ],
          restSeconds: 150,
        },
        {
          id: "ex2",
          name: "Barbell Bench Press",
          sets: [
            { reps: 5, weightKg: 85, completed: false },
            { reps: 5, weightKg: 85, completed: false },
            { reps: 5, weightKg: 85, completed: false },
          ],
          restSeconds: 120,
        },
        {
          id: "ex3",
          name: "Barbell Row",
          sets: [
            { reps: 8, weightKg: 65, completed: false },
            { reps: 8, weightKg: 65, completed: false },
            { reps: 8, weightKg: 65, completed: false },
          ],
          restSeconds: 90,
        },
      ];
    } else if (trainingDays === 4) {
      splitName = isFatLoss ? "4-Day Upper/Lower Strength" : "4-Day Upper/Lower Hypertrophy";
      dayName = "Upper Body A";
    } else if (trainingDays === 6) {
      splitName = isFatLoss ? "6-Day Push/Pull/Legs Deficit Split" : "6-Day Push/Pull/Legs Volume Split";
      dayName = "Push Day A";
    } else { // 5 days
      splitName = isFatLoss ? "5-Day Upper/Lower/PPL Hybrid" : "5-Day Push/Pull/Legs Hypertrophy";
      dayName = "Push Day Focus";
    }

    const mockData: WorkoutPlan = {
      splitName,
      dayName,
      exercises,
    };

    return request<WorkoutPlan>("/workout/plan", { method: "GET" }, token, mockData);
  },

  // Body Scan
  async uploadBodyScan(
    token: string,
    imageBase64: string
  ): Promise<{ data: BodyScanResult; isMock: boolean }> {
    const mockData: BodyScanResult = {
      timestamp: new Date().toISOString(),
      bodyFatPercent: 14.8,
      muscleMassKg: 70.1,
      weightKg: 82.5,
      confidenceScore: 92.5,
    };

    return request<BodyScanResult>(
      "/body-scan/upload",
      {
        method: "POST",
        body: JSON.stringify({ image: imageBase64 }),
      },
      token,
      mockData
    );
  },

  // Weekly Checkin
  async getWeeklyCheckin(
    token: string,
    goal: string = "Build Muscle"
  ): Promise<{ data: WeeklyCheckinSummary; isMock: boolean }> {
    const isFatLoss = goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("fat");

    const mockData: WeeklyCheckinSummary = {
      score: 88,
      coachSummary: isFatLoss
        ? "Excellent compliance this week. Adherence to your caloric deficit was 95%, and average daily steps hit 11,200. Body fat decreased by an estimated 0.4% while maintaining strength on major compounds. Keep training intensity high; we will hold macros steady for another week."
        : "Great job pushing intensity on your heavy squats. Caloric surplus was hit on 6 out of 7 days. Weight is trending up at a controlled rate (+0.2 kg/week), signaling lean tissue accumulation. Ensure you get 8 hours of sleep to support recovery.",
      scoreHistory: [
        { week: "Week 1", score: 72 },
        { week: "Week 2", score: 78 },
        { week: "Week 3", score: 81 },
        { week: "Week 4", score: 80 },
        { week: "Week 5", score: 85 },
        { week: "Week 6", score: 88 },
      ],
      predictionText: isFatLoss 
        ? "At this rate, you are projected to reach your goal body fat of 12% in approximately 5 weeks."
        : "At this rate, you will pack on an estimated 0.8 kg of skeletal muscle mass over the next 4 weeks.",
      predictedBodyFat: isFatLoss ? 12.0 : 14.5,
      predictedWeightKg: isFatLoss ? 79.2 : 83.2,
    };

    return request<WeeklyCheckinSummary>(
      "/coaching/weekly-checkin",
      { method: "GET" },
      token,
      mockData
    );
  },
};
