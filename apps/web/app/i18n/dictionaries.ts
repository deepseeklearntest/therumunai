// Every user-facing string in the app must have an English and a தமிழ் (Tamil)
// translation (CLAUDE.md HARD RULE 4). The `Dictionary` type is the single
// source of truth for every UI string key; `en` and `ta` both implement it,
// so a missing translation is a TypeScript compile error.

export type Lang = "en" | "ta";

export interface Dictionary {
  siteName: string;
  tagline: string;
  langToggleLabel: string;
  langToggleAria: string;

  disclosure: string;

  ctaReportIssue: string;
  startInstructions: string;

  stepPhotoTitle: string;
  stepLocationTitle: string;
  stepCategoryTitle: string;
  stepSubmitTitle: string;

  stepperPhoto: string;
  stepperLocation: string;
  stepperCategory: string;
  stepperSubmit: string;

  photoInstructions: string;
  photoPrivacyNote: string;
  photoInputLabel: string;
  photoInputAria: string;
  photoPreviewAlt: string;
  photoUploading: string;
  photoUploadError: string;
  photoChangeButton: string;
  photoNextButton: string;

  locationInstructions: string;
  locationFetchButton: string;
  locationFetchingLabel: string;
  locationCapturedLabel: string;
  locationDeniedMessage: string;
  locationUnavailableMessage: string;
  locationRetryButton: string;
  locationNextButton: string;
  locationBackButton: string;

  categoryInstructions: string;
  categoryGarbageLabel: string;
  categoryRoadLabel: string;
  categoryStreetlightLabel: string;
  categoryDrainageLabel: string;
  categoryNextButton: string;
  categoryBackButton: string;

  submitReviewTitle: string;
  submitCategoryLabel: string;
  submitLocationLabel: string;
  submitPhotoLabel: string;
  submitButton: string;
  submitSubmittingLabel: string;
  submitBackButton: string;
  submitErrorTitle: string;
  submitErrorRetryButton: string;
  submitGenericError: string;

  successTitle: string;
  successMessage: string;
  successCityLabel: string;
  successZoneLabel: string;
  successZoneUnavailable: string;
  successReportAnother: string;

  mapViewLink: string;
  mapTitle: string;
  mapLoading: string;
  mapError: string;
  mapEmpty: string;
  mapNoFilterMatch: string;
  mapLegendTitle: string;
  mapFilterAll: string;
  mapPopupReportedOn: string;
  mapPopupZoneUnavailable: string;
}

