/**
 * FitAI Coach - API client with automatic Mock Data Fallback
 * Target backend: http://127.0.0.1:8000
 */

let API_BASE = "";
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const base = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${host}:8000`;
  API_BASE = base.replace(/\/$/, "") + "/api/v1";
} else {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  API_BASE = base.replace(/\/$/, "") + "/api/v1";
}


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
  if (isOfflineMode || token === "simulated_jwt_token") {
    return { data: fallbackData, isMock: true };
  }

  let response: Response;
  try {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
      ...(options.headers as Record<string, string> || {}),
    };

    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    console.warn(`[FitAI API] Connection to ${API_BASE}${endpoint} failed. Using Local Simulation Mode.`, networkError);
    return { data: fallbackData, isMock: true };
  }

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return { data: data as T, isMock: false };
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

export interface WorkoutDay {
  dayNumber: number;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  splitName: string;
  days: WorkoutDay[];
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
  image?: string;
}

export interface WeeklyCheckinSummary {
  score: number; // 0-100 check-in score
  coachSummary: string;
  scoreHistory: { week: string; score: number }[];
  predictionText: string;
  predictedBodyFat: number;
  predictedWeightKg: number;
}

interface BackendMacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

interface BackendConfidence {
  recognition: number;
  portion: number;
  nutrition: number;
}

interface BackendDashboardResponse {
  date: string;
  targets: BackendMacroTotals;
  consumed: BackendMacroTotals;
  remaining: BackendMacroTotals;
  confidence: BackendConfidence | null;
  compliance_score: number;
  common_foods: any[];
  calories_burned: number;
}

interface BackendFoodEntry {
  id: string;
  logged_on: string;
  source: string;
  meal_name: string;
  items: any[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  recognition_confidence: number;
  portion_confidence: number;
  nutrition_confidence: number;
  requires_confirmation: boolean;
}

interface BackendBodyScanResponse {
  id: string;
  body_fat_percent: number;
  confidence_score: number;
  lean_body_mass_kg: number;
  fat_mass_kg: number;
  physique_classification: string;
  analysis: any;
}

interface BackendWeeklyCheckin {
  recommendation: string;
  changes: any[];
  analysis: string[];
  next_review_days: number;
}

interface BackendWorkoutDay {
  day: number;
  name: string;
  exercises: { name: string; sets: number; reps: string; target_weight_kg?: number }[];
}

interface BackendWorkoutPlanResponse {
  split: string;
  goal: string;
  experience: string;
  equipment: string[];
  days: BackendWorkoutDay[];
  progression: string;
}

interface BackendAuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  full_name: string;
  email: string;
}

// API functions
export const api = {
  // Auth
  async login(email: string): Promise<{ data: AuthResponse; isMock: boolean }> {
    const mockFallback: AuthResponse = {
      token: "simulated_jwt_token",
      user: { email, onboarded: false },
    };

    const res = await request<BackendAuthResponse | AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password: "password" }),
      },
      null,
      mockFallback
    );

    if (res.isMock) {
      return { data: res.data as AuthResponse, isMock: true };
    }

    const b = res.data as BackendAuthResponse;

    let onboarded = false;
    try {
      const meRes = await request<{ profile: any }>(
        "/auth/me",
        { method: "GET" },
        b.access_token,
        { profile: null }
      );
      if (!meRes.isMock && meRes.data.profile !== null) {
        onboarded = true;
      }
    } catch (err) {
      console.error("Error fetching /auth/me:", err);
    }

    const mapped: AuthResponse = {
      token: b.access_token,
      user: {
        email: b.email,
        onboarded: onboarded,
      },
    };
    return { data: mapped, isMock: false };
  },

  async register(email: string): Promise<{ data: AuthResponse; isMock: boolean }> {
    const defaultName = email.split("@")[0] || "User";
    const mockFallback: AuthResponse = {
      token: "simulated_jwt_token",
      user: { email, onboarded: false },
    };

    const res = await request<BackendAuthResponse | AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password: "password", full_name: defaultName }),
      },
      null,
      mockFallback
    );

    if (res.isMock) {
      return { data: res.data as AuthResponse, isMock: true };
    }

    const b = res.data as BackendAuthResponse;
    const mapped: AuthResponse = {
      token: b.access_token,
      user: {
        email: b.email,
        onboarded: false,
      },
    };
    return { data: mapped, isMock: false };
  },

  async saveOnboarding(
    token: string,
    data: {
      age: number;
      gender: string;
      height_cm: number;
      current_weight_kg: number;
      target_weight_kg: number;
      activity_level: string;
      training_experience: string;
      dietary_preference: string;
    }
  ): Promise<{ success: boolean; isMock: boolean }> {
    const res = await request<{ status: string }>(
      "/auth/onboarding",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
      { status: "saved" }
    );
    return { success: res.data.status === "saved", isMock: res.isMock };
  },

  // Dashboard
  async getDashboardSummary(
    token: string,
    goal: string = "Build Muscle",
    dietStrictness: string = "Normal Cut",
    weightKg: number = 80
  ): Promise<{ data: DashboardSummary; isMock: boolean }> {
    const isFatLoss = goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("fat");
    
    const maintenanceCalories = Math.round(weightKg * 33);
    
    let calorieGoal = maintenanceCalories;
    if (isFatLoss) {
      if (dietStrictness === "Strict Diet") {
        calorieGoal = maintenanceCalories - 600;
      } else if (dietStrictness === "Low Level Cut/Gain") {
        calorieGoal = maintenanceCalories - 200;
      } else {
        calorieGoal = maintenanceCalories - 400;
      }
    } else {
      if (dietStrictness === "Strict Diet") {
        calorieGoal = maintenanceCalories + 150;
      } else if (dietStrictness === "Low Level Cut/Gain") {
        calorieGoal = maintenanceCalories + 50;
      } else {
        calorieGoal = maintenanceCalories + 300;
      }
    }

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
    const fatsGoal = Math.round(weightKg * 0.8);
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

    const res = await request<BackendDashboardResponse | DashboardSummary>(
      "/dashboard/daily",
      { method: "GET" },
      token,
      mockData
    );

    if (res.isMock) {
      return { data: res.data as DashboardSummary, isMock: true };
    }

    const b = res.data as BackendDashboardResponse;
    const mappedData: DashboardSummary = {
      calories: {
        consumed: b.consumed.calories,
        goal: b.targets.calories,
        burned: b.calories_burned || 0,
      },
      macros: {
        protein: { current: b.consumed.protein_g, goal: b.targets.protein_g },
        carbs: { current: b.consumed.carbs_g, goal: b.targets.carbs_g },
        fats: { current: b.consumed.fat_g, goal: b.targets.fat_g },
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
      aiTip: `Adhering to your protocol. Your compliance score is ${b.compliance_score}%. Protein and caloric inputs are synced.`,
    };

    return { data: mappedData, isMock: false };
  },

  // Food Log
  async logFood(
    token: string,
    payload: { text?: string; imageBase64?: string }
  ): Promise<{ data: FoodLogEntry; isMock: boolean }> {
    const endpoint = payload.text ? "/food/text" : "/food/photo";
    const body = payload.text 
      ? { text: payload.text } 
      : { image_url: payload.imageBase64, caption_hint: "" };

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

    const res = await request<BackendFoodEntry | FoodLogEntry>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
      mockData
    );

    if (res.isMock) {
      return { data: res.data as FoodLogEntry, isMock: true };
    }

    const b = res.data as BackendFoodEntry;
    const confidencePercent = Math.round(
      ((b.recognition_confidence + b.portion_confidence + b.nutrition_confidence) / 3) * 100
    );

    const converted: FoodLogEntry = {
      id: b.id,
      timestamp: new Date(b.logged_on).toISOString(),
      name: b.meal_name,
      calories: b.calories,
      protein: b.protein_g,
      carbs: b.carbs_g,
      fats: b.fat_g,
      confidence: confidencePercent || 85,
      sourceType: b.source === "photo" ? "photo" : "text",
    };

    return { data: converted, isMock: false };
  },

  // Workout Planner
  async getWorkoutPlan(
    token: string,
    goal: string = "Build Muscle",
    trainingDays: number = 5
  ): Promise<{ data: WorkoutPlan; isMock: boolean }> {
    const isFatLoss = goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("fat");

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
    } else {
      splitName = isFatLoss ? "5-Day Upper/Lower/PPL Hybrid" : "5-Day Push/Pull/Legs Hypertrophy";
      dayName = "Push Day Focus";
    }

    const mockData: WorkoutPlan = {
      splitName,
      days: [
        {
          dayNumber: 1,
          name: isFatLoss ? "Push Day Focus A" : "Hypertrophy Push A",
          exercises: exercises,
        },
        {
          dayNumber: 2,
          name: isFatLoss ? "Pull Day Focus A" : "Hypertrophy Pull A",
          exercises: [
            {
              id: "mock_2_1",
              name: "Lat Pulldown",
              sets: [
                { reps: 10, weightKg: 55, completed: false },
                { reps: 10, weightKg: 55, completed: false },
                { reps: 8, weightKg: 60, completed: false },
              ],
              restSeconds: 90,
            },
            {
              id: "mock_2_2",
              name: "Bent-Over Barbell Row",
              sets: [
                { reps: 8, weightKg: 50, completed: false },
                { reps: 8, weightKg: 50, completed: false },
              ],
              restSeconds: 90,
            },
            {
              id: "mock_2_3",
              name: "Dumbbell Incline Curl",
              sets: [
                { reps: 12, weightKg: 10, completed: false },
                { reps: 10, weightKg: 12, completed: false },
              ],
              restSeconds: 60,
            }
          ]
        },
        {
          dayNumber: 3,
          name: "Legs & Abs Focus",
          exercises: [
            {
              id: "mock_3_1",
              name: "Barbell Squat",
              sets: [
                { reps: 8, weightKg: 80, completed: false },
                { reps: 8, weightKg: 80, completed: false },
                { reps: 6, weightKg: 90, completed: false },
              ],
              restSeconds: 120,
            },
            {
              id: "mock_3_2",
              name: "Romanian Deadlift",
              sets: [
                { reps: 10, weightKg: 70, completed: false },
                { reps: 10, weightKg: 70, completed: false },
              ],
              restSeconds: 90,
            }
          ]
        }
      ]
    };

    const res = await request<BackendWorkoutPlanResponse | WorkoutPlan>(
      "/planner/workout-plan",
      {
        method: "POST",
        body: JSON.stringify({ training_days_per_week: trainingDays, available_equipment: [] })
      },
      token,
      mockData
    );

    if (res.isMock) {
      return { data: res.data as WorkoutPlan, isMock: true };
    }

    const b = res.data as BackendWorkoutPlanResponse;
    const mappedDays = b.days.map((d) => {
      const mappedExercises = d.exercises.map((ex, idx) => {
        let repsNum = 10;
        if (ex.reps) {
          const parts = ex.reps.split("-");
          if (parts.length === 2) {
            repsNum = Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2);
          } else {
            const parsed = parseInt(ex.reps);
            if (!isNaN(parsed)) repsNum = parsed;
          }
        }
        return {
          id: `ex_${d.day}_${idx}`,
          name: ex.name,
          sets: Array.from({ length: ex.sets }).map(() => ({ 
            reps: repsNum, 
            weightKg: ex.target_weight_kg || 50, 
            completed: false 
          })),
          restSeconds: 90,
        };
      });
      return {
        dayNumber: d.day,
        name: d.name,
        exercises: mappedExercises,
      };
    });

    const mappedData: WorkoutPlan = {
      splitName: b.split.replace("_", " ").toUpperCase(),
      days: mappedDays,
    };

    return { data: mappedData, isMock: false };
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

    const body = {
      front_photo_url: imageBase64,
      side_photo_url: imageBase64,
      back_photo_url: null,
    };

    const res = await request<BackendBodyScanResponse | BodyScanResult>(
      "/body/scans",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
      mockData
    );

    if (res.isMock) {
      return { data: res.data as BodyScanResult, isMock: true };
    }

    const b = res.data as BackendBodyScanResponse;
    const converted: BodyScanResult = {
      timestamp: new Date().toISOString(),
      bodyFatPercent: b.body_fat_percent,
      muscleMassKg: b.lean_body_mass_kg,
      weightKg: Math.round((b.lean_body_mass_kg + b.fat_mass_kg) * 10) / 10,
      confidenceScore: Math.round(b.confidence_score * 100),
      image: imageBase64,
    };

    return { data: converted, isMock: false };
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

    const res = await request<BackendWeeklyCheckin | WeeklyCheckinSummary>(
      "/coach/weekly-check-in",
      { method: "GET" },
      token,
      mockData
    );

    if (res.isMock) {
      return { data: res.data as WeeklyCheckinSummary, isMock: true };
    }

    const b = res.data as BackendWeeklyCheckin;
    const converted: WeeklyCheckinSummary = {
      score: 85,
      coachSummary: b.analysis.join(" "),
      scoreHistory: [
        { week: "Week 1", score: 72 },
        { week: "Week 2", score: 78 },
        { week: "Week 3", score: 81 },
        { week: "Week 4", score: 80 },
        { week: "Week 5", score: 85 },
      ],
      predictionText: `Your recommended path is: ${b.recommendation.replace("_", " ")}.`,
      predictedBodyFat: isFatLoss ? 13.8 : 14.8,
      predictedWeightKg: isFatLoss ? 79.5 : 82.5,
    };

    return { data: converted, isMock: false };
  },

  async logActivity(
    token: string,
    payload: { activity_type: string; duration_minutes: number; intensity: string }
  ): Promise<{ data: { id: string; calories_burned: number }; isMock: boolean }> {
    const mockData = {
      id: Math.random().toString(36).substring(7),
      calories_burned: Math.round(
        payload.duration_minutes * 
        (payload.intensity === "high" ? 10 : payload.intensity === "moderate" ? 7 : 4.5)
      ),
    };

    return request<{ id: string; calories_burned: number }>(
      "/workouts/activity",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
      mockData
    );
  },
};
