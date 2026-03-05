 "use client";

 import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useState,
   type ReactNode,
 } from "react";

 type Language = "tr" | "en";

 interface LanguageContextValue {
   lang: Language;
   setLang: (lang: Language) => void;
   t: (key: string) => string;
 }

 const LanguageContext = createContext<LanguageContextValue | undefined>(
   undefined
 );

 const translations = {
   tr: {
     common: {
       language_tr: "Türkçe",
       language_en: "İngilizce",
       cancel: "İPTAL",
       save: "KAYDET",
       yesReset: "EVET, SIFIRLA",
       yesDelete: "EVET, SİL",
       backToHome: "ANA SAYFAYA DÖN",
     },
     header: {
       titleMain: "ANTRENMAN",
       titleSub: "PROGRAMI",
       flexibleCycle: "ESNEK GÜN DÖNGÜSÜ",
       adminPanel: "ADMİN PANEL",
       active: "AKTİF",
     },
     workout: {
       loading: "PROGRAM YÜKLENİYOR",
       emptyTitle: "PROGRAM BULUNAMADI",
       emptyBody:
         "Firestore'da henüz antrenman verisi yok. Admin panelinden veya seed script ile veri ekleyin.",
       resetAllTitle: "PROGRAMI SIFIRLA",
       resetAllBody:
         "Tüm günlerin ilerlemesini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
       resetDay: "GÜN İLERLEMESİNİ SIFIRLA",
       resetProgram: "PROGRAMI SIFIRLA",
       completedLabel: "TAMAMLANDI",
       allDoneBadge: "BU GÜN TAMAMLANDI",
       dayLabel: "GÜN",
     },
     exerciseCard: {
       sets: "SET",
       reps: "TEKRAR",
       watchVideo: "VİDEOYU İZLE",
     },
     admin: {
       adminPanelTitle: "ADMİN PANELİ",
       adminPanelSubtitle: "ANTRENMAN YÖNETİMİ",
       goHome: "ANA SAYFA",
       logout: "ÇIKIŞ",
       dayManagement: "GÜN YÖNETİMİ",
       totalDaysPrefix: "Toplam",
       totalDaysSuffix: "gün tanımlı.",
       newDay: "YENİ GÜN EKLE",
       create: "OLUŞTUR",
       editingDayInfo: "GÜN BİLGİLERİNİ DÜZENLE",
       dayTitleLabel: "BAŞLIK",
       daySubtitleLabel: "ALT BAŞLIK",
       dayTitleTrLabel: "BAŞLIK (TR)",
       dayTitleEnLabel: "BAŞLIK (EN)",
       daySubtitleTrLabel: "ALT BAŞLIK (TR)",
       daySubtitleEnLabel: "ALT BAŞLIK (EN)",
       exercisesCountSuffix: "EGZERSİZ",
       addExercise: "YENİ EGZERSİZ EKLE",
       deleteDay: "GÜNÜ SİL",
       confirmDeleteDayTitle: "GÜNÜ SİL",
       confirmDeleteDayBodyPrefix: "Gün",
       confirmDeleteDayBodyMiddle:
         'tamamen silinecek. Bu işleme bağlı tüm egzersizler de kaybolacak. Devam etmek istiyor musunuz?',
       confirmDeleteExerciseTitle: "EGZERSİZİ SİL",
       confirmDeleteExerciseBody: "Aşağıdaki egzersiz silinecek:",
       updatingData: "Veriler güncelleniyor…",
       creatingDayError: "Gün numarası ve başlık zorunludur.",
       creatingDaySuccess: "Yeni gün oluşturuldu!",
       creatingDayFailed: "Gün oluşturulurken hata oluştu.",
       loadingError: "Veriler yüklenemedi.",
       dayDeleted: "Gün silindi!",
       dayDeleteFailed: "Gün silinirken hata oluştu.",
       exerciseAdded: "Egzersiz eklendi!",
       exerciseAddFailed: "Egzersiz eklenirken hata oluştu.",
       exerciseUpdated: "Egzersiz güncellendi!",
       exerciseUpdateFailed: "Güncelleme sırasında hata oluştu.",
       exerciseDeleted: "Egzersiz silindi!",
       exerciseDeleteFailed: "Silme sırasında hata oluştu.",
       dayMetaUpdated: "Gün bilgileri güncellendi!",
       dayMetaUpdateFailed: "Güncelleme başarısız.",
     },
     adminExerciseForm: {
       editTitle: "EGZERSİZİ DÜZENLE",
       newTitle: "YENİ EGZERSİZ EKLE",
       nameTr: "EGZERSİZ ADI (TR)",
       nameEn: "EGZERSİZ ADI (EN)",
       muscleGroupTr: "KAS GRUBU (TR)",
       muscleGroupEn: "KAS GRUBU (EN)",
       sets: "SET SAYISI",
       reps: "TEKRAR",
       youtubeId: "YOUTUBE VİDEO ID",
       order: "SIRA",
       save: "KAYDET",
       cancel: "İPTAL",
     },
     adminLogin: {
       title: "ADMİN GİRİŞİ",
       subtitle: "YETKİLENDİRİLMİŞ ERİŞİM",
       email: "E-POSTA",
       password: "ŞİFRE",
       invalidCredentials: "Geçersiz e-posta veya şifre.",
       login: "GİRİŞ YAP",
       loggingIn: "GİRİŞ YAPILIYOR...",
     },
     notFound: {
       title: "SAYFA BULUNAMADI",
       body: "Aradığınız sayfa mevcut değil veya taşınmış olabilir.",
     },
   },
   en: {
     common: {
       language_tr: "Turkish",
       language_en: "English",
       cancel: "CANCEL",
       save: "SAVE",
       yesReset: "YES, RESET",
       yesDelete: "YES, DELETE",
       backToHome: "BACK TO HOME",
     },
     header: {
       titleMain: "WORKOUT",
       titleSub: "PROGRAM",
       flexibleCycle: "FLEXIBLE DAY CYCLE",
       adminPanel: "ADMIN PANEL",
       active: "ACTIVE",
     },
     workout: {
       loading: "LOADING PROGRAM",
       emptyTitle: "NO PROGRAM FOUND",
       emptyBody:
         "There is no workout data in Firestore yet. Add data from the admin panel or using the seed script.",
       resetAllTitle: "RESET PROGRAM",
       resetAllBody:
         "Are you sure you want to reset progress for all days? This action cannot be undone.",
       resetDay: "RESET DAY PROGRESS",
       resetProgram: "RESET PROGRAM",
       completedLabel: "COMPLETED",
       allDoneBadge: "THIS DAY IS COMPLETE",
       dayLabel: "DAY",
     },
     exerciseCard: {
       sets: "SETS",
       reps: "REPS",
       watchVideo: "WATCH VIDEO",
     },
     admin: {
       adminPanelTitle: "ADMIN PANEL",
       adminPanelSubtitle: "WORKOUT MANAGEMENT",
       goHome: "HOME",
       logout: "LOG OUT",
       dayManagement: "DAY MANAGEMENT",
       totalDaysPrefix: "There are",
       totalDaysSuffix: "days defined.",
       newDay: "ADD NEW DAY",
       create: "CREATE",
       editingDayInfo: "EDIT DAY DETAILS",
       dayTitleLabel: "TITLE",
       daySubtitleLabel: "SUBTITLE",
       dayTitleTrLabel: "TITLE (TR)",
       dayTitleEnLabel: "TITLE (EN)",
       daySubtitleTrLabel: "SUBTITLE (TR)",
       daySubtitleEnLabel: "SUBTITLE (EN)",
       exercisesCountSuffix: "EXERCISES",
       addExercise: "ADD NEW EXERCISE",
       deleteDay: "DELETE DAY",
       confirmDeleteDayTitle: "DELETE DAY",
       confirmDeleteDayBodyPrefix: "Day",
       confirmDeleteDayBodyMiddle:
         'will be deleted completely. All related exercises will also be removed. Do you want to continue?',
       confirmDeleteExerciseTitle: "DELETE EXERCISE",
       confirmDeleteExerciseBody: "The following exercise will be deleted:",
       updatingData: "Updating data…",
       creatingDayError: "Day number and title are required.",
       creatingDaySuccess: "New day created!",
       creatingDayFailed: "An error occurred while creating the day.",
       loadingError: "Failed to load data.",
       dayDeleted: "Day deleted!",
       dayDeleteFailed: "An error occurred while deleting the day.",
       exerciseAdded: "Exercise added!",
       exerciseAddFailed: "An error occurred while adding the exercise.",
       exerciseUpdated: "Exercise updated!",
       exerciseUpdateFailed: "An error occurred while updating the exercise.",
       exerciseDeleted: "Exercise deleted!",
       exerciseDeleteFailed: "An error occurred while deleting the exercise.",
       dayMetaUpdated: "Day details updated!",
       dayMetaUpdateFailed: "Update failed.",
     },
     adminExerciseForm: {
       editTitle: "EDIT EXERCISE",
       newTitle: "ADD NEW EXERCISE",
       nameTr: "EXERCISE NAME (TR)",
       nameEn: "EXERCISE NAME (EN)",
       muscleGroupTr: "MUSCLE GROUP (TR)",
       muscleGroupEn: "MUSCLE GROUP (EN)",
       sets: "SETS",
       reps: "REPS",
       youtubeId: "YOUTUBE VIDEO ID",
       order: "ORDER",
       save: "SAVE",
       cancel: "CANCEL",
     },
     adminLogin: {
       title: "ADMIN LOGIN",
       subtitle: "AUTHORIZED ACCESS",
       email: "EMAIL",
       password: "PASSWORD",
       invalidCredentials: "Invalid email or password.",
       login: "LOG IN",
       loggingIn: "LOGGING IN...",
     },
     notFound: {
       title: "PAGE NOT FOUND",
       body: "The page you are looking for does not exist or may have been moved.",
     },
   },
 } as const;

 function getNestedValue(obj: unknown, path: string): unknown {
   return path.split(".").reduce<unknown>((acc, part) => {
     if (acc && typeof acc === "object" && part in acc) {
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       return (acc as any)[part];
     }
     return undefined;
   }, obj);
 }

 export function LanguageProvider({ children }: { children: ReactNode }) {
   const [lang, setLangState] = useState<Language>("tr");

   useEffect(() => {
     if (typeof window === "undefined") return;
     const stored = window.localStorage.getItem("gym-lang");
     if (stored === "tr" || stored === "en") {
       setLangState(stored);
     }
   }, []);

   const setLang = useCallback((value: Language) => {
     setLangState(value);
     if (typeof window !== "undefined") {
       window.localStorage.setItem("gym-lang", value);
     }
   }, []);

   const t = useCallback(
     (key: string) => {
       const value =
         getNestedValue(translations[lang], key) ??
         getNestedValue(translations.tr, key) ??
         key;
       return typeof value === "string" ? value : key;
     },
     [lang]
   );

   return (
     <LanguageContext.Provider value={{ lang, setLang, t }}>
       {children}
     </LanguageContext.Provider>
   );
 }

 export function useLanguage(): LanguageContextValue {
   const ctx = useContext(LanguageContext);
   if (!ctx) {
     throw new Error("useLanguage must be used within LanguageProvider");
   }
   return ctx;
 }

