"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  api, 
  DashboardSummary, 
  WorkoutPlan, 
  WeeklyCheckinSummary, 
  FoodLogEntry, 
  BodyScanResult 
} from "./api";

interface UserProfile {
  email: string;
  onboarded: boolean;
  age?: number;
  weight?: number;
  height?: number;
  dietPreference?: string;
  goal?: string;
  trainingDays?: number;
  dietStrictness?: string;
}

interface StoreContextType {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  dashboardData: DashboardSummary | null;
  workoutPlan: WorkoutPlan | null;
  weeklyCheckin: WeeklyCheckinSummary | null;
  foodLog: FoodLogEntry[];
  scans: BodyScanResult[];
  activeWorkout: boolean;
  hydrationMl: number;
  isMockMode: boolean;
  
  // Actions
  login: (email: string) => Promise<boolean>;
  register: (email: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: (
    metrics: { age: number; weight: number; height: number },
    diet: string,
    goal: string,
    trainingDays: number,
    dietStrictness: string
  ) => void;
  logMealText: (text: string) => Promise<void>;
  logMealPhoto: (base64: string) => Promise<void>;
  logWater: (ml: number) => void;
  uploadScan: (base64: string) => Promise<void>;
  startWorkout: () => void;
  toggleExerciseSet: (exerciseId: string, setIndex: number) => void;
  updateGoal: (goal: string) => void;
  updateTrainingDays: (days: number) => void;
  updateDietStrictness: (strictness: string) => void;
  refreshDashboard: () => Promise<void>;
  resetDay: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [weeklyCheckin, setWeeklyCheckin] = useState<WeeklyCheckinSummary | null>(null);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [scans, setScans] = useState<BodyScanResult[]>([]);
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [hydrationMl, setHydrationMl] = useState(1500);
  const [isMockMode, setIsMockMode] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("fitai_token");
    const savedUser = localStorage.getItem("fitai_user");
    const savedFoodLog = localStorage.getItem("fitai_foodlog");
    const savedScans = localStorage.getItem("fitai_scans");
    const savedHydration = localStorage.getItem("fitai_hydration");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFoodLog) setFoodLog(JSON.parse(savedFoodLog));
    if (savedScans) setScans(JSON.parse(savedScans));
    if (savedHydration) setHydrationMl(Number(savedHydration));

