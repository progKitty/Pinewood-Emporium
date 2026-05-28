import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const requireSupabaseAuth = createMiddleware()
  .server(async ({ next, request }) => {
    let token = "";
    
    // 1. Check Authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (authHeader.startsWith("Token ")) {
        token = authHeader.substring(6);
      }
    }
    
    // 2. Check Cookie header if no header token
    if (!token) {
      const cookieHeader = request.headers.get("Cookie") || "";
      const cookies = cookieHeader.split(";").reduce((acc, c) => {
        const [name, ...val] = c.trim().split("=");
        acc[name] = val.join("=");
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies["auth_token"] || cookies["sb-access-token"] || "";
    }

    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    let userId = "";

    // Try to verify as Supabase token
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        userId = user.id;
      }
    } catch (e) {
      // Ignore and fallback to Django
    }

    // Try to verify as Django token if not verified yet
    if (!userId) {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me/", {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const djUser = await res.json();
          userId = String(djUser.id);
        }
      } catch (e) {
        console.error("Django auth check failed in middleware:", e);
      }
    }

    if (!userId) {
      throw new Error("Unauthorized: Invalid token");
    }

    return next({
      context: {
        userId,
        supabase,
      },
    });
  });
