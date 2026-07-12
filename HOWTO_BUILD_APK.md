# RideGo — APK Kaise Banayein (Poora Guide)

Yeh folder ek real Vite + React project hai (Claude ke artifact wala code nahi) — isse
Android APK banayi ja sakti hai. Neeche do tareeke diye hain: ek **computer se**
(recommended, poora control milta hai), aur ek **sirf phone se** (agar computer nahi hai).

---

## Zaroori cheez: Computer chahiye hoga (thodi der ke liye)

APK banane ke liye Android SDK + build tools chahiye hote hain — yeh sirf phone se
karna practically bahut mushkil hai. Agar aapke paas kabhi kabhi ke liye ek Windows/Mac/
Linux computer (dost ka, cyber cafe, library) mil sakta hai, to Method A follow karein —
ek baar mein APK ban jaayegi, phir sirf apne phone pe copy karke install kar lena.

Agar bilkul computer access nahi milta, Method B (online APK builder) dekhein — usme
code likhna nahi padta, bas hosted website ka link dena hota hai.

---

## Method A: Computer se real APK (poora control, free)

### Step 1 — Node.js install karein
1. https://nodejs.org se **LTS version** download karein (Windows/Mac dono ke liye hai)
2. Install kar lein (Next-Next-Finish)
3. Check karne ke liye terminal/cmd kholein aur likhein: `node -v`

### Step 2 — Is project folder ko computer pe le jaayein
- Yeh poora `ridego-mobile` folder Google Drive/USB se apne computer pe copy karein
- Terminal mein us folder ke andar jaayein: `cd ridego-mobile`

### Step 3 — Dependencies install karein
```
npm install
```
(Isme 2-5 minute lagenge, internet chahiye)

### Step 4 — Web build banayein
```
npm run build
```
Isse ek `dist` folder banega — yeh aapki app ka final web version hai.

### Step 5 — Android project add karein
```
npx cap add android
npx cap sync
```
Isse ek `android` folder banega — yeh asli Android Studio project hai.

### Step 6 — APK banayein (do tareeke)

**Option 1: Android Studio se (aasan, GUI)**
1. https://developer.android.com/studio se Android Studio install karein
2. Android Studio kholke "Open" karein → `ridego-mobile/android` folder select karein
3. Upar menu se: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Kuch minute wait karein — neeche notification aayegi "APK generated"
5. APK yahan milegi: `android/app/build/outputs/apk/debug/app-debug.apk`

**Option 2: Sirf command line se (Android Studio ke bina)**
```
cd android
./gradlew assembleDebug
```
(Windows pe: `gradlew.bat assembleDebug`)
APK usi jagah banegi: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 7 — APK ko phone pe le jaayein aur install karein
1. `app-debug.apk` file ko WhatsApp/Google Drive/USB se apne Android phone pe bhejein
2. Phone pe file kholein → agar warning aaye "Install blocked", to
   **Settings → Security → Install unknown apps** mein us app (jaise Files/Chrome) ko allow kar dein
3. Install dabayein — RideGo icon home screen pe aa jaayega, bilkul normal app jaisa

Yehi APK file aap kisi ko bhi bhej sakte ho — unhe bhi Play Store ki zaroorat nahi,
bas "unknown sources" allow karna hoga (Android safety feature hai, normal hai).

---

## Method B: Sirf phone se, bina Android Studio ke

Yeh tab kaam aayega jab computer bilkul available na ho:

1. Pehle app ko free web hosting pe daalna hoga (Vercel/Netlify) — link aayega jaise
   `https://ridego-aunap.vercel.app`
2. Phir in mein se kisi free "website to APK" service ka use karein (phone browser se hi ho jaata hai):
   - **Median.co** (median.co) — website ka link do, APK ban ke milta hai
   - **PWABuilder.com** — Microsoft ka free tool, PWA ko APK mein convert karta hai
   - **Appilix.com** — free tier available hai
3. Yeh services aapki website ko ek WebView APK mein wrap kar dete hain

Isme thodi limitation hai (kuch features jaise camera permission manually enable
karni padti hai), lekin computer ki zaroorat nahi padti.

---

## Method C: GitHub Actions se android/ folder generate + commit karna

Agar aap chahte hain ki `android/` folder (Gradle project) aapke GitHub repo mein
real files ke roop mein committed rahe (Codemagic mein baar-baar generate karne
ke bajaye), to `.github/workflows/generate-android.yml` isi kaam ke liye hai.

**Kaise chalayein:**
1. GitHub repo mein `.github/workflows/generate-android.yml` file already maujood hai
2. GitHub pe apne repo ke "Actions" tab pe jaayein
3. "Generate Android Project" workflow select karein
4. "Run workflow" button dabayein (manual trigger)
5. 2-3 minute mein yeh khud:
   - `npm install` + `npm run build` chalata hai
   - `npx cap add android` se Gradle project banata hai
   - `android/` folder ko seedha commit + push kar deta hai aapke repo mein

Iske baad `android/` folder GitHub pe dikhne lagega — real `build.gradle`,
`gradlew`, `AndroidManifest.xml` sab kuch. Ab Codemagic bhi tez chalega
kyunki usse `cap add android` dobara nahi karna padega.

**Note:** Yeh workflow `package.json` ya `capacitor.config.json` badalne par
khud bhi chal jaata hai (auto-trigger), taaki android/ folder hamesha up-to-date rahe.

---

## Important note


- App ka naam/icon/package id (`com.aunap.ridego`) `capacitor.config.json` file mein
  change kar sakte ho
- Photo upload feature ab **localStorage** use karta hai (real phone storage), Claude
  artifact wale `window.storage` API ki jagah — yeh already is code mein fix kiya hua hai
- Voice guide (speechSynthesis) Android WebView mein kaam karta hai, lekin kuch purane
  Android versions mein Hindi/Bengali awaaz available na ho to English mein bol sakta hai
