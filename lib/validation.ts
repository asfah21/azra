import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { consolePino } from "./logger";

type ComponentType = {
  component: string;
  subcomponent: string;
};

type BreakdownFormData = {
  breakdownNumber?: string;
  description: string;
  breakdownTime: string;
  workingHours: number;
  unitId: string;
  reportedById: string;
  priority: "low" | "medium" | "high";
  shift: "siang" | "malam";
  components: ComponentType[];
};

// Schema for breakdown form validation
export const breakdownSchema = z.object({
  breakdownNumber: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  breakdownTime: z
    .string()
    .refine(
      (val: string) => !isNaN(Date.parse(val)),
      "Please enter a valid date",
    ),
  workingHours: z.number().min(0.1, "Working hours must be greater than 0"),
  unitId: z.string().min(1, "Unit is required"),
  reportedById: z.string().min(1, "Reporter is required"),
  priority: z.enum(["low", "medium", "high"], {
    message: "Priority is required",
  }),
  shift: z.enum(["siang", "malam"], {
    message: "Shift is required",
  }),
  components: z
    .array(
      z.object({
        component: z.string().min(1, "Component is required"),
        subcomponent: z.string().min(1, "Subcomponent is required"),
      }),
    )
    .min(1, "At least one component is required"),
});

// Rate limiter configuration
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create a rate limiter that allows 5 requests per 1 hour per IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
});

// New function to validate breakdown form data
export async function validateBreakdownFormData(
  data: BreakdownFormData,
): Promise<string[]> {
  try {
    const validationResult = breakdownSchema.safeParse(data);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );

      return errorMessages;
    }

    return [];
  } catch (error) {
    consolePino.error({ err: error }, "Validation failed");

    return ["Validation failed"];
  }
}
