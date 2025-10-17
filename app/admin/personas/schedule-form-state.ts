"use client";

export type ScheduleFormState = {
  success: boolean;
  errors: Record<string, string>;
  message: string | null;
};

export const scheduleInitialState: ScheduleFormState = {
  success: false,
  errors: {},
  message: null,
};