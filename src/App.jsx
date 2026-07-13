import React, { useState, useEffect, useRef, createContext, useContext, useCallback, memo } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import "leaflet/dist/leaflet.css";
import {
  Phone, ShieldCheck, MapPin, Search, Bike, CarTaxiFront, Zap, Car, Truck,
  Clock, Star, Wallet, Banknote, Bell, Sun, Moon, Globe, Volume2,
  AlertTriangle, ChevronRight, ChevronLeft, X, Check, User, History,
  Home as HomeIcon, LogOut, MessageCircle, Navigation2, CreditCard, Edit3,
  ShieldAlert, PhoneCall, Loader2, Camera, Image as ImageIcon, Power, TrendingUp, Award,
  Package, MapPinned, Flag, ArrowLeftRight, Car as CarIcon, Accessibility, Sparkles, Download,
  Menu, Gift, Share2, MoreHorizontal, Headphones, CheckCircle2, Mail, Briefcase,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  RideGo — Combined Passenger + Driver App (Premium Edition)         */
/*  Frontend-only demo. Photos persist via artifact key-value storage. */
/* ------------------------------------------------------------------ */

const T = {
  en: {
    appName: "RideGo", tagline: "Go anywhere, easy.",
    mobileLabel: "Mobile number", sendOtp: "Send OTP",
    otpTitle: "Verify your number", otpSubtitle: "code sent to",
    verify: "Verify & continue", resend: "Resend code",
    regTitle: "Create your account", fullName: "Full name", email: "Email (optional)",
    createAccount: "Create account", welcomeBack: "Welcome back",
    whereTo: "Where to?", pickup: "Pickup location", drop: "Drop location",
    useCurrent: "Use current location", locating: "Finding your location…",
    chooseRide: "Choose a ride", estFare: "Estimated fare", eta: "arrives in",
    bookRide: "Book ride", searching: "Finding your driver…",
    driverFound: "Driver is on the way", cancelRide: "Cancel ride",
    sos: "SOS", home: "Home", activity: "Activity", profile: "Profile",
    rideHistory: "Ride history", noRides: "No rides yet — book your first one!",
    darkMode: "Dark mode", language: "Language", voiceGuide: "Voice guide",
    paymentMethods: "Payment methods", support: "24/7 support", logout: "Log out",
    cash: "Cash", upi: "UPI", walletLabel: "Wallet", card: "Card",
    rideConfirmed: "Ride confirmed", otpForRide: "Ride OTP",
    sosTitle: "Emergency SOS", sosBody: "This will alert your emergency contacts and share your live location.",
    sosConfirm: "Send SOS alert", sosCancel: "Not now", sosSent: "SOS alert sent to your contacts",
    ratingPrompt: "Rate your ride", submitRating: "Submit", skip: "Skip",
    tripCompletedTitle: "Trip completed", tripIdLabel: "Trip ID", downloadBill: "Download bill",
    paymentMethodLabel: "Payment method", pickupLocation: "Pickup location", dropLocation: "Drop location",
    hello: "Hello", whereGoingToday: "Where are you going today?", addStop: "Add Stop",
    chooseVehicle: "Choose a Vehicle", seeAll: "See All", minAway: "min away",
    rideNow: "Ride Now", quickRide: "Quick Ride", rideLater: "Ride Later", scheduleRide: "Schedule Ride",
    shareRide: "Share Ride", saveMore: "Save More", offersForYou: "Offers for you",
    offerBanner: "FLAT 20% OFF on your first 3 rides", bookings: "Bookings",
    driverOnWay: "Driver is on the way", arrivingIn: "Arriving in", shareLiveLocation: "Share Live Location",
    fareDetails: "Fare Details", onTrip: "On Trip", enjoyRide: "Enjoy your ride",
    callDriverLabel: "Call Driver", chat: "Chat", share: "Share", more: "More",
    totalFare: "Total Fare", change: "Change",
    wallet: "Wallet", walletBalance: "Wallet balance", addMoney: "Add money",
    about: "About", vehicleDetails: "Vehicle Details", yourStats: "Your Stats", documents: "Documents",
    totalRides: "Total Rides", rating: "Rating", completion: "Completion",
    drivingLicense: "Driving License", rcDocument: "RC Document", verified: "Verified",
    goOffline: "Go Offline", goOnline: "Go Online", help: "Help", experience: "Experience",
    editProfile: "Edit profile", capacity: "seats", switchRole: "Switch role",
    easyMode: "Easy mode", easyModeDesc: "Bigger buttons, bigger text, voice on every screen",
    rideAnnouncements: "Ride announcements", changePhoto: "Change photo",
    takePhoto: "Camera", chooseGallery: "Gallery", photoSaved: "Photo saved",
    voiceNewRequest: "New Ride Request.", voicePickup: "Pickup", voiceDestination: "Destination",
    voiceDistance: "Distance", voiceEta: "Estimated Time", voiceFare: "Fare", voiceVehicle: "Vehicle type",
    rideBookedVoice: "Ride booked successfully.", driverOnWayVoice: "Driver is on the way.",
    driverArrivedVoice: "Driver has arrived.", tripStartedVoice: "Trip started.",
    tripCompletedVoice: "Trip completed.", paymentSuccessVoice: "Payment successful.",
    minutes: "minutes",
    otpVoice: "Enter the 4 digit code sent to your number, then press the green Verify button.", registerVoice: "Type your full name in the box, then press the green Create Account button.",
    homeVoice: "Tap the first box to enter your pickup place, tap the second box for your drop place, then press the green Choose a Ride button.", chooseRideVoice: "Tap a vehicle to select it, then press the green Book Ride button at the bottom.",
    historyVoice: "This is your ride history.", profileVoice: "This is your profile screen.",
    driverLoginVoice: "Enter your mobile number to continue.", driverOtpVoice: "Enter the 4 digit verification code.",
    driverRegisterVoice: "Add your photo, name, vehicle number and vehicle type.",
    driverHomeVoice: "Go online to start receiving ride requests.", driverEarningsVoice: "Here are your earnings and recent trips.",
    loginVoice: "Type your mobile number in the box, then press the green Send OTP button.",
    ratingVoice: "Tap the stars to rate your trip, then press the green Submit button.",
    driverAcceptRejectVoice: "Press the green Accept button to take this ride, or the red Reject button to skip it.",
  },
  hi: {
    appName: "RideGo", tagline: "कहीं भी जाएं, आसानी से।",
    mobileLabel: "मोबाइल नंबर", sendOtp: "OTP भेजें",
    otpTitle: "अपना नंबर सत्यापित करें", otpSubtitle: "कोड भेजा गया",
    verify: "सत्यापित करें", resend: "कोड फिर भेजें",
    regTitle: "अपना खाता बनाएं", fullName: "पूरा नाम", email: "ईमेल (वैकल्पिक)",
    createAccount: "खाता बनाएं", welcomeBack: "वापसी पर स्वागत है",
    whereTo: "कहाँ जाना है?", pickup: "पिकअप स्थान", drop: "ड्रॉप स्थान",
    useCurrent: "वर्तमान स्थान का उपयोग करें", locating: "स्थान खोजा जा रहा है…",
    chooseRide: "सवारी चुनें", estFare: "अनुमानित किराया", eta: "में पहुंचेगा",
    bookRide: "बुक करें", searching: "ड्राइवर खोजा जा रहा है…",
    driverFound: "ड्राइवर आ रहा है", cancelRide: "सवारी रद्द करें",
    sos: "SOS", home: "होम", activity: "गतिविधि", profile: "प्रोफ़ाइल",
    rideHistory: "सवारी इतिहास", noRides: "अभी तक कोई सवारी नहीं — पहली बुक करें!",
    darkMode: "डार्क मोड", language: "भाषा", voiceGuide: "वॉइस गाइड",
    paymentMethods: "भुगतान के तरीके", support: "24/7 सहायता", logout: "लॉग आउट",
    cash: "नकद", upi: "UPI", walletLabel: "वॉलेट", card: "कार्ड",
    rideConfirmed: "सवारी पक्की", otpForRide: "सवारी OTP",
    sosTitle: "आपातकालीन SOS", sosBody: "यह आपके आपातकालीन संपर्कों को सूचित करेगा और आपका स्थान साझा करेगा।",
    sosConfirm: "SOS भेजें", sosCancel: "अभी नहीं", sosSent: "SOS अलर्ट भेज दिया गया",
    ratingPrompt: "अपनी सवारी को रेट करें", submitRating: "जमा करें", skip: "छोड़ें",
    tripCompletedTitle: "यात्रा पूरी हुई", tripIdLabel: "ट्रिप ID", downloadBill: "बिल डाउनलोड करें",
    paymentMethodLabel: "भुगतान का तरीका", pickupLocation: "पिकअप स्थान", dropLocation: "ड्रॉप स्थान",
    hello: "नमस्ते", whereGoingToday: "आज कहाँ जाना है?", addStop: "स्टॉप जोड़ें",
    chooseVehicle: "वाहन चुनें", seeAll: "सभी देखें", minAway: "मिनट दूर",
    rideNow: "अभी सवारी करें", quickRide: "त्वरित सवारी", rideLater: "बाद में सवारी", scheduleRide: "सवारी शेड्यूल करें",
    shareRide: "सवारी साझा करें", saveMore: "और बचाएं", offersForYou: "आपके लिए ऑफर",
    offerBanner: "पहली 3 सवारी पर फ्लैट 20% छूट", bookings: "बुकिंग",
    driverOnWay: "ड्राइवर आ रहा है", arrivingIn: "पहुंचने में", shareLiveLocation: "लाइव लोकेशन साझा करें",
    fareDetails: "किराया विवरण", onTrip: "यात्रा जारी", enjoyRide: "अपनी सवारी का आनंद लें",
    callDriverLabel: "ड्राइवर को कॉल करें", chat: "चैट", share: "साझा करें", more: "और",
    totalFare: "कुल किराया", change: "बदलें",
    wallet: "वॉलेट", walletBalance: "वॉलेट बैलेंस", addMoney: "पैसे जोड़ें",
    about: "जानकारी", vehicleDetails: "वाहन विवरण", yourStats: "आपके आंकड़े", documents: "दस्तावेज़",
    totalRides: "कुल सवारी", rating: "रेटिंग", completion: "पूर्णता",
    drivingLicense: "ड्राइविंग लाइसेंस", rcDocument: "RC दस्तावेज़", verified: "सत्यापित",
    goOffline: "ऑफलाइन जाएं", goOnline: "ऑनलाइन जाएं", help: "मदद", experience: "अनुभव",
    editProfile: "प्रोफ़ाइल संपादित करें", capacity: "सीटें", switchRole: "भूमिका बदलें",
    easyMode: "आसान मोड", easyModeDesc: "बड़े बटन, बड़ा टेक्स्ट, हर स्क्रीन पर आवाज़",
    rideAnnouncements: "सवारी सूचनाएं", changePhoto: "फोटो बदलें",
    takePhoto: "कैमरा", chooseGallery: "गैलरी", photoSaved: "फोटो सहेजी गई",
    voiceNewRequest: "नई सवारी का अनुरोध।", voicePickup: "पिकअप", voiceDestination: "गंतव्य",
    voiceDistance: "दूरी", voiceEta: "अनुमानित समय", voiceFare: "किराया", voiceVehicle: "वाहन प्रकार",
    rideBookedVoice: "सवारी सफलतापूर्वक बुक हुई।", driverOnWayVoice: "ड्राइवर आपकी ओर आ रहा है।",
    driverArrivedVoice: "ड्राइवर पहुंच गया है।", tripStartedVoice: "यात्रा शुरू हुई।",
    tripCompletedVoice: "यात्रा पूरी हुई।", paymentSuccessVoice: "भुगतान सफल रहा।",
    minutes: "मिनट",
    otpVoice: "अपने नंबर पर भेजा गया 4 अंकों का कोड डालें, फिर हरा 'सत्यापित करें' बटन दबाएं।", registerVoice: "बॉक्स में अपना पूरा नाम लिखें, फिर हरा 'खाता बनाएं' बटन दबाएं।",
    homeVoice: "पहले बॉक्स में पिकअप जगह डालें, दूसरे बॉक्स में ड्रॉप जगह डालें, फिर हरा 'सवारी चुनें' बटन दबाएं।", chooseRideVoice: "किसी गाड़ी पर टैप करके चुनें, फिर नीचे हरा 'बुक करें' बटन दबाएं।",
    historyVoice: "यह आपकी सवारी इतिहास है।", profileVoice: "यह आपकी प्रोफ़ाइल स्क्रीन है।",
    driverLoginVoice: "जारी रखने के लिए अपना मोबाइल नंबर दर्ज करें।", driverOtpVoice: "4 अंकों का सत्यापन कोड दर्ज करें।",
    driverRegisterVoice: "अपनी फोटो, नाम, वाहन नंबर और वाहन प्रकार जोड़ें।",
    driverHomeVoice: "सवारी अनुरोध पाने के लिए ऑनलाइन जाएं।", driverEarningsVoice: "यह रही आपकी कमाई और हाल की यात्राएं।",
    loginVoice: "बॉक्स में अपना मोबाइल नंबर लिखें, फिर हरा 'OTP भेजें' बटन दबाएं।",
    ratingVoice: "सितारों पर टैप करके सवारी को रेट करें, फिर हरा 'जमा करें' बटन दबाएं।",
    driverAcceptRejectVoice: "यह सवारी लेने के लिए हरा 'Accept' बटन दबाएं, या छोड़ने के लिए लाल 'Reject' बटन दबाएं।",
  },
  bn: {
    appName: "RideGo", tagline: "যেকোনো জায়গায় যান, সহজে।",
    mobileLabel: "মোবাইল নম্বর", sendOtp: "OTP পাঠান",
    otpTitle: "আপনার নম্বর যাচাই করুন", otpSubtitle: "কোড পাঠানো হয়েছে",
    verify: "যাচাই করুন", resend: "আবার পাঠান",
    regTitle: "অ্যাকাউন্ট তৈরি করুন", fullName: "পুরো নাম", email: "ইমেইল (ঐচ্ছিক)",
    createAccount: "অ্যাকাউন্ট তৈরি করুন", welcomeBack: "স্বাগতম",
    whereTo: "কোথায় যাবেন?", pickup: "পিকআপ স্থান", drop: "ড্রপ স্থান",
    useCurrent: "বর্তমান অবস্থান ব্যবহার করুন", locating: "অবস্থান খোঁজা হচ্ছে…",
    chooseRide: "রাইড বেছে নিন", estFare: "আনুমানিক ভাড়া", eta: "এ পৌঁছাবে",
    bookRide: "বুক করুন", searching: "ড্রাইভার খোঁজা হচ্ছে…",
    driverFound: "ড্রাইভার আসছেন", cancelRide: "রাইড বাতিল করুন",
    sos: "SOS", home: "হোম", activity: "কার্যকলাপ", profile: "প্রোফাইল",
    rideHistory: "রাইড ইতিহাস", noRides: "এখনও কোনো রাইড নেই — প্রথমটি বুক করুন!",
    darkMode: "ডার্ক মোড", language: "ভাষা", voiceGuide: "ভয়েস গাইড",
    paymentMethods: "পেমেন্ট পদ্ধতি", support: "24/7 সহায়তা", logout: "লগ আউট",
    cash: "নগদ", upi: "UPI", walletLabel: "ওয়ালেট", card: "কার্ড",
    rideConfirmed: "রাইড নিশ্চিত হয়েছে", otpForRide: "রাইড OTP",
    sosTitle: "জরুরি SOS", sosBody: "এটি আপনার জরুরি পরিচিতিদের সতর্ক করবে এবং লাইভ অবস্থান শেয়ার করবে।",
    sosConfirm: "SOS পাঠান", sosCancel: "এখন নয়", sosSent: "SOS সতর্কতা পাঠানো হয়েছে",
    ratingPrompt: "আপনার রাইড রেট করুন", submitRating: "জমা দিন", skip: "এড়িয়ে যান",
    tripCompletedTitle: "যাত্রা সম্পন্ন হয়েছে", tripIdLabel: "ট্রিপ ID", downloadBill: "বিল ডাউনলোড করুন",
    paymentMethodLabel: "পেমেন্ট পদ্ধতি", pickupLocation: "পিকআপ স্থান", dropLocation: "ড্রপ স্থান",
    hello: "নমস্কার", whereGoingToday: "আজ কোথায় যাচ্ছেন?", addStop: "স্টপ যোগ করুন",
    chooseVehicle: "গাড়ি বেছে নিন", seeAll: "সব দেখুন", minAway: "মিনিট দূরে",
    rideNow: "এখনই রাইড করুন", quickRide: "দ্রুত রাইড", rideLater: "পরে রাইড", scheduleRide: "রাইড শিডিউল করুন",
    shareRide: "রাইড শেয়ার করুন", saveMore: "আরও সাশ্রয়", offersForYou: "আপনার জন্য অফার",
    offerBanner: "প্রথম 3 রাইডে ফ্ল্যাট 20% ছাড়", bookings: "বুকিং",
    driverOnWay: "ড্রাইভার আসছেন", arrivingIn: "পৌঁছাতে", shareLiveLocation: "লাইভ অবস্থান শেয়ার করুন",
    fareDetails: "ভাড়ার বিবরণ", onTrip: "যাত্রা চলছে", enjoyRide: "আপনার যাত্রা উপভোগ করুন",
    callDriverLabel: "ড্রাইভারকে কল করুন", chat: "চ্যাট", share: "শেয়ার", more: "আরও",
    totalFare: "মোট ভাড়া", change: "পরিবর্তন",
    wallet: "ওয়ালেট", walletBalance: "ওয়ালেট ব্যালেন্স", addMoney: "টাকা যোগ করুন",
    about: "সম্পর্কে", vehicleDetails: "গাড়ির বিবরণ", yourStats: "আপনার পরিসংখ্যান", documents: "নথি",
    totalRides: "মোট রাইড", rating: "রেটিং", completion: "সম্পন্ন",
    drivingLicense: "ড্রাইভিং লাইসেন্স", rcDocument: "RC নথি", verified: "যাচাইকৃত",
    goOffline: "অফলাইনে যান", goOnline: "অনলাইনে যান", help: "সাহায্য", experience: "অভিজ্ঞতা",
    editProfile: "প্রোফাইল সম্পাদনা করুন", capacity: "সিট", switchRole: "ভূমিকা পরিবর্তন করুন",
    easyMode: "সহজ মোড", easyModeDesc: "বড় বোতাম, বড় লেখা, প্রতিটি স্ক্রিনে ভয়েস",
    rideAnnouncements: "রাইড ঘোষণা", changePhoto: "ছবি পরিবর্তন করুন",
    takePhoto: "ক্যামেরা", chooseGallery: "গ্যালারি", photoSaved: "ছবি সংরক্ষিত হয়েছে",
    voiceNewRequest: "নতুন রাইড অনুরোধ।", voicePickup: "পিকআপ", voiceDestination: "গন্তব্য",
    voiceDistance: "দূরত্ব", voiceEta: "আনুমানিক সময়", voiceFare: "ভাড়া", voiceVehicle: "গাড়ির ধরন",
    rideBookedVoice: "রাইড সফলভাবে বুক হয়েছে।", driverOnWayVoice: "ড্রাইভার আসছেন।",
    driverArrivedVoice: "ড্রাইভার পৌঁছে গেছেন।", tripStartedVoice: "যাত্রা শুরু হয়েছে।",
    tripCompletedVoice: "যাত্রা সম্পন্ন হয়েছে।", paymentSuccessVoice: "পেমেন্ট সফল হয়েছে।",
    minutes: "মিনিট",
    otpVoice: "আপনার নম্বরে পাঠানো 4 সংখ্যার কোড লিখুন।", registerVoice: "অ্যাকাউন্ট তৈরি করতে আপনার পুরো নাম লিখুন।",
    homeVoice: "রাইড বুক করতে পিকআপ ও ড্রপ স্থান লিখুন।", chooseRideVoice: "আপনার রাইড ও পেমেন্ট পদ্ধতি বেছে নিন।",
    historyVoice: "এটি আপনার রাইড ইতিহাস।", profileVoice: "এটি আপনার প্রোফাইল স্ক্রিন।",
    driverLoginVoice: "চালিয়ে যেতে আপনার মোবাইল নম্বর লিখুন।", driverOtpVoice: "4 সংখ্যার যাচাইকরণ কোড লিখুন।",
    driverRegisterVoice: "আপনার ছবি, নাম, গাড়ির নম্বর ও ধরন যোগ করুন।",
    driverHomeVoice: "রাইড অনুরোধ পেতে অনলাইনে যান।", driverEarningsVoice: "এই আপনার আয় ও সাম্প্রতিক ট্রিপ।",
  },
};

const VEHICLES = [
  { id: "bike", name: "Bike", Icon: Bike, base: 25, perKm: 6, eta: 3, capacity: 1 },
  { id: "erick", name: "E-Rickshaw", Icon: Zap, base: 30, perKm: 8, eta: 6, capacity: 3 },
  { id: "auto", name: "Auto", Icon: CarTaxiFront, base: 35, perKm: 10, eta: 5, capacity: 3 },
  { id: "car", name: "Car", Icon: Car, base: 60, perKm: 14, eta: 4, capacity: 4 },
  { id: "truck", name: "Mini Truck", Icon: Truck, base: 120, perKm: 22, eta: 9, capacity: 2 },
];
const VEHICLE_TYPES = [
  { id: "erick", name: "Electric Tuk-Tuk", Icon: Zap, base: 15, perKm: 10 },
  { id: "auto", name: "Auto Rickshaw", Icon: CarTaxiFront, base: 20, perKm: 12 },
  { id: "bike", name: "Bike", Icon: Bike, base: 12, perKm: 7 },
  { id: "car", name: "Car", Icon: Car, base: 50, perKm: 18 },
  { id: "truck", name: "Mini Truck", Icon: Truck, base: 100, perKm: 25 },
];
const DRIVER_NAMES = ["Ramesh Kumar", "Anjali Das", "Suresh Yadav", "Fatima Begum", "Vikram Singh"];
const DISTANCE_KM = 6.4;

/* Real map: fallback center used only if GPS permission is denied/unavailable */
const FALLBACK_COORDS = [24.8000, 92.7900]; // approx. Lakhipur, Assam
const passengerMarkerIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 2px #2563EB;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const MOCK_REQUESTS = [
  { passenger: "Ritu Verma", mobile: "98765 43210", pickup: "Sector 12, Main Road", drop: "Railway Station", distanceKm: 4.5 },
  { passenger: "Aman Gupta", mobile: "91234 56780", pickup: "Lakhipur Chowk", drop: "Silchar Railway Station", distanceKm: 9.2 },
  { passenger: "Sneha Roy", mobile: "89012 34567", pickup: "Green Park", drop: "City Mall", distanceKm: 3.1 },
  { passenger: "Imran Khan", mobile: "97654 32109", pickup: "Bus Stand", drop: "Medical College", distanceKm: 6.0 },
];
function fareFor(v) { return Math.round(v.base + v.perKm * DISTANCE_KM); }

