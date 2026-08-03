import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  getFirestore, collection, addDoc, doc, onSnapshot, updateDoc,
  query, where, limit, serverTimestamp,
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
export const auth = getAuth(app);

let recaptchaVerifier = null;

function getRecaptcha(containerId) {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
}

export async function sendPhoneOtp(mobile10Digit, containerId) {
  const verifier = getRecaptcha(containerId);
  const fullNumber = "+91" + mobile10Digit;
  return signInWithPhoneNumber(auth, fullNumber, verifier);
}

export async function verifyPhoneOtp(confirmationResult, code) {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

export async function createRideRequest(data) {
  const docRef = await addDoc(collection(db, "rideRequests"), {
    ...data, status: "searching",
    driverName: null, driverPlate: null, driverRating: null, driverMobile: null, driverPhoto: null,
    createdAt: serverTimestamp(),
  });
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


export async function acceptRide(rideId, driverInfo) {
  await updateDoc(doc(db, "rideRequests", rideId), {
    status: "accepted", driverName: driverInfo.name, driverPlate: driverInfo.plate,
    driverRating: driverInfo.rating, driverMobile: driverInfo.mobile, driverPhoto: driverInfo.photo || null,
  });
}
export async function markArrived(rideId) { await updateDoc(doc(db, "rideRequests", rideId), { status: "arrived" }); }
export async function startTrip(rideId) { await updateDoc(doc(db, "rideRequests", rideId), { status: "ontrip" }); }
export async function completeRide(rideId) { await updateDoc(doc(db, "rideRequests", rideId), { status: "completed" }); }
export async function updateDriverLocation(rideId, lat, lng) {
  await updateDoc(doc(db, "rideRequests", rideId), {
    driverLocation: {
      lat,
      lng,
      updatedAt: serverTimestamp(),
    },
  });
}