export const en: Dictionary = {
  siteName: "Therumunai",
  tagline: "Report civic issues anonymously",
  langToggleLabel: "தமிழ்",
  langToggleAria: "Switch language to Tamil",

  disclosure:
    "Therumunai is an independent citizen-led civic initiative. We are not affiliated with the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation (CCMC), or the Government of Tamil Nadu.",

  ctaReportIssue: "Report an Issue",
  startInstructions:
    "No login, no personal data — just tell us what's wrong and where.",

  stepPhotoTitle: "Add a Photo",
  stepLocationTitle: "Confirm Location",
  stepCategoryTitle: "Select Category",
  stepSubmitTitle: "Review & Submit",

  stepperPhoto: "Photo",
  stepperLocation: "Location",
  stepperCategory: "Category",
  stepperSubmit: "Submit",

  photoInstructions: "Take or choose a photo of the issue.",
  photoPrivacyNote:
    "Please avoid photographing identifiable people. Focus on the issue itself.",
  photoInputLabel: "Choose photo",
  photoInputAria: "Choose or capture a photo of the civic issue",
  photoPreviewAlt: "Preview of the selected issue photo",
  photoUploading: "Uploading photo...",
  photoUploadError: "Could not upload photo. Please try again.",
  photoChangeButton: "Change photo",
  photoNextButton: "Next: Location",

  locationInstructions:
    "We need your current location to tag the report to the right municipal zone.",
  locationFetchButton: "Use my current location",
  locationFetchingLabel: "Getting your location...",
  locationCapturedLabel: "Location captured",
  locationDeniedMessage:
    "Location access was denied. Please allow location access and try again.",
  locationUnavailableMessage:
    "Could not determine your location. Please check your device settings and try again.",
  locationRetryButton: "Try again",
  locationNextButton: "Next: Category",
  locationBackButton: "Back",

  categoryInstructions: "What kind of issue are you reporting?",
  categoryGarbageLabel: "Garbage & Waste",
  categoryRoadLabel: "Road Damage & Potholes",
  categoryStreetlightLabel: "Streetlight Faults",
  categoryDrainageLabel: "Drainage & Waterlogging",
  categoryNextButton: "Next: Review",
  categoryBackButton: "Back",

  submitReviewTitle: "Review your report",
  submitCategoryLabel: "Category",
  submitLocationLabel: "Location",
  submitPhotoLabel: "Photo",
  submitButton: "Submit report",
  submitSubmittingLabel: "Submitting...",
  submitBackButton: "Back",
  submitErrorTitle: "Submission failed",
  submitErrorRetryButton: "Retry",
  submitGenericError: "Something went wrong. Please try again.",

  successTitle: "Report submitted",
  successMessage: "Thank you. Your anonymous report has been received.",
  successCityLabel: "City",
  successZoneLabel: "Zone",
  successZoneUnavailable: "Zone not available for this location",
  successReportAnother: "Report another issue",

  mapViewLink: "View the map",
  mapTitle: "Reported issues map",
  mapLoading: "Loading reports...",
  mapError: "Could not load reports. Please try again.",
  mapEmpty: "No reports yet.",
  mapNoFilterMatch: "No reports match the selected categories.",
  mapLegendTitle: "Categories",
  mapFilterAll: "All",
  mapPopupReportedOn: "Reported on",
  mapPopupZoneUnavailable: "Zone not available for this location",
};

