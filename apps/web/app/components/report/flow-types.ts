import type { Category, SubmitReportResponse } from "../../lib/api";

export type StepId =
  | "start"
  | "photo"
  | "location"
  | "category"
  | "submit"
  | "success"
  | "error";

export interface FlowState {
  step: StepId;
  photoFile?: File;
  photoPreviewUrl?: string;
  photoKey?: string;
  latitude?: number;
  longitude?: number;
  category?: Category;
  result?: SubmitReportResponse;
  errorMessage?: string;
}

export const initialFlowState: FlowState = {
  step: "start",
};
