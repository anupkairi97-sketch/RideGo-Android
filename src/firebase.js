
import { initializeApp } from "firebase/app";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  getFirestore, collection, addDoc, doc, getDoc, getDocs, setDoc, onSnapshot, updateDoc,
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
export async function sendPushNotification(token, title, message) {
  if (!token) return;
  try {
    const res = await fetch(FCM_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, title, body: message }),
    });
    if (!res.ok) {
      console.error("sendPushNotification failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("sendPushNotification error:", e);
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
    await sendPushNotification(passenger.fcmToken, title, message);
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
    await sendPushNotification(drv.fcmToken, title, message);
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
      if (token) sends.push(sendPushNotification(token, title, message));
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
