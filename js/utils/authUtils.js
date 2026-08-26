// MIGRATED: This file previously used Firebase Firestore for user/chapter lookups.
// All data now comes from Next.js API routes: /api/auth/login, /api/chapters
// The active implementation is in lib/auth.ts and app/api/ (server-side)
import { pseudoUsers, pseudoChapters } from "../pseudoData.js";

// -------------------------------------------
// Session storage keys
// -------------------------------------------
const KEYS = {
  EMAIL: "userEmail",
  ROLE: "userRole",
  USER_ID: "userId",
  USER_NAME: "userName",
  CHAPTER_ID: "chapterId",
  CHAPTER_NAME: "chapterName",
};

// -------------------------------------------
// Core getters
// -------------------------------------------
export function getUserEmail() {
  return localStorage.getItem(KEYS.EMAIL) || "";
}

export function getUserRole() {
  return localStorage.getItem(KEYS.ROLE) || "cho";
}

export function getUserId() {
  return localStorage.getItem(KEYS.USER_ID) || "";
}

export function getUserName() {
  return localStorage.getItem(KEYS.USER_NAME) || "";
}

export function getUserChapterId() {
  return localStorage.getItem(KEYS.CHAPTER_ID) || "";
}

export function getUserChapterName() {
  return localStorage.getItem(KEYS.CHAPTER_NAME) || "";
}

export function isAdmin() {
  return getUserRole() === "admin";
}

export function isCHO() {
  return getUserRole() === "cho";
}

export function isLoggedIn() {
  return localStorage.getItem(KEYS.EMAIL) !== null;
}

// -------------------------------------------
// Setters — called after successful login
// -------------------------------------------
export function setSession(user) {
  localStorage.setItem(KEYS.EMAIL, user.email || "");
  localStorage.setItem(KEYS.ROLE, user.role || "cho");
  localStorage.setItem(KEYS.USER_ID, user.id || "");
  localStorage.setItem(KEYS.USER_NAME, user.name || "");
  localStorage.setItem(KEYS.CHAPTER_ID, user.chapterId || "");
  localStorage.setItem(KEYS.CHAPTER_NAME, user.chapterName || "");
}

export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

// -------------------------------------------
// Logout
// -------------------------------------------
export function logout() {
  clearSession();
}

// -------------------------------------------
// Route protection
// -------------------------------------------
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// -------------------------------------------
// User lookup — find user by email
// In real app this queries Firestore "users" collection
// -------------------------------------------
export async function findUserByEmail(email) {
  if (USE_PSEUDO_DATA) {
    return pseudoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  try {
    await ensureAuth();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("Error finding user:", err);
    return null;
  }
}

// -------------------------------------------
// Chapter lookup — get chapter details by chapterId
// -------------------------------------------
export async function getChapterById(chapterId) {
  if (USE_PSEUDO_DATA) {
    return pseudoChapters.find((c) => c.chapterId === chapterId) || null;
  }

  try {
    await ensureAuth();
    const chaptersRef = collection(db, "chapters");
    const q = query(chaptersRef, where("chapterId", "==", chapterId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("Error getting chapter:", err);
    return null;
  }
}

// -------------------------------------------
// Get all chapters (for MAD Connect)
// -------------------------------------------
export async function getAllChapters() {
  if (USE_PSEUDO_DATA) {
    return [...pseudoChapters];
  }

  try {
    await ensureAuth();
    const chaptersRef = collection(db, "chapters");
    const snapshot = await getDocs(chaptersRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error getting all chapters:", err);
    return [];
  }
}