const VOICE_LANG = { en: "en-IN", hi: "hi-IN", bn: "bn-IN" };
async function speak(text, lang) {
  const langCode = VOICE_LANG[lang] || "en-IN";

  // Primary: native Android TTS via Capacitor plugin — reliable inside the real app.
  try {
    await TextToSpeech.speak({
      text,
      lang: langCode,
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0,
      category: "ambient",
    });
    return;
  } catch (e) { /* plugin unavailable (e.g. running in a plain browser) — fall through */ }

  // Fallback: browser Web Speech API — used only in web preview/dev, not reliable on Android WebView.
  try {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langCode;
    u.rate = 0.95;
    window.speechSynthesis?.speak(u);
  } catch (e) { /* speech synthesis unavailable — fail silently */ }
}

/* ------------------------- Photo persistence helpers -------------------------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}
async function savePhoto(key, base64) {
  try {
    if (window.storage?.set) { await window.storage.set(key, base64, false); return; }
  } catch (e) { /* fall through to localStorage */ }
  try { localStorage.setItem(key, base64); } catch (e) { /* storage unavailable */ }
}
async function loadPhoto(key) {
  try {
    if (window.storage?.get) {
      const res = await window.storage.get(key, false);
      if (res?.value) return res.value;
    }
  } catch (e) { /* fall through to localStorage */ }
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

/* ---------------------------- App Context ---------------------------- */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);
function useT() { const { lang } = useApp(); return T[lang]; }
function useVoiceGuide() {
  const { voiceGuide, lang, setLastSpoken } = useApp();
  return useCallback((text) => { if (voiceGuide) { speak(text, lang); setLastSpoken(text); } }, [voiceGuide, lang, setLastSpoken]);
}
function useAnnounce() {
  const { announceRequests, lang, setLastSpoken } = useApp();
  return useCallback((text) => { if (announceRequests) { speak(text, lang); setLastSpoken(text); } }, [announceRequests, lang, setLastSpoken]);
}