export const ta: Dictionary = {
  siteName: "தெருமுனை",
  tagline: "குடிமை சிக்கல்களை அநாமதேயமாக புகாரளியுங்கள்",
  langToggleLabel: "English",
  langToggleAria: "மொழியை ஆங்கிலத்திற்கு மாற்றவும்",

  disclosure:
    "தெருமுனை என்பது குடிமக்களால் நடத்தப்படும் ஒரு சுயாதீன குடிமை முன்முயற்சியாகும். இது சென்னை மாநகராட்சி (GCC), கோயம்புத்தூர் மாநகராட்சி (CCMC), அல்லது தமிழ்நாடு அரசுடன் எவ்வித தொடர்பும் இல்லை.",

  ctaReportIssue: "குறையைப் பதிவிடு",
  startInstructions:
    "உள்நுழைவு தேவையில்லை, தனிப்பட்ட தகவல்கள் தேவையில்லை — என்ன தவறு, எங்கே என்று மட்டும் சொல்லுங்கள்.",

  stepPhotoTitle: "புகைப்படம் சேர்க்கவும்",
  stepLocationTitle: "இருப்பிடத்தை உறுதிப்படுத்தவும்",
  stepCategoryTitle: "வகையைத் தேர்ந்தெடுக்கவும்",
  stepSubmitTitle: "மதிப்பாய்வு செய்து சமர்ப்பிக்கவும்",

  stepperPhoto: "புகைப்படம்",
  stepperLocation: "இருப்பிடம்",
  stepperCategory: "வகை",
  stepperSubmit: "சமர்ப்பிப்பு",

  photoInstructions: "சிக்கலின் புகைப்படத்தை எடுக்கவும் அல்லது தேர்ந்தெடுக்கவும்.",
  photoPrivacyNote:
    "அடையாளம் காணக்கூடிய நபர்களை புகைப்படம் எடுக்க வேண்டாம். சிக்கலில் மட்டும் கவனம் செலுத்தவும்.",
  photoInputLabel: "புகைப்படத்தைத் தேர்ந்தெடுக்கவும்",
  photoInputAria: "குடிமை சிக்கலின் புகைப்படத்தைத் தேர்ந்தெடுக்கவும் அல்லது எடுக்கவும்",
  photoPreviewAlt: "தேர்ந்தெடுக்கப்பட்ட சிக்கல் புகைப்படத்தின் முன்னோட்டம்",
  photoUploading: "புகைப்படம் பதிவேற்றப்படுகிறது...",
  photoUploadError: "புகைப்படத்தைப் பதிவேற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  photoChangeButton: "புகைப்படத்தை மாற்றவும்",
  photoNextButton: "அடுத்து: இருப்பிடம்",

  locationInstructions:
    "சரியான நகராட்சி மண்டலத்திற்கு குறையை இணைக்க உங்கள் தற்போதைய இருப்பிடம் தேவை.",
  locationFetchButton: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
  locationFetchingLabel: "உங்கள் இருப்பிடத்தைப் பெறுகிறது...",
  locationCapturedLabel: "இருப்பிடம் பெறப்பட்டது",
  locationDeniedMessage:
    "இருப்பிட அணுகல் மறுக்கப்பட்டது. தயவுசெய்து இருப்பிட அணுகலை அனுமதித்து மீண்டும் முயற்சிக்கவும்.",
  locationUnavailableMessage:
    "உங்கள் இருப்பிடத்தைக் கண்டறிய முடியவில்லை. உங்கள் சாதன அமைப்புகளைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  locationRetryButton: "மீண்டும் முயற்சிக்கவும்",
  locationNextButton: "அடுத்து: வகை",
  locationBackButton: "பின்செல்",

  categoryInstructions: "நீங்கள் எந்த வகையான சிக்கலைப் புகாரளிக்கிறீர்கள்?",
  categoryGarbageLabel: "குப்பை / கழிவுகள்",
  categoryRoadLabel: "பழுதடைந்த சாலை",
  categoryStreetlightLabel: "மின்விளக்கு பழுது",
  categoryDrainageLabel: "சாக்கடை / தேங்கிய நீர்",
  categoryNextButton: "அடுத்து: மதிப்பாய்வு",
  categoryBackButton: "பின்செல்",

  submitReviewTitle: "உங்கள் புகாரை மதிப்பாய்வு செய்யவும்",
  submitCategoryLabel: "வகை",
  submitLocationLabel: "இருப்பிடம்",
  submitPhotoLabel: "புகைப்படம்",
  submitButton: "புகாரைச் சமர்ப்பிக்கவும்",
  submitSubmittingLabel: "சமர்ப்பிக்கப்படுகிறது...",
  submitBackButton: "பின்செல்",
  submitErrorTitle: "சமர்ப்பிப்பு தோல்வியடைந்தது",
  submitErrorRetryButton: "மீண்டும் முயற்சிக்கவும்",
  submitGenericError: "ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.",

  successTitle: "புகார் சமர்ப்பிக்கப்பட்டது",
  successMessage: "நன்றி. உங்கள் அநாமதேய புகார் பெறப்பட்டது.",
  successCityLabel: "நகரம்",
  successZoneLabel: "மண்டலம்",
  successZoneUnavailable: "இந்த இருப்பிடத்திற்கு மண்டலம் கிடைக்கவில்லை",
  successReportAnother: "மற்றொரு சிக்கலைப் புகாரளிக்கவும்",

  mapViewLink: "வரைபடத்தைக் காண்க",
  mapTitle: "புகாரளிக்கப்பட்ட சிக்கல்களின் வரைபடம்",
  mapLoading: "புகார்கள் ஏற்றப்படுகின்றன...",
  mapError: "புகார்களை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  mapEmpty: "இதுவரை புகார்கள் இல்லை.",
  mapNoFilterMatch: "தேர்ந்தெடுக்கப்பட்ட வகைகளுக்குப் பொருந்தும் புகார்கள் இல்லை.",
  mapLegendTitle: "வகைகள்",
  mapFilterAll: "அனைத்தும்",
  mapPopupReportedOn: "புகாரளிக்கப்பட்ட தேதி",
  mapPopupZoneUnavailable: "இந்த இருப்பிடத்திற்கு மண்டலம் கிடைக்கவில்லை",
};

export const dictionaries: Record<Lang, Dictionary> = { en, ta };
