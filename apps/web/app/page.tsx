"use client";

import { useReducer } from "react";
import { useLanguage } from "./i18n/LanguageProvider";
import type { Category, SubmitReportResponse } from "./lib/api";
import { StartStep } from "./components/report/StartStep";
import { PhotoStep } from "./components/report/PhotoStep";
import { LocationStep } from "./components/report/LocationStep";
import { CategoryStep } from "./components/report/CategoryStep";
import { SubmitStep } from "./components/report/SubmitStep";
import { initialFlowState, type FlowState, type StepId } from "./components/report/flow-types";

type FlowAction =
  | { type: "SET_PHOTO"; photoKey: string; previewUrl: string; file: File }
  | { type: "SET_LOCATION"; latitude: number; longitude: number }
  | { type: "SET_CATEGORY"; category: Category }
  | { type: "GO_TO"; step: StepId }
  | { type: "SET_RESULT"; result: SubmitReportResponse }
  | { type: "RESET" };

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "SET_PHOTO":
      return {
        ...state,
        photoKey: action.photoKey,
        photoPreviewUrl: action.previewUrl,
        photoFile: action.file,
      };
    case "SET_LOCATION":
      return { ...state, latitude: action.latitude, longitude: action.longitude };
    case "SET_CATEGORY":
      return { ...state, category: action.category };
    case "GO_TO":
      return { ...state, step: action.step };
    case "SET_RESULT":
      return { ...state, result: action.result, step: "success" };
    case "RESET":
      return initialFlowState;
    default:
      return state;
  }
}

const STEP_ORDER: StepId[] = ["start", "photo", "location", "category", "submit"];

export default function ReportPage() {
  const { t } = useLanguage();
  const [state, dispatch] = useReducer(flowReducer, initialFlowState);

  function goNext() {
    const idx = STEP_ORDER.indexOf(state.step);
    if (idx >= 0 && idx < STEP_ORDER.length - 1) {
      dispatch({ type: "GO_TO", step: STEP_ORDER[idx + 1] });
    }
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(state.step);
    if (idx > 0) {
      dispatch({ type: "GO_TO", step: STEP_ORDER[idx - 1] });
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col">
      {state.step !== "start" ? (
        <nav
          aria-label="Report progress"
          className="flex justify-between px-4 py-3 text-xs text-gray-500"
        >
          <span aria-current={state.step === "photo" ? "step" : undefined}>
            {t("stepperPhoto")}
          </span>
          <span aria-current={state.step === "location" ? "step" : undefined}>
            {t("stepperLocation")}
          </span>
          <span aria-current={state.step === "category" ? "step" : undefined}>
            {t("stepperCategory")}
          </span>
          <span
            aria-current={state.step === "submit" || state.step === "success" ? "step" : undefined}
          >
            {t("stepperSubmit")}
          </span>
        </nav>
      ) : null}

      {state.step === "start" ? <StartStep onNext={goNext} /> : null}

      {state.step === "photo" ? (
        <PhotoStep
          photoPreviewUrl={state.photoPreviewUrl}
          onPhotoReady={(photoKey, previewUrl, file) =>
            dispatch({ type: "SET_PHOTO", photoKey, previewUrl, file })
          }
          onNext={goNext}
        />
      ) : null}

      {state.step === "location" ? (
        <LocationStep
          latitude={state.latitude}
          longitude={state.longitude}
          onLocationReady={(latitude, longitude) =>
            dispatch({ type: "SET_LOCATION", latitude, longitude })
          }
          onNext={goNext}
          onBack={goBack}
        />
      ) : null}

      {state.step === "category" ? (
        <CategoryStep
          category={state.category}
          onSelectCategory={(category) => dispatch({ type: "SET_CATEGORY", category })}
          onNext={goNext}
          onBack={goBack}
        />
      ) : null}

      {state.step === "submit" || state.step === "success" ? (
        <SubmitStep
          category={state.category as Category}
          latitude={state.latitude as number}
          longitude={state.longitude as number}
          photoKey={state.photoKey as string}
          photoPreviewUrl={state.photoPreviewUrl}
          onBack={goBack}
          onSuccess={(result) => dispatch({ type: "SET_RESULT", result })}
          onReset={() => dispatch({ type: "RESET" })}
          result={state.result}
        />
      ) : null}
    </div>
  );
}