/* ------------------------------ Theme ------------------------------ */
const BASE_THEME = {
  light: { "--bg": "#F6F5F3", "--surface": "#FFFFFF", "--surface-2": "#F3F1EF", "--ink": "#181414", "--muted": "#726B68", "--border": "#EAE5E1", "--amber": "#F2A93B", "--red": "#E23D3D", "--shadow": "0 14px 34px -14px rgba(24,20,20,0.22)" },
  dark: { "--bg": "#100D0D", "--surface": "#1A1516", "--surface-2": "#221C1D", "--ink": "#F6F2F1", "--muted": "#9C9291", "--border": "#2E2626", "--amber": "#F2A93B", "--red": "#F16060", "--shadow": "0 14px 34px -14px rgba(0,0,0,0.65)" },
};
const ACCENTS = {
  brand: { c: "#0F8B4C", dark: "#0B6B3A", tint: "#E4F3EA", grad: "linear-gradient(135deg,#34D399 0%,#0F8B4C 55%,#0B6B3A 100%)" },
  passenger: { c: "#E11D48", dark: "#9F1239", tint: "#FDE7EC", grad: "linear-gradient(135deg,#FF6B81 0%,#E11D48 55%,#9F1239 100%)" },
  driver: { c: "#10B981", dark: "#0B6B3A", tint: "#E1F7EE", grad: "linear-gradient(135deg,#34D399 0%,#10B981 55%,#0B6B3A 100%)" },
  admin: { c: "#2563EB", dark: "#1D4ED8", tint: "#E6EEFE", grad: "linear-gradient(135deg,#60A5FA 0%,#2563EB 55%,#1D4ED8 100%)" },
};
function accentVars(role) {
  const a = ACCENTS[role] || ACCENTS.brand;
  return { "--accent": a.c, "--accent-dark": a.dark, "--accent-tint": a.tint, "--accent-grad": a.grad };
}

