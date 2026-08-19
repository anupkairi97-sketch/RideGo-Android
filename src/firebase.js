import { initializeApp } from "firebase/app";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  getFirestore, collection, addDoc, doc, getDoc, getDocs, setDoc, onSnapshot, updateDoc, deleteDoc,
  query, where, limit, orderBy, serverTimestamp, runTransaction,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBaEBZn9-uTCnASTpKBf5j04WHwWPq5tUA",
  authDomain: "ridego-da1e6.firebaseapp.com",
  projectId: "ridego-da1e6",
  storageBucket: "ridego-da1e6.firebasestorage.app",
  messagingSenderId: "427118307731",
  appId: "1:427118307731:web:b9809c5e3af3297ceea066",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const FCM_WORKER_URL = "https://ridego-fcm-0c6a.aunapkairi.workers.dev/";

/* ------------------------------------------------------------------ */
/*  Real OTP via Fast2SMS (through a Cloudflare Worker — same pattern  */
/*  as FCM_WORKER_URL, so the Fast2SMS API key never sits in app code) */
/*  Fill in OTP_WORKER_URL once that Worker is deployed. Until then,   */
/*  sendCustomOtp/verifyCustomOtp exist but will fail at the fetch     */
/*  step — the rest of the app is unaffected.                         */
/* ------------------------------------------------------------------ */
const OTP_WORKER_URL = "https://fragrant-morning-0a45.aunapkairi.workers.dev/";

// Generates a 4-digit code, stores it in Firestore for 5 minutes, and
// asks the Worker to text it to the user via Fast2SMS.
export async function sendCustomOtp(mobile10Digit) {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = Date.now() + 5 * 60 * 1000;
  await setDoc(doc(db, "otpCodes", mobile10Digit), {
    code, expiresAt, attempts: 0, createdAt: serverTimestamp(),
  });
  const res = await fetch(OTP_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: mobile10Digit, otp: code }),
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("sendCustomOtp failed:", res.status, bodyText);
    throw new Error("Could not send OTP. Please try again.");
  }
}

// Verifies the user-entered code against Firestore. Throws a clear,
// user-facing message on any failure (expired / wrong / too many tries).
export async function verifyCustomOtp(mobile10Digit, enteredCode) {
  const ref = doc(db, "otpCodes", mobile10Digit);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("No OTP was sent to this number. Please request a new one.");
  const data = snap.data();
  if (Date.now() > data.expiresAt) {
    await deleteDoc(ref).catch(() => {});
    throw new Error("This OTP has expired. Please request a new one.");
  }
  if ((data.attempts || 0) >= 5) {
    await deleteDoc(ref).catch(() => {});
    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }
  if (data.code !== enteredCode) {
    await updateDoc(ref, { attempts: (data.attempts || 0) + 1 }).catch(() => {});
    throw new Error("Incorrect OTP. Please try again.");
  }
  await deleteDoc(ref).catch(() => {});
  return true;
}

export async function sendPhoneOtpNative(mobile10Digit) {
  const fullNumber = "+91" + mobile10Digit;

  return new Promise((resolve, reject) => {
    let handled = false;

    FirebaseAuthentication.addListener("phoneCodeSent", (event) => {
      if (handled) return;
      handled = true;
      resolve(event.verificationId);
    });

    FirebaseAuthentication.addListener("phoneVerificationFailed", (event) => {
      if (handled) return;
      handled = true;
      reject(new Error(event.message || "OTP send failed"));
    });

    FirebaseAuthentication.signInWithPhoneNumber({
      phoneNumber: fullNumber,
    }).catch((e) => {
      if (!handled) {
        handled = true;
        reject(e);
      }
    });
  });
}

export async function verifyPhoneOtpNative(verificationId, code) {
  const result = await FirebaseAuthentication.confirmVerificationCode({
    verificationId,
    verificationCode: code,
  });

  return result.user;
}

