import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

const SEED_DATA = [
  {
    id: "day-1",
    dayNumber: 1,
    title: "ÜST VÜCUT",
    subtitle: "Çekiş Ağırlıklı & Postür Odaklı",
    exercises: [
      {
        id: "d1-ex1",
        name: "Barbell Row",
        muscleGroup: "Sırt",
        sets: 4,
        reps: "8-10",
        youtubeVideoId: "vT2GjY_Umpw",
        order: 1,
      },
      {
        id: "d1-ex2",
        name: "Lat Pulldown",
        muscleGroup: "Sırt",
        sets: 4,
        reps: "10-12",
        youtubeVideoId: "CAwf7n6Luuc",
        order: 2,
      },
      {
        id: "d1-ex3",
        name: "Face Pull",
        muscleGroup: "Arka Omuz / Postür",
        sets: 4,
        reps: "15-20",
        youtubeVideoId: "rep-qVOkqgk",
        order: 3,
      },
      {
        id: "d1-ex4",
        name: "Dumbbell Shrug",
        muscleGroup: "Trapez",
        sets: 3,
        reps: "12-15",
        youtubeVideoId: "cJRVVxmytaM",
        order: 4,
      },
      {
        id: "d1-ex5",
        name: "Hammer Curl",
        muscleGroup: "Biceps / Ön Kol",
        sets: 3,
        reps: "10-12",
        youtubeVideoId: "zC3nLlEVfpI",
        order: 5,
      },
      {
        id: "d1-ex6",
        name: "Reverse Fly (Makine)",
        muscleGroup: "Arka Omuz",
        sets: 3,
        reps: "12-15",
        youtubeVideoId: "5YK4bgzXDp0",
        order: 6,
      },
    ],
  },
  {
    id: "day-2",
    dayNumber: 2,
    title: "ALT VÜCUT & CORE",
    subtitle: "Bacak ve Karın Odaklı",
    exercises: [
      {
        id: "d2-ex1",
        name: "Barbell Squat",
        muscleGroup: "Quadriceps",
        sets: 4,
        reps: "6-8",
        youtubeVideoId: "bEv6CCg2BC8",
        order: 1,
      },
      {
        id: "d2-ex2",
        name: "Romanian Deadlift",
        muscleGroup: "Hamstring / Kalça",
        sets: 4,
        reps: "8-10",
        youtubeVideoId: "7j-2w4-P14I",
        order: 2,
      },
      {
        id: "d2-ex3",
        name: "Leg Press",
        muscleGroup: "Bacak Genel",
        sets: 3,
        reps: "10-12",
        youtubeVideoId: "IZxyjW7MPJQ",
        order: 3,
      },
      {
        id: "d2-ex4",
        name: "Walking Lunge",
        muscleGroup: "Quadriceps / Kalça",
        sets: 3,
        reps: "12 (her bacak)",
        youtubeVideoId: "L8fvypPH3SA",
        order: 4,
      },
      {
        id: "d2-ex5",
        name: "Hanging Leg Raise",
        muscleGroup: "Alt Karın",
        sets: 3,
        reps: "12-15",
        youtubeVideoId: "Pr1ieGZ5atk",
        order: 5,
      },
      {
        id: "d2-ex6",
        name: "Plank",
        muscleGroup: "Core",
        sets: 3,
        reps: "45-60 sn",
        youtubeVideoId: "ASdvN_XEl_c",
        order: 6,
      },
    ],
  },
  {
    id: "day-3",
    dayNumber: 3,
    title: "AKTİF DİNLENME",
    subtitle: "Kardiyo & Esneklik",
    exercises: [
      {
        id: "d3-ex1",
        name: "Hafif Koşu / Yürüyüş",
        muscleGroup: "Kardiyo",
        sets: 1,
        reps: "20-30 dk",
        youtubeVideoId: "mmifLe7Iw7s",
        order: 1,
      },
      {
        id: "d3-ex2",
        name: "Kürek Çekme (Rowing)",
        muscleGroup: "Kardiyo / Tam Vücut",
        sets: 1,
        reps: "15 dk",
        youtubeVideoId: "sP6VjBDytz4",
        order: 2,
      },
      {
        id: "d3-ex3",
        name: "Foam Roller Sırt",
        muscleGroup: "Mobilite",
        sets: 1,
        reps: "5 dk",
        youtubeVideoId: "SxQHpnaGMQc",
        order: 3,
      },
      {
        id: "d3-ex4",
        name: "Dinamik Stretching",
        muscleGroup: "Esneklik",
        sets: 1,
        reps: "10 dk",
        youtubeVideoId: "nPHfEnZD1Wk",
        order: 4,
      },
    ],
  },
  {
    id: "day-4",
    dayNumber: 4,
    title: "ÜST VÜCUT",
    subtitle: "İtiş Ağırlıklı & Kondisyon",
    exercises: [
      {
        id: "d4-ex1",
        name: "Bench Press",
        muscleGroup: "Göğüs",
        sets: 4,
        reps: "6-8",
        youtubeVideoId: "rT7DgCr-3pg",
        order: 1,
      },
      {
        id: "d4-ex2",
        name: "Overhead Press",
        muscleGroup: "Ön Omuz",
        sets: 4,
        reps: "8-10",
        youtubeVideoId: "_RlRDWO2jfg",
        order: 2,
      },
      {
        id: "d4-ex3",
        name: "İncline Dumbbell Press",
        muscleGroup: "Üst Göğüs",
        sets: 3,
        reps: "10-12",
        youtubeVideoId: "8iPEnn-ltC8",
        order: 3,
      },
      {
        id: "d4-ex4",
        name: "Triceps Pushdown",
        muscleGroup: "Triceps",
        sets: 3,
        reps: "10-12",
        youtubeVideoId: "2-LAMcpzODU",
        order: 4,
      },
      {
        id: "d4-ex5",
        name: "Lateral Raise",
        muscleGroup: "Yan Omuz",
        sets: 4,
        reps: "12-15",
        youtubeVideoId: "3VcKaXpzqRo",
        order: 5,
      },
      {
        id: "d4-ex6",
        name: "Dips",
        muscleGroup: "Göğüs / Triceps",
        sets: 3,
        reps: "8-12",
        youtubeVideoId: "2z8JmcrW-As",
        order: 6,
      },
    ],
  },
  {
    id: "day-5",
    dayNumber: 5,
    title: "TAM VÜCUT",
    subtitle: "Patlayıcı Güç & Kondisyon",
    exercises: [
      {
        id: "d5-ex1",
        name: "Deadlift",
        muscleGroup: "Tam Vücut",
        sets: 4,
        reps: "5-6",
        youtubeVideoId: "op9kVnSso6Q",
        order: 1,
      },
      {
        id: "d5-ex2",
        name: "Power Clean",
        muscleGroup: "Tam Vücut / Patlayıcılık",
        sets: 4,
        reps: "5",
        youtubeVideoId: "GVt3pZOhzlM",
        order: 2,
      },
      {
        id: "d5-ex3",
        name: "Box Jump",
        muscleGroup: "Bacak / Patlayıcılık",
        sets: 3,
        reps: "8-10",
        youtubeVideoId: "52r_Ul5k03g",
        order: 3,
      },
      {
        id: "d5-ex4",
        name: "Push Press",
        muscleGroup: "Omuz / Tam Vücut",
        sets: 3,
        reps: "8",
        youtubeVideoId: "iaBVSJm78ko",
        order: 4,
      },
      {
        id: "d5-ex5",
        name: "Battle Rope",
        muscleGroup: "Kondisyon / Üst Vücut",
        sets: 3,
        reps: "30 sn",
        youtubeVideoId: "a7vUbMmhNOU",
        order: 5,
      },
      {
        id: "d5-ex6",
        name: "Burpee",
        muscleGroup: "Tam Vücut / Kondisyon",
        sets: 3,
        reps: "10-12",
        youtubeVideoId: "dZgVxmf6jkA",
        order: 6,
      },
    ],
  },
];

async function seed() {
  console.log("🔥 Firestore seed başlatılıyor...\n");

  for (const day of SEED_DATA) {
    const { id, ...data } = day;
    await db.collection("days").doc(id).set(data);
    console.log(`  ✅ Gün ${data.dayNumber}: ${data.title} (${data.exercises.length} egzersiz)`);
  }

  console.log("\n🎉 Seed tamamlandı! Tüm veriler Firestore'a yazıldı.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed hatası:", err);
  process.exit(1);
});