function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      * { box-sizing: border-box; }
      .rg-root { font-family: 'Inter', sans-serif; color: var(--ink); background: var(--bg); }
      .rg-display { font-family: 'Space Grotesk', sans-serif; }
      .rg-mono { font-family: 'IBM Plex Mono', monospace; }
      @keyframes rg-dash { to { stroke-dashoffset: 0; } }
      @keyframes rg-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      @keyframes rg-fadeup { from { opacity:0; transform: translateY(14px) scale(0.99);} to {opacity:1; transform: translateY(0) scale(1);} }
      @keyframes rg-slideup { from { transform: translateY(100%);} to { transform: translateY(0);} }
      @keyframes rg-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.18); } 50% { box-shadow: 0 0 0 12px rgba(0,0,0,0); } }
      @keyframes rg-shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
      .rg-anim-in { animation: rg-fadeup .38s cubic-bezier(.2,.8,.2,1) both; }
      .rg-sheet-in { animation: rg-slideup .32s cubic-bezier(.2,.8,.2,1) both; }
      input:focus, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      .rg-scroll::-webkit-scrollbar { width: 4px; }
      .rg-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      .rg-card { background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); }
      .rg-grad-card { background: var(--accent-grad); box-shadow: 0 16px 32px -12px var(--accent); }
      .rg-glow { animation: rg-pulse 2.2s infinite; }
      /* Easy / accessibility mode: bigger text, bigger tap targets, everywhere */
      .rg-easy button { padding-top: 1.05em !important; padding-bottom: 1.05em !important; font-size: 1.12em !important; min-height: 48px; }
      .rg-easy input { padding-top: 1.05em !important; padding-bottom: 1.05em !important; font-size: 1.12em !important; }
      .rg-easy .rg-display { font-size: 1.18em; }
      .rg-easy svg { transform: scale(1.25); }
      .rg-easy p, .rg-easy span { font-size: 1.08em; }
      .rg-easy .rg-scroll { scroll-behavior: smooth; }
    `}</style>
  );
}

/* ------------------------------ Primitives ----------------------------- */
const Btn = memo(function Btn({ children, variant = "primary", className = "", ...props }) {
  const base = "w-full rounded-2xl py-3.5 font-semibold text-[15px] transition-transform active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100";
  const styles = {
    primary: { background: "var(--accent-grad)", color: "#fff", boxShadow: "0 10px 24px -10px var(--accent)" },
    outline: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--border)" },
    ghost: { background: "var(--surface-2)", color: "var(--ink)" },
    danger: { background: "var(--red)", color: "#fff" },
  };
  return <button className={`${base} ${className}`} style={styles[variant]} {...props}>{children}</button>;
});

const Field = memo(function Field({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      {Icon && <Icon size={18} style={{ color: "var(--muted)" }} />}
      <input className="w-full bg-transparent outline-none text-[15px]" style={{ color: "var(--ink)" }} {...props} />
    </div>
  );
});

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <ChevronLeft size={18} />
          </button>
        )}
        {title && <h1 className="rg-display text-[19px] font-semibold">{title}</h1>}
      </div>
      {right}
    </div>
  );
}
function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className="w-11 h-6 rounded-full p-0.5 transition-colors shrink-0" style={{ background: on ? "var(--accent)" : "var(--border)" }}>
      <div className="w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}
const ProfileRow = memo(function ProfileRow({ icon: Icon, label, right }) {
  return (
    <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3"><Icon size={18} style={{ color: "var(--muted)" }} /><span className="text-[15px]">{label}</span></div>
      {right}
    </div>
  );
});
const RouteVisual = memo(function RouteVisual({ height = 150, compact }) {
  const [coords, setCoords] = useState(null);
  const [locError, setLocError] = useState(false);
  const mapHeight = compact ? 130 : height;

  useEffect(() => {
    if (!navigator.geolocation) { setLocError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.latitude, pos.coords.longitude]),
      () => setLocError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const center = coords || FALLBACK_COORDS;
  const ready = coords || locError;

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "var(--accent-tint)", height: mapHeight }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      )}
      {ready && (
        <MapContainer center={center} zoom={15} zoomControl={true} scrollWheelZoom={true} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={passengerMarkerIcon} />
        </MapContainer>
      )}
    </div>
  );
});

/* Avatar with camera/gallery upload + immediate preview + persistent save */
function PhotoUploader({ photo, onChange, storageKey, size = 96 }) {
  const t = useT();
  const camRef = useRef();
  const galRef = useRef();
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSaving(true);
    try {
      const base64 = await fileToBase64(f);
      onChange(base64);
      if (storageKey) await savePhoto(storageKey, base64);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{ width: size, height: size, background: "var(--accent-tint)", border: "2px solid var(--accent)" }}>
        {photo ? <img src={photo} alt="Profile" className="w-full h-full object-cover" /> : <Camera size={26} style={{ color: "var(--accent)" }} />}
        {saving && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
            <Loader2 size={20} className="animate-spin" color="#fff" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => camRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--accent-tint)", color: "var(--accent-dark)" }}>
          <Camera size={13} /> {t.takePhoto}
        </button>
        <button onClick={() => galRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
          <ImageIcon size={13} /> {t.chooseGallery}
        </button>
      </div>
      {savedFlash && <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: "var(--accent-dark)" }}><Check size={11} /> {t.photoSaved}</p>}
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      <input ref={galRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}

function ReplayVoiceButton() {
  const { voiceGuide, easyMode, lang, lastSpoken } = useApp();
  if (!(voiceGuide || easyMode) || !lastSpoken) return null;
  return (
    <button
      onClick={() => speak(lastSpoken, lang)}
      aria-label="Repeat voice guidance"
      className="absolute right-4 bottom-[92px] z-20 w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
      style={{ background: "var(--accent-grad)", boxShadow: "0 10px 24px -8px var(--accent)" }}>
      <Volume2 size={20} color="#fff" />
    </button>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error("RideGo crashed:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3" style={{ background: "var(--bg)", color: "var(--ink)" }}>
          <AlertTriangle size={32} style={{ color: "var(--red)" }} />
          <p className="font-semibold">Something went wrong.</p>
          <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent-grad)", color: "#fff" }}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


function RoleSelect() {
  const { setRole } = useApp();
  return (
    <div className="flex flex-col h-full px-6 rg-anim-in justify-center gap-5">
      <div className="text-center flex flex-col items-center gap-3 mb-2">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: ACCENTS.brand.grad, boxShadow: "0 14px 30px -10px rgba(15,139,76,0.55)" }}>
          <Navigation2 size={30} color="#fff" />
        </div>
        <h1 className="rg-display text-3xl font-bold">RideGo</h1>
        <p style={{ color: "var(--muted)" }} className="text-[15px]">How do you want to use RideGo?</p>
      </div>
      <button onClick={() => setRole("passenger")} className="flex items-center gap-4 rounded-3xl p-5 text-left rg-card" style={{ borderColor: ACCENTS.passenger.c, borderWidth: 1.5 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ACCENTS.passenger.grad }}>
          <User size={26} color="#fff" />
        </div>
        <div className="flex-1">
          <p className="rg-display font-bold text-lg">I'm a Passenger</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Book a ride and get going</p>
        </div>
        <ChevronRight size={20} style={{ color: ACCENTS.passenger.c }} />
      </button>
      <button onClick={() => setRole("driver")} className="flex items-center gap-4 rounded-3xl p-5 text-left rg-card" style={{ borderColor: ACCENTS.driver.c, borderWidth: 1.5 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ACCENTS.driver.grad }}>
          <CarIcon size={26} color="#fff" />
        </div>
        <div className="flex-1">
          <p className="rg-display font-bold text-lg">I'm a Driver</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Accept rides and earn</p>
        </div>
        <ChevronRight size={20} style={{ color: ACCENTS.driver.c }} />
      </button>
    </div>
  );
}
function SwitchRoleRow() {
  const { setRole } = useApp();
  const t = useT();
  return (
    <button onClick={() => setRole(null)} className="w-full flex items-center gap-3 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <ArrowLeftRight size={18} style={{ color: "var(--muted)" }} />
      <span className="text-[15px]">{t.switchRole}</span>
    </button>
  );
}
function EasyModeRow() {
  const t = useT();
  const { easyMode, setEasyMode, setVoiceGuide } = useApp();
  return (
    <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3">
        <Accessibility size={18} style={{ color: "var(--muted)" }} />
        <div>
          <p className="text-[15px]">{t.easyMode}</p>
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>{t.easyModeDesc}</p>
        </div>
      </div>
      <Toggle on={easyMode} onClick={() => { const next = !easyMode; setEasyMode(next); if (next) setVoiceGuide(true); }} />
    </div>
  );
}

/* ============================ PASSENGER FLOW ============================ */

function PLoginScreen({ go }) {
  const t = useT();
  const { lang, setLang, setRole } = useApp();
  const [mobile, setMobile] = useState("");
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.mobileLabel); }, []);
  return (
    <div className="flex flex-col h-full px-6 rg-anim-in">
      <TopBar onBack={() => setRole(null)} />
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-3 -mt-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: "var(--accent-grad)", boxShadow: "0 14px 30px -10px var(--accent)" }}>
          <Navigation2 size={30} color="#fff" />
        </div>
        <h1 className="rg-display text-3xl font-bold">{t.appName}</h1>
        <p style={{ color: "var(--muted)" }} className="text-[15px]">{t.tagline}</p>
      </div>
      <div className="pb-8 flex flex-col gap-3">
        <div className="flex gap-2 justify-center mb-1">
          {["en", "hi", "bn"].map((l) => (
            <button key={l} onClick={() => setLang(l)} className="px-3 py-1.5 rounded-full text-xs font-semibold rg-mono"
              style={{ background: lang === l ? "var(--accent)" : "var(--surface-2)", color: lang === l ? "#fff" : "var(--muted)" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t.mobileLabel}</label>
        <Field icon={Phone} type="tel" placeholder="98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} />
        <Btn disabled={mobile.length !== 10} onClick={() => go("otp", { mobile })}>{t.sendOtp} <ChevronRight size={17} /></Btn>
        <p className="text-center text-xs pt-1" style={{ color: "var(--muted)" }}>Free to use · Sab kuchh free hai 🎉</p>
      </div>
    </div>
  );
}

function POtpScreen({ go, params }) {
  const t = useT();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.otpVoice); }, []);
  const update = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };
  const complete = otp.every((d) => d !== "");
  return (
    <div className="flex flex-col h-full px-6 rg-anim-in">
      <TopBar onBack={() => go("login")} />
      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-tint)" }}><ShieldCheck size={26} style={{ color: "var(--accent)" }} /></div>
        <h2 className="rg-display text-2xl font-bold">{t.otpTitle}</h2>
        <p style={{ color: "var(--muted)" }} className="text-sm -mt-2">{t.otpSubtitle} +91 {params.mobile}</p>
        <div className="flex gap-3 mt-2">
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]} value={d} maxLength={1} inputMode="numeric" onChange={(e) => update(i, e.target.value)}
              className="w-14 h-14 text-center text-xl rg-mono font-semibold rounded-2xl" style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--ink)" }} />
          ))}
        </div>
        <p className="text-xs rg-mono" style={{ color: "var(--amber)" }}>Demo OTP: 1234</p>
        <button className="text-sm font-semibold text-left" style={{ color: "var(--accent)" }}>{t.resend}</button>
      </div>
      <div className="pb-8"><Btn disabled={!complete} onClick={() => go("register", params)}>{t.verify}</Btn></div>
    </div>
  );
}

function PRegisterScreen({ go, params }) {
  const t = useT();
  const { setUser } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const speakGuide = useVoiceGuide();
  useEffect(() => { loadPhoto("passenger:photo").then(setPhoto); speakGuide(t.registerVoice); }, []);
  return (
    <div className="flex flex-col h-full px-6 rg-anim-in">
      <TopBar onBack={() => go("otp", params)} title={t.regTitle} />
      <div className="flex-1 flex flex-col gap-3 pt-2 overflow-y-auto rg-scroll">
        <div className="py-2"><PhotoUploader photo={photo} onChange={setPhoto} storageKey="passenger:photo" /></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t.fullName}</label>
        <Field icon={User} placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: "var(--muted)" }}>{t.email}</label>
        <Field icon={MessageCircle} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="pb-8 pt-3">
        <Btn disabled={!name} onClick={() => { setUser({ name: name || "Priya Sharma", mobile: params.mobile, email, rating: 4.9, photo }); go("home"); }}>{t.createAccount}</Btn>
      </div>
    </div>
  );
}

function PHomeScreen({ go }) {
  const t = useT();
  const { user } = useApp();
  const [pickup, setPickup] = useState("Pailapool, Silchar");
  const [drop, setDrop] = useState("Hayat Hospital, Guwahati");
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.homeVoice); }, []);
  const firstName = (user?.name || "Rider").split(" ")[0];

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between shrink-0">
        <Menu size={22} />
        <h1 className="rg-display text-lg font-bold" style={{ color: "var(--accent)" }}>{t.appName}</h1>
        <Bell size={20} />
      </div>

      <div className="flex-1 overflow-y-auto rg-scroll px-5 pt-2 pb-4">
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: "var(--accent-grad)" }}>
          <div className="flex-1">
            <p className="text-white font-semibold text-[15px]">{t.hello}, {firstName} 👋</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>{t.whereGoingToday}</p>
          </div>
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-semibold rg-display shrink-0" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>
            {user?.photo ? <img src={user.photo} className="w-full h-full object-cover" alt="" /> : firstName[0]}
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-4 rg-card">
          <div className="flex items-start gap-2.5 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--accent)" }} />
            <div className="flex-1">
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>{t.pickupLocation}</p>
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-transparent outline-none text-sm font-semibold" />
            </div>
          </div>
          <div className="flex items-start gap-2.5 pt-3">
            <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--red)" }} />
            <div className="flex-1">
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>{t.dropLocation}</p>
              <input value={drop} onChange={(e) => setDrop(e.target.value)} className="w-full bg-transparent outline-none text-sm font-semibold" />
            </div>
          </div>
          <button className="text-xs font-semibold mt-3" style={{ color: "var(--red)" }}>+ {t.addStop}</button>
        </div>

        <div className="flex items-center justify-between mb-2.5">
          <h2 className="rg-display text-base font-semibold">{t.chooseVehicle}</h2>
          <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "var(--accent)" }}>{t.seeAll} <ChevronRight size={13} /></button>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {VEHICLES.map((v) => (
            <button key={v.id} onClick={() => go("vehicles", { pickup, drop, preselect: v.id })} className="flex items-center gap-3 rounded-2xl p-3 rg-card text-left">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-tint)" }}>
                <v.Icon size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{v.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{v.eta} {t.minAway}</p>
              </div>
              <p className="rg-mono font-bold text-sm">₹{fareFor(v)}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <button onClick={() => go("vehicles", { pickup, drop })} className="flex flex-col items-center gap-1.5 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <Zap size={18} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-semibold">{t.rideNow}</span>
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>{t.quickRide}</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <Clock size={18} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-semibold">{t.rideLater}</span>
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>{t.scheduleRide}</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <Share2 size={18} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-semibold">{t.shareRide}</span>
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>{t.saveMore}</span>
          </button>
        </div>

        <h3 className="rg-display text-sm font-semibold mb-2">{t.offersForYou}</h3>
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "var(--accent-grad)" }}>
          <p className="text-white font-semibold text-sm leading-snug max-w-[75%]">{t.offerBanner}</p>
          <Gift size={26} color="#fff" />
        </div>
      </div>
    </div>
  );
}

function PVehicleScreen({ go, params }) {
  const t = useT();
  const [selected, setSelected] = useState(VEHICLES[0].id);
  const [payment, setPayment] = useState("cash");
  const vehicle = VEHICLES.find((v) => v.id === selected);
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.chooseRideVoice); }, []);
  const payOptions = [
    { id: "cash", label: t.cash, Icon: Banknote }, { id: "upi", label: t.upi, Icon: Wallet },
    { id: "wallet", label: t.walletLabel, Icon: Wallet }, { id: "card", label: t.card, Icon: CreditCard },
  ];
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar onBack={() => go("home")} title={t.chooseRide} />
      <div className="px-6 pb-2 text-xs flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
        <MapPin size={12} /> {params.pickup} <ChevronRight size={11} /> {params.drop}
      </div>
      <div className="flex-1 overflow-y-auto rg-scroll px-6 pt-2 flex flex-col gap-2.5">
        {VEHICLES.map((v) => {
          const active = v.id === selected;
          return (
            <button key={v.id} onClick={() => setSelected(v.id)} className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-shadow"
              style={{ background: active ? "var(--accent-tint)" : "var(--surface)", border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, boxShadow: active ? "0 10px 22px -14px var(--accent)" : "none" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: active ? "var(--accent-grad)" : "var(--surface-2)" }}>
                <v.Icon size={22} style={{ color: active ? "#fff" : "var(--accent)" }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[15px]">{v.name}</p>
                <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><Clock size={11} /> {v.eta} min · {v.capacity} {t.capacity}</p>
              </div>
              <p className="rg-mono font-semibold text-[15px]">₹{fareFor(v)}</p>
            </button>
          );
        })}
        <h3 className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: "var(--muted)" }}>{t.paymentMethods}</h3>
        <div className="grid grid-cols-4 gap-2">
          {payOptions.map((p) => (
            <button key={p.id} onClick={() => setPayment(p.id)} className="flex flex-col items-center gap-1.5 rounded-xl py-3"
              style={{ background: payment === p.id ? "var(--accent-tint)" : "var(--surface-2)", border: `1px solid ${payment === p.id ? "var(--accent)" : "transparent"}` }}>
              <p.Icon size={17} style={{ color: payment === p.id ? "var(--accent)" : "var(--muted)" }} />
              <span className="text-[10px] font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 py-5 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm" style={{ color: "var(--muted)" }}>{t.estFare}</span>
          <span className="rg-display text-xl font-bold">₹{fareFor(vehicle)}</span>
        </div>
        <Btn onClick={() => go("searching", { ...params, vehicle, payment })}>{t.bookRide}</Btn>
      </div>
    </div>
  );
}

function PSearchingScreen({ go, params }) {
  const t = useT();
  const speakGuide = useVoiceGuide();
  useEffect(() => {
    speakGuide(t.rideBookedVoice);
    const id = setTimeout(() => {
      const driver = {
        name: DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)],
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        plate: `WB ${10 + Math.floor(Math.random() * 80)} ${["AB", "CD", "PQ"][Math.floor(Math.random() * 3)]} ${1000 + Math.floor(Math.random() * 8999)}`,
        otp: 1000 + Math.floor(Math.random() * 8999),
      };
      go("tracking", { ...params, driver });
    }, 2400);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="flex flex-col h-full items-center justify-center px-8 text-center rg-anim-in">
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full rg-glow" style={{ background: "var(--accent-tint)" }} />
        <params.vehicle.Icon size={34} style={{ color: "var(--accent)" }} />
      </div>
      <h2 className="rg-display text-xl font-bold mb-1">{t.searching}</h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{params.pickup}</p>
    </div>
  );
}

function SOSSheet({ onClose }) {
  const t = useT();
  const [sosSent, setSosSent] = useState(false);
  return (
    <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full rounded-t-3xl p-6 rg-anim-in" style={{ background: "var(--surface)" }}>
        {!sosSent ? (
          <>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(226,61,61,0.12)" }}><AlertTriangle size={24} style={{ color: "var(--red)" }} /></div>
            <h3 className="rg-display text-lg font-bold mb-1">{t.sosTitle}</h3>
            <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>{t.sosBody}</p>
            <Btn variant="danger" onClick={() => setSosSent(true)}>{t.sosConfirm}</Btn>
            <button onClick={onClose} className="w-full text-center text-sm font-semibold py-3.5" style={{ color: "var(--muted)" }}>{t.sosCancel}</button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-2 py-3">
            <Check size={30} style={{ color: "var(--accent)" }} />
            <p className="font-semibold">{t.sosSent}</p>
            <button onClick={() => { setSosSent(false); onClose(); }} className="text-sm font-semibold mt-2" style={{ color: "var(--accent)" }}>OK</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Live route map: pickup + drop markers, a road-like route line, and a moving car icon */
function TrackingMap({ height = 190 }) {
  const [coords, setCoords] = useState(null);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setLocError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.latitude, pos.coords.longitude]),
      () => setLocError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const base = coords || FALLBACK_COORDS;
  const ready = coords || locError;
  const pickupPt = [base[0] - 0.01, base[1] - 0.008];
  const dropPt = [base[0] + 0.012, base[1] + 0.014];
  const route = [pickupPt, [base[0] - 0.004, base[1] + 0.001], [base[0] + 0.001, base[1] + 0.009], dropPt];

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "var(--accent-tint)", height }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      )}
      {ready && (
        <MapContainer center={base} zoom={14} zoomControl={true} scrollWheelZoom={true} style={{ width: "100%", height: "100%" }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={route} pathOptions={{ color: "#16A34A", weight: 4 }} />
          <Marker position={pickupPt} icon={passengerMarkerIcon} />
          <Marker position={dropPt} icon={L.divIcon({ className: "", html: '<div style="width:14px;height:14px;border-radius:50%;background:#E23D3D;border:3px solid #fff;"></div>', iconSize: [14, 14], iconAnchor: [7, 7] })} />
        </MapContainer>
      )}
    </div>
  );
}

function PTrackingScreen({ go, params }) {
  const t = useT();
  const { driver, vehicle } = params;
  const [showSos, setShowSos] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [showFare, setShowFare] = useState(false);
  const fare = fareFor(vehicle);
  const speakGuide = useVoiceGuide();

  useEffect(() => {
    speakGuide(t.driverOnWayVoice);
    const id1 = setTimeout(() => { setArrived(true); speakGuide(t.driverArrivedVoice); }, 6000);
    const id2 = setTimeout(() => { speakGuide(t.tripStartedVoice); go("ontrip", { ...params, fare }); }, 10000);
    return () => { clearTimeout(id1); clearTimeout(id2); };
  }, []);

  return (
    <div className="flex flex-col h-full rg-anim-in relative">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}><ChevronLeft size={18} /></button>
        <h1 className="rg-display text-lg font-bold" style={{ color: "var(--accent)" }}>{t.appName}</h1>
        <Headphones size={20} />
      </div>

      <div className="px-5">
        <div className="rounded-2xl p-4 mb-3 flex items-center justify-between" style={{ background: "var(--accent-grad)" }}>
          <div>
            <p className="text-white font-semibold text-sm">{arrived ? t.driverArrivedVoice : t.driverOnWay}</p>
            {!arrived && <p className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>{t.arrivingIn} {vehicle.eta} {t.minutes}</p>}
          </div>
          <CarIcon size={26} color="#fff" />
        </div>
      </div>

      <div className="px-5"><TrackingMap /></div>

      <div className="flex-1 overflow-y-auto rg-scroll px-5 pt-3">
        <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 mb-3 text-xs font-semibold" style={{ background: "var(--surface-2)", color: "var(--accent-dark)" }}>
          <Share2 size={13} /> {t.shareLiveLocation}
        </button>

        <div className="flex items-center gap-3 rounded-2xl p-4 mb-3 rg-card">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center rg-display font-bold text-lg shrink-0" style={{ background: "var(--accent-grad)", color: "#fff" }}>
            {driver.photo ? <img src={driver.photo} className="w-full h-full object-cover" alt="" /> : driver.name[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">{driver.name}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><Star size={11} fill="var(--amber)" color="var(--amber)" /> {driver.rating} · {driver.plate}</p>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${(driver.mobile || "").replace(/\s/g, "")}`} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--accent-grad)" }}><Phone size={15} color="#fff" /></a>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}><MessageCircle size={15} /></button>
          </div>
        </div>

        <button onClick={() => setShowFare((s) => !s)} className="w-full flex items-center justify-between rounded-2xl p-3.5 mb-3" style={{ background: "var(--surface-2)" }}>
          <span className="text-sm font-semibold">{t.fareDetails}</span>
          <span className="flex items-center gap-1 text-sm font-bold">₹{fare} <ChevronRight size={14} style={{ transform: showFare ? "rotate(90deg)" : "none" }} /></span>
        </button>
        {showFare && (
          <div className="rounded-2xl p-3.5 mb-3 text-xs" style={{ background: "var(--surface-2)" }}>
            <div className="flex justify-between py-1"><span style={{ color: "var(--muted)" }}>Base fare</span><span className="font-semibold">₹{vehicle.base}</span></div>
            <div className="flex justify-between py-1"><span style={{ color: "var(--muted)" }}>Distance ({DISTANCE_KM} km)</span><span className="font-semibold">₹{fare - vehicle.base}</span></div>
          </div>
        )}

        <div className="rounded-2xl p-3.5 flex items-center gap-2.5 text-xs mb-3" style={{ background: "var(--accent-tint)", color: "var(--accent-dark)" }}>
          <MapPin size={14} /> {params.pickup} → {params.drop}
        </div>
      </div>

      <div className="px-5 pb-6 pt-2 flex gap-3 shrink-0">
        <button onClick={() => setShowSos(true)} className="rounded-2xl px-4 py-3.5 flex items-center justify-center" style={{ background: "var(--red)", color: "#fff" }}><ShieldAlert size={17} /></button>
        <Btn variant="outline" className="flex-1" onClick={() => go("home")}>{t.cancelRide}</Btn>
      </div>
      {showSos && <SOSSheet onClose={() => setShowSos(false)} />}
    </div>
  );
}