/* ------------------------------ Passenger / Driver profiles ------------------------------ */
// Uses the mobile number as the document ID (10-digit, no country code) since
// registration currently runs on the demo OTP flow and has no Firebase Auth uid yet.
// Safe to call again on re-registration — it merges instead of overwriting.
export async function savePassenger(mobile10Digit, data) {
  await setDoc(
    doc(db, "passengers", mobile10Digit),
    { mobile: mobile10Digit, ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function saveDriver(mobile10Digit, data) {
  await setDoc(
    doc(db, "drivers", mobile10Digit),
    { mobile: mobile10Digit, ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Used to restore a saved session on app launch (read the profile back by mobile number).
export async function getPassenger(mobile10Digit) {
  const snap = await getDoc(doc(db, "passengers", mobile10Digit));
  return snap.exists() ? snap.data() : null;
}

export async function getDriver(mobile10Digit) {
  const snap = await getDoc(doc(db, "drivers", mobile10Digit));
  return snap.exists() ? snap.data() : null;
}

/* ------------------------------------------------------------------ */
/*  Push Notifications (FCM via Cloudflare Worker)                    */
/*  No Firebase Cloud Functions / Blaze plan needed — the Worker      */
/*  holds the service-account credentials and calls the FCM HTTP v1   */
/*  API. This file only ever sends the target token + message to it.  */
/* ------------------------------------------------------------------ */

// Low-level: send one push to one FCM token via the Cloudflare Worker.
// Never throws — a failed/missing push should never break a ride action.
// Retries once on a transient (5xx/network) failure, and reports back
// whether the token itself looks dead (so callers can clean it up).
export async function sendPushNotification(token, title, message) {
  if (!token) return { ok: false, invalidToken: false };
  const attempt = () =>
    fetch(FCM_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, title, body: message }),
    });
  try {
    let res = await attempt();
    if (!res.ok && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1200));
      res = await attempt();
    }
    if (res.ok) return { ok: true, invalidToken: false };

    const bodyText = await res.text().catch(() => "");
    const invalidToken =
      res.status === 404 ||
      res.status === 400 ||
      /unregistered|invalid.?registration|not.?found/i.test(bodyText);
    console.error("sendPushNotification failed:", res.status, bodyText);
    return { ok: false, invalidToken };
  } catch (e) {
    console.error("sendPushNotification error:", e);
    return { ok: false, invalidToken: false };
  }
}

// Looks up the ride's passenger (via rideRequests/{rideId}.mobile -> passengers/{mobile}.fcmToken)
// and sends them a push. Used after accept / arrived / start / complete.
export async function notifyPassenger(rideId, title, message) {
  try {
    const rideSnap = await getDoc(doc(db, "rideRequests", rideId));
    if (!rideSnap.exists()) return;
    const mobile = rideSnap.data().mobile;
    if (!mobile) return;
    const passenger = await getPassenger(mobile);
    if (!passenger?.fcmToken) return;
    const result = await sendPushNotification(passenger.fcmToken, title, message);
    if (result?.invalidToken) {
      await savePassenger(mobile, { fcmToken: null }).catch(() => {});
      console.warn(`Cleared stale FCM token for passenger ${mobile}`);
    }
  } catch (e) {
    console.error("notifyPassenger failed:", e);
  }
}

// Mirrors notifyPassenger: looks up the ride's assigned driver
// (rideRequests/{rideId}.driverMobile -> drivers/{mobile}.fcmToken) and sends them a push.
export async function notifyDriver(rideId, title, message) {
  try {
    const rideSnap = await getDoc(doc(db, "rideRequests", rideId));
    if (!rideSnap.exists()) return;
    const driverMobile = rideSnap.data().driverMobile;
    if (!driverMobile) return;
    const drv = await getDriver(driverMobile);
    if (!drv?.fcmToken) return;
    const result = await sendPushNotification(drv.fcmToken, title, message);
    if (result?.invalidToken) {
      await saveDriver(driverMobile, { fcmToken: null }).catch(() => {});
      console.warn(`Cleared stale FCM token for driver ${driverMobile}`);
    }
  } catch (e) {
    console.error("notifyDriver failed:", e);
  }
}

// Sends a push to every driver currently marked online (drivers/{mobile}.online == true).
// Used after a passenger creates a new ride request.
export async function notifyNearbyDrivers(title, message) {
  try {
    const q = query(collection(db, "drivers"), where("online", "==", true));
    const snap = await getDocs(q);
    const sends = [];
    snap.forEach((d) => {
      const token = d.data()?.fcmToken;
      if (!token) return;
      sends.push(
        sendPushNotification(token, title, message).then((result) => {
          if (result?.invalidToken) {
            return saveDriver(d.id, { fcmToken: null }).catch(() => {});
          }
        })
      );
    });
    await Promise.all(sends);
  } catch (e) {
    console.error("notifyNearbyDrivers failed:", e);
  }
}

export async function createRideRequest(data) {
  const docRef = await addDoc(collection(db, "rideRequests"), {
    ...data, status: "searching",
    driverName: null, driverPlate: null, driverRating: null, driverMobile: null, driverPhoto: null,
    createdAt: serverTimestamp(),
  });
  notifyNearbyDrivers("New Ride Request", `Pickup: ${data.pickup || "Nearby"} → ${data.drop || "Drop"}`);
  return docRef.id;
}

export function watchRide(rideId, callback) {
  return onSnapshot(
    doc(db, "rideRequests", rideId),
    (snap) => {
      try {
        callback(snap.exists() ? snap.data() : null);
      } catch (err) {
        console.error("watchRide callback crashed:", err);
      }
    },
    (err) => {
      console.error("watchRide Firestore error:", err);
    }
  );
}

export function watchSearchingRequests(callback) {
  const q = query(
    collection(db, "rideRequests"),
    where("status", "==", "searching"),
    orderBy("createdAt", "asc"),
    limit(1)
  );

  return onSnapshot(
    q,
    (snap) => {
      try {
        if (snap.empty) {
          callback(null);
          return;
        }

        const d = snap.docs[0];
        callback({ id: d.id, ...d.data() });
      } catch (err) {
        console.error("watchSearchingRequests callback crashed:", err);
      }
    },
    (err) => {
      console.error("watchSearchingRequests Firestore error:", err);
    }
  );
}


// Uses a Firestore transaction so that if two drivers hit "Accept" on the
// same ride at nearly the same instant, only the first one actually wins —
// the second gets a clear error instead of silently overwriting the first.
export async function acceptRide(rideId, driverInfo) {
  const rideRef = doc(db, "rideRequests", rideId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(rideRef);
    if (!snap.exists()) throw new Error("This ride no longer exists.");
    if (snap.data().status !== "searching") {
      throw new Error("This ride was just accepted by another driver.");
    }
    tx.update(rideRef, {
      status: "accepted", driverName: driverInfo.name, driverPlate: driverInfo.plate,
      driverRating: driverInfo.rating, driverMobile: driverInfo.mobile, driverPhoto: driverInfo.photo || null,
      driverVehicleName: driverInfo.vehicleName || null,
    });
  });
  notifyPassenger(rideId, "Driver Accepted", `${driverInfo.name || "Your driver"} is on the way!`);
}
export async function markArrived(rideId) {
  await updateDoc(doc(db, "rideRequests", rideId), { status: "arrived" });
  notifyPassenger(rideId, "Driver Arrived", "Your driver has arrived at the pickup point.");
}
export async function startTrip(rideId) {
  await updateDoc(doc(db, "rideRequests", rideId), { status: "ontrip" });
  notifyPassenger(rideId, "Trip Started", "Your trip has started. Enjoy your ride!");
}
export async function completeRide(rideId) {
  await updateDoc(doc(db, "rideRequests", rideId), { status: "completed" });
  notifyPassenger(rideId, "Trip Completed", "You have reached your destination. Thanks for riding with RideGo!");
}
// cancelledBy: "passenger" or "driver" — notifies whichever side didn't cancel.
export async function cancelRide(rideId, cancelledBy) {
  await updateDoc(doc(db, "rideRequests", rideId), { status: "cancelled", cancelledBy: cancelledBy || null });
  if (cancelledBy === "passenger") {
    notifyDriver(rideId, "Ride Cancelled", "The passenger has cancelled this ride.");
  } else if (cancelledBy === "driver") {
    notifyPassenger(rideId, "Ride Cancelled", "Your driver had to cancel. Please try booking again.");
  }
}
export async function updateDriverLocation(rideId, lat, lng) {
  await updateDoc(doc(db, "rideRequests", rideId), {
    driverLocation: {
      lat,
      lng,
      updatedAt: serverTimestamp(),
    },
  });
}