    setLoading(false);
  }, []);

  // Sync state helpers
  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) localStorage.setItem("fitai_user", JSON.stringify(u));
    else localStorage.removeItem("fitai_user");
  };

  const saveToken = (t: string | null) => {
    setToken(t);
    if (t) localStorage.setItem("fitai_token", t);
    else localStorage.removeItem("fitai_token");
  };

  const saveFoodLog = (log: FoodLogEntry[]) => {
    setFoodLog(log);
    localStorage.setItem("fitai_foodlog", JSON.stringify(log));
  };

  const saveScans = (s: BodyScanResult[]) => {
    setScans(s);
    localStorage.setItem("fitai_scans", JSON.stringify(s));
  };

  const saveHydration = (ml: number) => {
    setHydrationMl(ml);
    localStorage.setItem("fitai_hydration", ml.toString());
  };

  // Fetch all user information once logged in / onboarded
  const fetchAllData = async (jwtToken: string, currentGoal: string, days: number = 5, strictness: string = "Normal Cut") => {
    try {
      const [dashRes, planRes, checkinRes] = await Promise.all([
        api.getDashboardSummary(jwtToken, currentGoal, strictness, user?.weight || 80),
        api.getWorkoutPlan(jwtToken, currentGoal, days),
        api.getWeeklyCheckin(jwtToken, currentGoal),
      ]);

      setIsMockMode(dashRes.isMock);
      setDashboardData({
        ...dashRes.data,
        hydration: { ...dashRes.data.hydration, currentMl: hydrationMl },
      });
      setWorkoutPlan(planRes.data);
      setWeeklyCheckin(checkinRes.data);
    } catch (e) {
      console.error("Error fetching coach data:", e);
    }
  };

  // Trigger data fetch when token or user goals change
  useEffect(() => {
    if (token && user?.onboarded) {
      fetchAllData(
        token,
        user.goal || "Build Muscle",
        user.trainingDays || 5,
        user.dietStrictness || "Normal Cut"
      );
    }
  }, [token, user?.onboarded, user?.goal, user?.trainingDays, user?.dietStrictness]);

  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await api.login(email);
      saveToken(res.data.token);
      
      // Look for locally existing onboarded user first
      const savedUser = localStorage.getItem("fitai_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === email) {
          saveUser(parsed);
          return true;
        }
      }
      
      saveUser(res.data.user);
      return true;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  };

  const register = async (email: string): Promise<boolean> => {
    try {
      const res = await api.register(email);
      saveToken(res.data.token);
      saveUser(res.data.user);
      return true;
    } catch (e) {
      console.error("Register failed:", e);
      return false;
    }
  };

  const logout = () => {
    saveToken(null);
    saveUser(null);
    setDashboardData(null);
    setWorkoutPlan(null);
    setWeeklyCheckin(null);
    setActiveWorkout(false);
    // Clear localStorage values except logs
    localStorage.removeItem("fitai_token");
    localStorage.removeItem("fitai_user");
  };

  const completeOnboarding = async (
    metrics: { age: number; weight: number; height: number },
    diet: string,
    goal: string,
    trainingDays: number,
    dietStrictness: string
  ) => {
    if (!user) return;

    if (token) {
      let backendGoal = "body_recomposition";
      if (goal === "Build Muscle") backendGoal = "muscle_gain";
      else if (goal === "Lose Fat") backendGoal = "fat_loss";
      else if (goal === "Lean Bulk") backendGoal = "lean_muscle_gain";
      else if (goal === "Endurance") backendGoal = "weight_maintenance";

      let backendDiet = "balanced";
      if (diet === "Balanced") backendDiet = "vegetarian";
      else if (diet === "High Protein") backendDiet = "non_vegetarian";
      else if (diet === "Vegan") backendDiet = "vegan";
      else if (diet === "Keto") backendDiet = "eggitarian";

      try {
        await api.saveOnboarding(token, {
          age: metrics.age,
          gender: "male",
          height_cm: metrics.height,
          current_weight_kg: metrics.weight,
          target_weight_kg: metrics.weight,
          activity_level: "moderately_active",
          training_experience: "intermediate",
          dietary_preference: backendDiet,
        });
      } catch (err) {
        console.error("API Onboarding save failed:", err);
      }
    }

    const updated = {
      ...user,
      onboarded: true,
      ...metrics,
      dietPreference: diet,
      goal: goal,
      trainingDays,
      dietStrictness,
    };
    saveUser(updated);
  };

  const logMealText = async (text: string) => {
    if (!token) return;
    const res = await api.logFood(token, { text });
    const newLog = [res.data, ...foodLog];
    saveFoodLog(newLog);

    // Update calories in dashboard view
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        calories: {
          ...dashboardData.calories,
          consumed: dashboardData.calories.consumed + res.data.calories,
        },
        macros: {
          protein: {
            ...dashboardData.macros.protein,
            current: dashboardData.macros.protein.current + res.data.protein,
          },
          carbs: {
            ...dashboardData.macros.carbs,
            current: dashboardData.macros.carbs.current + res.data.carbs,
          },
          fats: {
            ...dashboardData.macros.fats,
            current: dashboardData.macros.fats.current + res.data.fats,
          },
        },
      });
    }
  };

  const logMealPhoto = async (base64: string) => {
    if (!token) return;
    const res = await api.logFood(token, { imageBase64: base64 });
    const newLog = [res.data, ...foodLog];
    saveFoodLog(newLog);

    // Update calories in dashboard
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        calories: {
          ...dashboardData.calories,
          consumed: dashboardData.calories.consumed + res.data.calories,
        },
        macros: {
          protein: {
            ...dashboardData.macros.protein,
            current: dashboardData.macros.protein.current + res.data.protein,
          },
          carbs: {
            ...dashboardData.macros.carbs,
            current: dashboardData.macros.carbs.current + res.data.carbs,
          },
          fats: {
            ...dashboardData.macros.fats,
            current: dashboardData.macros.fats.current + res.data.fats,
          },
        },
      });
    }
  };

  const logWater = (ml: number) => {
    const updatedMl = Math.max(0, hydrationMl + ml);
    saveHydration(updatedMl);
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        hydration: {
          ...dashboardData.hydration,
          currentMl: updatedMl,
        },
      });
    }
  };

  const uploadScan = async (base64: string) => {
    if (!token) return;
    const res = await api.uploadBodyScan(token, base64);
    const newScans = [res.data, ...scans];
    saveScans(newScans);
  };

  const startWorkout = () => {
    setActiveWorkout(true);
  };

  const toggleExerciseSet = (exerciseId: string, setIndex: number) => {
    if (!workoutPlan) return;
    
    const updatedExercises = workoutPlan.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map((set, idx) => {
          if (idx === setIndex) {
            return { ...set, completed: !set.completed };
          }
          return set;
        });
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    const newPlan = { ...workoutPlan, exercises: updatedExercises };
    setWorkoutPlan(newPlan);

    // Update dashboard completed sets ratio
    if (dashboardData && dashboardData.workout) {
      const completedSets = updatedExercises.reduce(
        (acc, curr) => acc + curr.sets.filter((s) => s.completed).length,
        0
      );
      const totalSets = updatedExercises.reduce((acc, curr) => acc + curr.sets.length, 0);
      setDashboardData({
        ...dashboardData,
        workout: {
          ...dashboardData.workout,
          setsCompleted: completedSets,
          totalSets: totalSets,
          completed: completedSets === totalSets,
        },
      });
    }
  };

  const updateGoal = (newGoal: string) => {
    if (!user) return;
    const updated = { ...user, goal: newGoal };
    saveUser(updated);
  };

  const updateTrainingDays = (days: number) => {
    if (!user) return;
    const updated = { ...user, trainingDays: days };
    saveUser(updated);
  };

  const updateDietStrictness = (strictness: string) => {
    if (!user) return;
    const updated = { ...user, dietStrictness: strictness };
    saveUser(updated);
  };

  const refreshDashboard = async () => {
    if (token && user?.onboarded) {
      await fetchAllData(
        token, 
        user.goal || "Build Muscle", 
        user.trainingDays || 5, 
        user.dietStrictness || "Normal Cut"
      );
    }
  };

  const resetDay = () => {
    saveHydration(0);
    saveFoodLog([]);
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        calories: {
          ...dashboardData.calories,
          consumed: 0,
        },
        macros: {
          protein: { ...dashboardData.macros.protein, current: 0 },
          carbs: { ...dashboardData.macros.carbs, current: 0 },
          fats: { ...dashboardData.macros.fats, current: 0 },
        },
        workout: dashboardData.workout ? {
          ...dashboardData.workout,
          completed: false,
          setsCompleted: 0,
        } : null,
      });
    }
  };

  return (
    <StoreContext.Provider
      value={{
        token,
        user,
        loading,
        dashboardData,
        workoutPlan,
        weeklyCheckin,
        foodLog,
        scans,
        activeWorkout,
        hydrationMl,
        isMockMode,
        login,
        register,
        logout,
        completeOnboarding,
        logMealText,
        logMealPhoto,
        logWater,
        uploadScan,
        startWorkout,
        toggleExerciseSet,
        updateGoal,
        updateTrainingDays,
        updateDietStrictness,
        refreshDashboard,
        resetDay,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