function PInTripScreen({ go, params }) {
  const t = useT();
  const { addRide } = useApp();
  const [stars, setStars] = useState(5);
  const [payment] = useState(params.payment || "cash");
  const speakGuide = useVoiceGuide();
  const tripId = useRef(`RG${Date.now().toString().slice(-8)}`).current;
  const fare = params.fare || fareFor(params.vehicle);
  useEffect(() => { speakGuide(`${t.tripCompletedVoice} ${t.paymentSuccessVoice}`); }, []);

  const finish = () => {
    addRide({ id: Date.now(), from: params.pickup, to: params.drop, vehicle: params.vehicle, driver: params.driver, fare, date: new Date(), rating: stars });
    go("home");
  };

  const downloadBill = () => {
    const receipt = [
      "RideGo — Trip Receipt", "",
      `Trip ID: ${tripId}`,
      `Driver: ${params.driver.name} (${params.driver.plate})`,
      `Vehicle: ${params.vehicle.name}`,
      `Pickup: ${params.pickup}`,
      `Drop: ${params.drop}`,
      `Payment method: ${payment}`,
      `Fare: ₹${fare}`,
      `Date: ${new Date().toLocaleString()}`,
    ].join("\n");
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `RideGo-Bill-${tripId}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}><ChevronLeft size={18} /></button>
        <h1 className="rg-display text-lg font-bold" style={{ color: "var(--accent)" }}>{t.appName}</h1>
        <span className="text-xs font-bold" style={{ color: "var(--red)" }}>{t.sos}</span>
      </div>

      <div className="px-5">
        <div className="rounded-2xl p-4 mb-3 flex items-center justify-between" style={{ background: "var(--accent-grad)" }}>
          <div>
            <p className="text-white font-semibold text-sm">{t.onTrip}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>{t.enjoyRide}</p>
          </div>
          <CarIcon size={26} color="#fff" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rg-scroll px-5 pt-1">
        <div className="rounded-2xl p-4 mb-3 rg-card">
          <div className="flex items-start gap-2.5 pb-2">
            <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: "var(--accent)" }} />
            <p className="text-xs font-semibold flex-1">{params.pickup}</p>
          </div>
          <div className="flex items-start gap-2.5 pt-2" style={{ borderTop: "1px dashed var(--border)" }}>
            <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: "var(--red)" }} />
            <p className="text-xs font-semibold flex-1">{params.drop}</p>
            <p className="text-[11px] text-right shrink-0" style={{ color: "var(--muted)" }}>{DISTANCE_KM} km<br />{params.vehicle.eta * 5} min</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          <a href={`tel:${(params.driver.mobile || "").replace(/\s/g, "")}`} className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <Phone size={17} style={{ color: "var(--accent)" }} /><span className="text-[10px] font-medium">{t.callDriverLabel}</span>
          </a>
          <button className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <MessageCircle size={17} style={{ color: "var(--accent)" }} /><span className="text-[10px] font-medium">{t.chat}</span>
          </button>
          <button className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <Share2 size={17} style={{ color: "var(--accent)" }} /><span className="text-[10px] font-medium">{t.share}</span>
          </button>
          <button onClick={downloadBill} className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: "var(--surface-2)" }}>
            <MoreHorizontal size={17} style={{ color: "var(--accent)" }} /><span className="text-[10px] font-medium">{t.more}</span>
          </button>
        </div>

        <div className="rounded-2xl p-4 mb-3" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--muted)" }}>{t.totalFare}</span>
            <button className="text-xs font-semibold" style={{ color: "var(--accent)" }}>{t.change}</button>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="rg-display text-2xl font-bold">₹{fare}</span>
            <span className="text-xs font-semibold capitalize" style={{ color: "var(--muted)" }}>{payment}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-4 mb-3 rg-card">
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center rg-display font-bold shrink-0" style={{ background: "var(--accent-grad)", color: "#fff" }}>
            {params.driver.photo ? <img src={params.driver.photo} className="w-full h-full object-cover" alt="" /> : params.driver.name[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{params.driver.name}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><Star size={11} fill="var(--amber)" color="var(--amber)" /> {params.driver.rating} · {params.driver.plate}</p>
          </div>
        </div>

        <p className="text-sm font-semibold mb-2 text-center">{t.rateYourRide}</p>
        <div className="flex gap-2 justify-center mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)}>
              <Star size={28} fill={n <= stars ? "var(--amber)" : "none"} color={n <= stars ? "var(--amber)" : "var(--border)"} />
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 pt-2 shrink-0">
        <Btn onClick={finish}>{t.submitRating}</Btn>
      </div>
    </div>
  );
}

function PWalletScreen() {
  const t = useT();
  const { rides } = useApp();
  const totalSpent = rides.reduce((s, r) => s + r.fare, 0);
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar title={t.wallet} />
      <div className="flex-1 overflow-y-auto rg-scroll px-6 pb-4">
        <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--accent-grad)", boxShadow: "0 16px 34px -14px var(--accent)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>{t.walletBalance}</p>
          <p className="rg-display text-3xl font-bold text-white mt-1">₹{Math.max(500 - totalSpent, 0)}</p>
        </div>
        <Btn variant="outline"><Wallet size={16} /> {t.addMoney}</Btn>
        <h3 className="rg-display font-semibold mt-5 mb-2">{t.rideHistory}</h3>
        {rides.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>{t.noRides}</p>
        ) : rides.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl p-3.5 mb-2" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center gap-2"><r.vehicle.Icon size={16} style={{ color: "var(--accent)" }} /><span className="text-sm font-semibold">{r.vehicle.name}</span></div>
            <span className="rg-mono font-semibold text-sm">-₹{r.fare}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PActivityScreen() {
  const t = useT();
  const { rides } = useApp();
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.historyVoice); }, []);
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar title={t.rideHistory} />
      <div className="flex-1 overflow-y-auto rg-scroll px-6 pb-4">
        {rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3" style={{ color: "var(--muted)" }}>
            <History size={32} /><p className="text-sm max-w-[220px]">{t.noRides}</p>
          </div>
        ) : rides.map((r) => (
          <div key={r.id} className="rounded-2xl p-4 mb-3 rg-card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2"><r.vehicle.Icon size={17} style={{ color: "var(--accent)" }} /><span className="font-semibold text-sm">{r.vehicle.name}</span></div>
              <span className="rg-mono font-semibold">₹{r.fare}</span>
            </div>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{r.date.toLocaleDateString()} · {r.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><MapPin size={11} /> {r.from} → {r.to}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PProfileScreen({ go }) {
  const t = useT();
  const { user, setUser, theme, setTheme, lang, setLang, voiceGuide, setVoiceGuide } = useApp();
  const [showPhoto, setShowPhoto] = useState(false);
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.profileVoice); }, []);
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar title={t.profile} />
      <div className="flex-1 overflow-y-auto rg-scroll px-6">
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4" style={{ background: "var(--accent-tint)" }}>
          <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center rg-display font-bold text-xl shrink-0" style={{ background: "var(--accent-grad)", color: "#fff" }}>
            {user?.photo ? <img src={user.photo} className="w-full h-full object-cover" alt="" /> : (user?.name || "R")[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--accent-dark)" }}><Star size={11} fill="var(--amber)" color="var(--amber)" /> {user?.rating} · +91 {user?.mobile}</p>
          </div>
          <button onClick={() => setShowPhoto((s) => !s)} aria-label={t.editProfile}><Edit3 size={16} style={{ color: "var(--accent-dark)" }} /></button>
        </div>
        {showPhoto && (
          <div className="rounded-2xl p-4 mb-4 rg-card flex flex-col items-center">
            <PhotoUploader photo={user?.photo} onChange={(p) => setUser((u) => ({ ...u, photo: p }))} storageKey="passenger:photo" />
          </div>
        )}
        <ProfileRow icon={theme === "dark" ? Moon : Sun} label={t.darkMode} right={<Toggle on={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />} />
        <ProfileRow icon={Volume2} label={t.voiceGuide} right={<Toggle on={voiceGuide} onClick={() => setVoiceGuide((v) => !v)} />} />
        <EasyModeRow />
        <ProfileRow icon={Globe} label={t.language} right={
          <div className="flex gap-1.5">
            {["en", "hi", "bn"].map((l) => (
              <button key={l} onClick={() => setLang(l)} className="px-2.5 py-1 rounded-full text-[11px] font-bold rg-mono" style={{ background: lang === l ? "var(--accent)" : "var(--surface-2)", color: lang === l ? "#fff" : "var(--muted)" }}>{l.toUpperCase()}</button>
            ))}
          </div>} />
        <ProfileRow icon={Wallet} label={t.paymentMethods} right={<ChevronRight size={16} style={{ color: "var(--muted)" }} />} />
        <ProfileRow icon={Bell} label="Notifications" right={<Toggle on={true} onClick={() => {}} />} />
        <ProfileRow icon={PhoneCall} label={t.support} right={<ChevronRight size={16} style={{ color: "var(--muted)" }} />} />
        <SwitchRoleRow />
        <button onClick={() => go("login")} className="w-full flex items-center gap-3 py-4 mt-2 font-semibold" style={{ color: "var(--red)" }}><LogOut size={18} /> {t.logout}</button>
      </div>
    </div>
  );
}

function PBottomNav({ tab, setTab, onSos }) {
  const t = useT();
  const items = [
    { id: "home", label: t.home, Icon: HomeIcon },
    { id: "activity", label: t.bookings, Icon: History },
    { id: "wallet", label: t.wallet, Icon: Wallet },
  ];
  return (
    <div className="flex justify-around items-center py-2.5 shrink-0" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors duration-200"
            style={{ background: active ? "var(--accent-tint)" : "transparent" }}>
            <it.Icon size={19} style={{ color: active ? "var(--accent)" : "var(--muted)", transition: "color .2s" }} />
            <span className="text-[10px] font-medium" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>{it.label}</span>
          </button>
        );
      })}
      <button onClick={onSos} className="flex flex-col items-center gap-1 px-3 py-1.5">
        <ShieldAlert size={19} style={{ color: "var(--red)" }} />
        <span className="text-[10px] font-medium" style={{ color: "var(--red)" }}>{t.sos}</span>
      </button>
      <button onClick={() => setTab("profile")} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors duration-200"
        style={{ background: tab === "profile" ? "var(--accent-tint)" : "transparent" }}>
        <User size={19} style={{ color: tab === "profile" ? "var(--accent)" : "var(--muted)" }} />
        <span className="text-[10px] font-medium" style={{ color: tab === "profile" ? "var(--accent)" : "var(--muted)" }}>{t.profile}</span>
      </button>
    </div>
  );
}

function PassengerShell() {
  const [screen, setScreen] = useState("login");
  const [params, setParams] = useState({});
  const [tab, setTab] = useState("home");
  const [showSos, setShowSos] = useState(false);
  const go = useCallback((s, p = {}) => { setScreen(s); setParams(p); if (["home", "activity", "wallet", "profile"].includes(s)) setTab(s); }, []);
  const authScreens = ["login", "otp", "register"];
  const flowScreens = ["vehicles", "searching", "tracking", "ontrip"];
  let body;
  if (authScreens.includes(screen)) {
    body = screen === "login" ? <PLoginScreen go={go} /> : screen === "otp" ? <POtpScreen go={go} params={params} /> : <PRegisterScreen go={go} params={params} />;
  } else if (flowScreens.includes(screen)) {
    body = screen === "vehicles" ? <PVehicleScreen go={go} params={params} /> : screen === "searching" ? <PSearchingScreen go={go} params={params} /> : screen === "tracking" ? <PTrackingScreen go={go} params={params} /> : <PInTripScreen go={go} params={params} />;
  } else {
    body = tab === "home" ? <PHomeScreen go={go} /> : tab === "activity" ? <PActivityScreen /> : tab === "wallet" ? <PWalletScreen /> : <PProfileScreen go={go} />;
  }
  const showNav = !authScreens.includes(screen) && !flowScreens.includes(screen);
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 min-h-0 relative" key={screen}>{body}</div>
      <ReplayVoiceButton />
      {showNav && <PBottomNav tab={tab} setTab={(id) => go(id)} onSos={() => setShowSos(true)} />}
      {showSos && <SOSSheet onClose={() => setShowSos(false)} />}
    </div>
  );
}

/* ============================== DRIVER FLOW ============================== */

function DLoginScreen({ go }) {
  const [mobile, setMobile] = useState("");
  const { setRole, lang, setLang } = useApp();
  const t = useT();
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.driverLoginVoice); }, []);
  return (
    <div className="flex flex-col h-full px-6 rg-anim-in">
      <TopBar onBack={() => setRole(null)} />
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-3 -mt-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: "var(--accent-grad)", boxShadow: "0 14px 30px -10px var(--accent)" }}><Navigation2 size={30} color="#fff" /></div>
        <h1 className="rg-display text-3xl font-bold">RideGo Driver</h1>
        <p style={{ color: "var(--muted)" }} className="text-[15px]">Earn on your own schedule.</p>
      </div>
      <div className="pb-8 flex flex-col gap-3">
        <div className="flex gap-2 justify-center mb-1">
          {["en", "hi", "bn"].map((l) => (
            <button key={l} onClick={() => setLang(l)} className="px-3 py-1.5 rounded-full text-xs font-semibold rg-mono"
              style={{ background: lang === l ? "var(--accent)" : "var(--surface-2)", color: lang === l ? "#fff" : "var(--muted)" }}>{l.toUpperCase()}</button>
          ))}
        </div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Mobile number</label>
        <Field icon={Phone} type="tel" placeholder="98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} />
        <Btn disabled={mobile.length !== 10} onClick={() => go("otp", { mobile })}>Send OTP <ChevronRight size={17} /></Btn>
      </div>
    </div>
  );
}

function DOtpScreen({ go, params }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const t = useT();
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.driverOtpVoice); }, []);
  const update = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };
  const complete = otp.every((d) => d !== "");
  return (
    <div className="flex flex-col h-full px-6 rg-anim-in">
      <TopBar onBack={() => go("login")} />
      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-tint)" }}><ShieldCheck size={26} style={{ color: "var(--accent)" }} /></div>
        <h2 className="rg-display text-2xl font-bold">Verify your number</h2>
        <p style={{ color: "var(--muted)" }} className="text-sm -mt-2">code sent to +91 {params.mobile}</p>
        <div className="flex gap-3 mt-2">
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]} value={d} maxLength={1} inputMode="numeric" onChange={(e) => update(i, e.target.value)}
              className="w-14 h-14 text-center text-xl rg-mono font-semibold rounded-2xl" style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--ink)" }} />
          ))}
        </div>
        <p className="text-xs rg-mono" style={{ color: "var(--amber)" }}>Demo OTP: 1234</p>
      </div>
      <div className="pb-8"><Btn disabled={!complete} onClick={() => go("register", params)}>Verify & continue</Btn></div>
    </div>
  );
}

function DRegisterScreen({ go, params }) {
  const { setDriver } = useApp();
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0].id);
  const [photo, setPhoto] = useState(null);
  const t = useT();
  const speakGuide = useVoiceGuide();
  useEffect(() => { loadPhoto("driver:photo").then(setPhoto); speakGuide(t.driverRegisterVoice); }, []);

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar onBack={() => go("otp", params)} title="Driver profile" />
      <div className="flex-1 overflow-y-auto rg-scroll px-6 pb-4">
        <div className="py-3"><PhotoUploader photo={photo} onChange={setPhoto} storageKey="driver:photo" /></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Full name</label>
        <div className="mt-1.5 mb-3"><Field icon={User} placeholder="Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Vehicle number</label>
        <div className="mt-1.5 mb-4"><Field icon={Package} placeholder="AS11B2495" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} /></div>
        <h3 className="rg-display font-semibold mb-2">Select vehicle type</h3>
        <div className="flex flex-col gap-2.5">
          {VEHICLE_TYPES.map((v) => {
            const active = v.id === vehicleType;
            return (
              <button key={v.id} onClick={() => setVehicleType(v.id)} className="flex items-center gap-3 rounded-2xl p-3.5 text-left"
                style={{ background: active ? "var(--accent-tint)" : "var(--surface)", border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: active ? "var(--accent-grad)" : "var(--surface-2)" }}><v.Icon size={20} style={{ color: active ? "#fff" : "var(--accent)" }} /></div>
                <div className="flex-1"><p className="font-semibold text-[15px]">{v.name}</p><p className="text-xs rg-mono" style={{ color: "var(--muted)" }}>Base: ₹{v.base} | {v.perKm}/km</p></div>
                {active && <Check size={18} style={{ color: "var(--accent)" }} />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-6 pb-8 pt-2 shrink-0">
        <Btn disabled={!name || !plate} onClick={() => { const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType); setDriver({ name, plate, vehicleType: vt, photo, mobile: params.mobile, rating: 4.8 }); go("home"); }}>Save profile</Btn>
      </div>
    </div>
  );
}

function RequestSheet({ request, onAccept, onReject }) {
  const fare = Math.round(15 + request.distanceKm * 12);
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 rg-sheet-in">
      <div className="mx-4 mb-4 rounded-3xl p-5" style={{ background: "var(--surface)", border: "2px solid var(--accent)", boxShadow: "0 20px 40px -14px var(--accent)" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "var(--accent-tint)", color: "var(--accent-dark)" }}><Bell size={12} /> New booking!</span>
          <span className="rg-display text-2xl font-bold">₹{fare}</span>
        </div>
        <div className="flex flex-col gap-2.5 mb-3">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Pickup</p>
          <p className="flex items-center gap-2 text-sm font-semibold -mt-2"><MapPin size={14} style={{ color: "var(--accent)" }} /> {request.pickup}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Destination</p>
          <p className="flex items-center gap-2 text-sm font-semibold -mt-2"><Flag size={14} style={{ color: "var(--red)" }} /> {request.drop}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Distance</p>
          <p className="rg-mono font-semibold text-sm -mt-2">{request.distanceKm} km</p>
        </div>
        <div className="flex gap-3 mb-2.5">
          <Btn onClick={() => onAccept(fare)}>Accept</Btn>
          <Btn variant="outline" onClick={onReject}>Reject</Btn>
        </div>
        <a href={`tel:${request.mobile.replace(/\s/g, "")}`}>
          <Btn variant="ghost" className="!rounded-2xl"><PhoneCall size={16} /> Call passenger · {request.mobile}</Btn>
        </a>
      </div>
    </div>
  );
}

function DHomeScreen() {
  const { driver, online, setOnline, addTrip, lang } = useApp();
  const t = useT();
  const [request, setRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripStage, setTripStage] = useState("toPickup");
  const announce = useAnnounce();
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.driverHomeVoice); }, []);

  useEffect(() => {
    if (!online || request || activeTrip) return;
    const tmr = setTimeout(() => setRequest(MOCK_REQUESTS[Math.floor(Math.random() * MOCK_REQUESTS.length)]), 3000);
    return () => clearTimeout(tmr);
  }, [online, request, activeTrip]);

  useEffect(() => {
    if (!request) return;
    const fare = Math.round(15 + request.distanceKm * 12);
    const etaMin = Math.round(request.distanceKm * 3);
    const vName = driver?.vehicleType?.name || "";
    const line = `${t.voiceNewRequest} ${t.voicePickup}: ${request.pickup}. ${t.voiceDestination}: ${request.drop}. ${t.voiceDistance}: ${request.distanceKm} km. ${t.voiceEta}: ${etaMin} ${t.minutes}. ${t.voiceFare}: ₹${fare}. ${t.voiceVehicle}: ${vName}.`;
    announce(line);
  }, [request]);

  const accept = (fare) => { setActiveTrip({ ...request, fare }); setTripStage("toPickup"); setRequest(null); };
  const reject = () => setRequest(null);
  const advance = () => {
    if (tripStage === "toPickup") setTripStage("inTrip");
    else { addTrip({ id: Date.now(), ...activeTrip, date: new Date() }); setActiveTrip(null); }
  };

  if (activeTrip) {
    return (
      <div className="flex flex-col h-full rg-anim-in">
        <TopBar title={tripStage === "toPickup" ? "Head to pickup" : "Trip in progress"} />
        <div className="px-6"><RouteVisual /></div>
        <div className="px-6 pt-4 flex-1 overflow-y-auto rg-scroll">
          <div className="rounded-2xl p-4 mb-3 rg-card">
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Passenger</p>
            <p className="font-semibold text-[15px] mb-2">{activeTrip.passenger}</p>
            <div className="flex items-center gap-2 text-sm mb-2"><MapPinned size={14} style={{ color: "var(--accent)" }} /> {activeTrip.pickup}</div>
            <div className="flex items-center gap-2 text-sm"><Flag size={14} style={{ color: "var(--red)" }} /> {activeTrip.drop}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3.5" style={{ background: "var(--surface-2)" }}><p className="text-[11px]" style={{ color: "var(--muted)" }}>Fare</p><p className="rg-mono font-semibold text-lg">₹{activeTrip.fare}</p></div>
            <div className="rounded-2xl p-3.5" style={{ background: "var(--surface-2)" }}><p className="text-[11px]" style={{ color: "var(--muted)" }}>Distance</p><p className="rg-mono font-semibold text-lg">{activeTrip.distanceKm} km</p></div>
          </div>
          <a href={`tel:${activeTrip.mobile.replace(/\s/g, "")}`} className="flex items-center gap-2 mt-3 text-sm font-semibold" style={{ color: "var(--accent)" }}><PhoneCall size={15} /> Call {activeTrip.mobile}</a>
        </div>
        <div className="px-6 pb-8 shrink-0"><Btn onClick={advance}>{tripStage === "toPickup" ? "Arrived — start trip" : "Complete trip"}</Btn></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rg-anim-in relative">
      <div className="px-6 pt-5 pb-2 flex items-center justify-between shrink-0">
        <div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Welcome back</p>
          <h1 className="rg-display text-xl font-bold">{driver?.name?.split(" ")[0] || "Driver"}</h1>
        </div>
        <button onClick={() => setOnline((o) => !o)} className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm"
          style={{ background: online ? "var(--accent-grad)" : "var(--surface-2)", color: online ? "#fff" : "var(--muted)", boxShadow: online ? "0 10px 22px -10px var(--accent)" : "none", animation: online ? "rg-pulse 2s infinite" : "none" }}>
          <Power size={15} /> {online ? "Online" : "Offline"}
        </button>
      </div>
      <div className="px-6 pt-2"><RouteVisual height={180} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {online ? (
          <><Loader2 size={26} className="animate-spin mb-3" style={{ color: "var(--accent)" }} /><p className="font-semibold text-[15px]">Looking for ride requests…</p><p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Stay online to receive bookings nearby</p></>
        ) : (
          <><Power size={26} className="mb-3" style={{ color: "var(--muted)" }} /><p className="font-semibold text-[15px]">You're offline</p><p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Go online to start receiving ride requests</p></>
        )}
      </div>
      {request && <RequestSheet request={request} onAccept={accept} onReject={reject} />}
    </div>
  );
}

function DBookingsScreen() {
  const { trips } = useApp();
  const t = useT();
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar title={t.bookings} />
      <div className="flex-1 overflow-y-auto rg-scroll px-6 pb-4">
        {trips.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>No trips yet.</p>
        ) : trips.map((tr) => (
          <div key={tr.id} className="rounded-2xl p-3.5 mb-2 rg-card">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{tr.passenger}</span>
              <span className="rg-mono font-semibold">₹{tr.fare}</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{tr.pickup} → {tr.drop}</p>
            <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{tr.date.toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DWalletScreen() {
  const { trips } = useApp();
  const t = useT();
  const balance = trips.reduce((s, tr) => s + tr.fare, 0) + 1240;
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar title={t.wallet} />
      <div className="flex-1 overflow-y-auto rg-scroll px-6">
        <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--accent-grad)", boxShadow: "0 16px 34px -14px var(--accent)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>{t.walletBalance}</p>
          <p className="rg-display text-3xl font-bold text-white mt-1">₹{balance.toLocaleString()}</p>
        </div>
        <Btn variant="outline"><Wallet size={16} /> Withdraw to bank</Btn>
      </div>
    </div>
  );
}

function DEarningsScreen() {
  const { trips } = useApp();
  const t = useT();
  const speakGuide = useVoiceGuide();
  useEffect(() => { speakGuide(t.driverEarningsVoice); }, []);
  const [range, setRange] = useState("week");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = days.map((d) => ({ day: d, earnings: Math.round(200 + Math.random() * 600) }));
  const totalEarnings = trips.reduce((s, t) => s + t.fare, 0);
  const rangeLabel = { today: "Today", week: "This week", month: "This month" };
  return (
    <div className="flex flex-col h-full rg-anim-in">
      <TopBar title="Earnings" />
      <div className="flex-1 overflow-y-auto rg-scroll px-6 pb-4">
        <div className="flex gap-2 mb-4">
          {["today", "week", "month"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="px-3.5 py-1.5 rounded-full text-xs font-semibold" style={{ background: range === r ? "var(--accent)" : "var(--surface-2)", color: range === r ? "#fff" : "var(--muted)" }}>{rangeLabel[r]}</button>
          ))}
        </div>
        <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--accent-grad)", boxShadow: "0 16px 34px -14px var(--accent)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>Total earnings · {rangeLabel[range]}</p>
          <p className="rg-display text-3xl font-bold text-white mt-1">₹{(totalEarnings + 1240).toLocaleString()}</p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.85)" }}><TrendingUp size={12} /> {trips.length} trips completed</p>
        </div>
        <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--surface-2)", height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="earnings" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <h3 className="rg-display font-semibold mb-2">Recent trips</h3>
        {trips.length === 0 ? <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>No trips yet today.</p> : trips.map((tr) => (
          <div key={tr.id} className="flex items-center justify-between rounded-2xl p-3.5 mb-2" style={{ background: "var(--surface-2)" }}>
            <div><p className="font-semibold text-sm">{tr.passenger}</p><p className="text-xs" style={{ color: "var(--muted)" }}>{tr.pickup} → {tr.drop}</p></div>
            <span className="rg-mono font-semibold">₹{tr.fare}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DProfileScreen({ go }) {
  const t = useT();
  const { driver, setDriver, theme, setTheme, trips, lang, setLang, announceRequests, setAnnounceRequests, online, setOnline } = useApp();
  const [showPhoto, setShowPhoto] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const completion = trips.length ? Math.round(90 + Math.random() * 10) : 98;

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}><ChevronLeft size={18} /></button>
        <h1 className="rg-display text-[17px] font-semibold">Driver Profile</h1>
        <button onClick={() => setShowSettings((s) => !s)}><MoreHorizontal size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto rg-scroll px-5 pb-4">
        <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--accent-tint)" }}>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center rg-display font-bold text-2xl shrink-0" style={{ background: "var(--accent-grad)", color: "#fff" }}>
              {driver?.photo ? <img src={driver.photo} className="w-full h-full object-cover" alt="" /> : (driver?.name || "D")[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[16px] flex items-center gap-1.5">{driver?.name} <CheckCircle2 size={15} style={{ color: "var(--accent)" }} /></p>
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--accent-dark)" }}><Star size={11} fill="var(--amber)" color="var(--amber)" /> {driver?.rating} ({trips.length} rides)</p>
              <p className="text-xs rg-mono mt-0.5" style={{ color: "var(--accent-dark)" }}>{driver?.plate}</p>
            </div>
            <button onClick={() => setShowPhoto((s) => !s)} aria-label={t.changePhoto}><Edit3 size={15} style={{ color: "var(--accent-dark)" }} /></button>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1" style={{ background: online ? "var(--accent-grad)" : "var(--surface-2)", color: online ? "#fff" : "var(--muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: online ? "#fff" : "var(--muted)" }} /> {online ? "Online" : "Offline"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: "var(--surface)" }}>{driver?.vehicleType?.name}</span>
          </div>
        </div>

        {showPhoto && (
          <div className="rounded-2xl p-4 mb-4 rg-card flex flex-col items-center">
            <PhotoUploader photo={driver?.photo} onChange={(p) => setDriver((d) => ({ ...d, photo: p }))} storageKey="driver:photo" />
          </div>
        )}

        <h3 className="rg-display text-sm font-semibold mb-2">{t.about}</h3>
        <div className="rounded-2xl p-4 mb-4 rg-card flex flex-col gap-2.5">
          <p className="text-xs flex items-center gap-2"><MapPin size={13} style={{ color: "var(--muted)" }} /> Silchar, Assam</p>
          <p className="text-xs flex items-center gap-2"><Phone size={13} style={{ color: "var(--muted)" }} /> +91 {driver?.mobile}</p>
          <p className="text-xs flex items-center gap-2"><Mail size={13} style={{ color: "var(--muted)" }} /> {(driver?.name || "driver").toLowerCase().replace(/\s/g, "")}@gmail.com</p>
          <p className="text-xs flex items-center gap-2"><CreditCard size={13} style={{ color: "var(--muted)" }} /> DL No. AS11 2018 1234567</p>
          <p className="text-xs flex items-center gap-2"><Briefcase size={13} style={{ color: "var(--muted)" }} /> 3 {t.experience}</p>
        </div>

        <h3 className="rg-display text-sm font-semibold mb-2">{t.vehicleDetails}</h3>
        <div className="rounded-2xl p-4 mb-4 rg-card flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-tint)" }}>
            {driver?.vehicleType?.Icon ? <driver.vehicleType.Icon size={26} style={{ color: "var(--accent)" }} /> : <CarIcon size={26} style={{ color: "var(--accent)" }} />}
          </div>
          <div>
            <p className="font-semibold text-sm">{driver?.vehicleType?.name}</p>
            <p className="text-xs rg-mono" style={{ color: "var(--muted)" }}>{driver?.plate}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Green & Black</p>
          </div>
        </div>

        <h3 className="rg-display text-sm font-semibold mb-2">{t.yourStats}</h3>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="rounded-2xl p-3 text-center rg-card">
            <p className="rg-display text-lg font-bold">{trips.length}</p>
            <p className="text-[10px]" style={{ color: "var(--muted)" }}>{t.totalRides}</p>
          </div>
          <div className="rounded-2xl p-3 text-center rg-card">
            <p className="rg-display text-lg font-bold flex items-center justify-center gap-0.5">{driver?.rating} <Star size={12} fill="var(--amber)" color="var(--amber)" /></p>
            <p className="text-[10px]" style={{ color: "var(--muted)" }}>{t.rating}</p>
          </div>
          <div className="rounded-2xl p-3 text-center rg-card">
            <p className="rg-display text-lg font-bold">{completion}%</p>
            <p className="text-[10px]" style={{ color: "var(--muted)" }}>{t.completion}</p>
          </div>
        </div>

        <h3 className="rg-display text-sm font-semibold mb-2">{t.documents}</h3>
        <div className="rounded-2xl mb-4 rg-card overflow-hidden">
          <div className="flex items-center justify-between p-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-xs font-semibold">{t.drivingLicense}</span>
            <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: "var(--accent)" }}><CheckCircle2 size={12} /> {t.verified}</span>
          </div>
          <div className="flex items-center justify-between p-3.5">
            <span className="text-xs font-semibold">{t.rcDocument}</span>
            <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: "var(--accent)" }}><CheckCircle2 size={12} /> {t.verified}</span>
          </div>
        </div>

        {showSettings && (
          <div className="rounded-2xl mb-4 rg-card overflow-hidden">
            <ProfileRow icon={theme === "dark" ? Moon : Sun} label={t.darkMode} right={<Toggle on={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />} />
            <ProfileRow icon={Bell} label={t.rideAnnouncements} right={<Toggle on={announceRequests} onClick={() => setAnnounceRequests((v) => !v)} />} />
            <EasyModeRow />
            <ProfileRow icon={Globe} label={t.language} right={
              <div className="flex gap-1.5">
                {["en", "hi", "bn"].map((l) => (
                  <button key={l} onClick={() => setLang(l)} className="px-2.5 py-1 rounded-full text-[11px] font-bold rg-mono" style={{ background: lang === l ? "var(--accent)" : "var(--surface-2)", color: lang === l ? "#fff" : "var(--muted)" }}>{l.toUpperCase()}</button>
                ))}
              </div>} />
            <SwitchRoleRow />
            <button onClick={() => go("login")} className="w-full flex items-center gap-3 py-3.5 px-1 font-semibold" style={{ color: "var(--red)" }}><LogOut size={18} /> {t.logout}</button>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setOnline((o) => !o)} className="flex-1 rounded-2xl py-3 font-semibold text-sm" style={{ background: "var(--surface-2)" }}>{online ? t.goOffline : t.goOnline}</button>
          <button className="flex-1 rounded-2xl py-3 font-semibold text-sm" style={{ background: "var(--red)", color: "#fff" }}>{t.help}</button>
        </div>
      </div>
    </div>
  );
}

function DBottomNav({ tab, setTab }) {
  const t = useT();
  const items = [
    { id: "home", label: "Home", Icon: Navigation2 },
    { id: "earnings", label: "Earnings", Icon: TrendingUp },
    { id: "bookings", label: t.bookings, Icon: History },
    { id: "wallet", label: t.wallet, Icon: Wallet },
    { id: "profile", label: "Profile", Icon: User },
  ];
  return (
    <div className="flex justify-around items-center py-2.5 shrink-0" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-colors duration-200"
            style={{ background: active ? "var(--accent-tint)" : "transparent" }}>
            <it.Icon size={18} style={{ color: active ? "var(--accent)" : "var(--muted)", transition: "color .2s" }} />
            <span className="text-[9px] font-medium" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DriverShell() {
  const [screen, setScreen] = useState("login");
  const [params, setParams] = useState({});
  const [tab, setTab] = useState("home");
  const go = useCallback((s, p = {}) => { setScreen(s); setParams(p); if (["home", "earnings", "bookings", "wallet", "profile"].includes(s)) setTab(s); }, []);
  const authScreens = ["login", "otp", "register"];
  let body;
  if (authScreens.includes(screen)) {
    body = screen === "login" ? <DLoginScreen go={go} /> : screen === "otp" ? <DOtpScreen go={go} params={params} /> : <DRegisterScreen go={go} params={params} />;
  } else {
    body = tab === "home" ? <DHomeScreen /> : tab === "earnings" ? <DEarningsScreen /> : tab === "bookings" ? <DBookingsScreen /> : tab === "wallet" ? <DWalletScreen /> : <DProfileScreen go={go} />;
  }
  const showNav = !authScreens.includes(screen);
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 min-h-0 relative" key={screen}>{body}</div>
      <ReplayVoiceButton />
      {showNav && <DBottomNav tab={tab} setTab={(id) => go(id)} />}
    </div>
  );
}

/* --------------------------------- Root --------------------------------- */
export default function RideGo() {
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("en");
  const [voiceGuide, setVoiceGuide] = useState(false);
  const [lastSpoken, setLastSpoken] = useState("");
  const [announceRequests, setAnnounceRequests] = useState(true);
  const [easyMode, setEasyMode] = useState(false);
  const [role, setRole] = useState(null);

  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const addRide = useCallback((r) => setRides((prev) => [r, ...prev]), []);

  const [driver, setDriver] = useState(null);
  const [online, setOnline] = useState(false);
  const [trips, setTrips] = useState([]);
  const addTrip = useCallback((t) => setTrips((prev) => [t, ...prev]), []);

  const accentRole = role === "driver" ? "driver" : role === "passenger" ? "passenger" : "brand";
  const vars = { ...BASE_THEME[theme], ...accentVars(accentRole) };

  const ctxValue = {
    theme, setTheme, lang, setLang, voiceGuide, setVoiceGuide, lastSpoken, setLastSpoken, announceRequests, setAnnounceRequests,
    easyMode, setEasyMode, role, setRole,
    user, setUser, rides, addRide, driver, setDriver, online, setOnline, trips, addTrip,
  };

  return (
    <AppCtx.Provider value={ctxValue}>
      <div className={`rg-root w-full h-screen flex items-center justify-center ${easyMode ? "rg-easy" : ""}`} style={{ ...vars, background: theme === "dark" ? "#050506" : "#EDEAE7" }}>
        <FontStyles />
        <div className="relative w-full h-full sm:h-[850px] sm:w-[400px] sm:rounded-[2.5rem] overflow-hidden flex flex-col" style={{ background: "var(--bg)", boxShadow: "var(--shadow)" }}>
          <ErrorBoundary>
            {role === null ? <RoleSelect /> : role === "passenger" ? <PassengerShell /> : <DriverShell />}
          </ErrorBoundary>
        </div>
      </div>
    </AppCtx.Provider>
  );
}
