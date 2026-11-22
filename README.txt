MS FOOTWEAR - वेबसाइट + मालिक पैनल + Android ऐप (PWA)
=====================================================

इसमें क्या है
- ग्राहक की दुकान: खोज, श्रेणी, साइज़, कार्ट, WhatsApp पर ऑर्डर (7095867950)
- मालिक पैनल (वेबसाइट के आखिर में "मालिक" लिंक, या पता + #admin):
  लॉगिन, ऑर्डर देखना, ऑर्डर की स्थिति बदलना, कुल बिक्री,
  नया माल जोड़ना (फ़ोटो के साथ), माल की गिनती, दाम बदलना
- फ़ोन में ऐप की तरह इंस्टॉल (PWA), आइकन के साथ

--------------------------------------------------
क़दम 1: Firebase बनाइए (मुफ़्त)
--------------------------------------------------
1. console.firebase.google.com खोलिए, Google अकाउंट से लॉगिन कीजिए।
2. "Add project" दबाइए, नाम: ms-footwear (Analytics बंद कर सकते हैं)।
3. Build > Firestore Database > Create database > "Production mode" > जगह: asia-south1 (Mumbai)।
4. Build > Authentication > Get started > "Email/Password" चालू कीजिए।
   फिर Users टैब में "Add user" दबाकर अपनी ईमेल और पासवर्ड बनाइए।
5. Project settings (गियर आइकन) > "Your apps" > Web (</>) > ऐप का नाम डालिए।
   वहाँ apiKey, authDomain, projectId, appId मिलेंगे।
6. इन्हें firebase-config.js में भरिए, और ADMIN_EMAIL में वही ईमेल डालिए जो ऊपर बनाई।
7. Firestore > Rules में नीचे वाले नियम चिपकाइए (OWNER_EMAIL की जगह अपनी ईमेल), फिर Publish:

rules_version = '2';
service cloud.firestore {
  match /databases/{d}/documents {
    function admin() { return request.auth != null && request.auth.token.email == "OWNER_EMAIL"; }
    match /products/{id} { allow read: if true; allow write: if admin(); }
    match /orders/{id} {
      allow create: if request.resource.data.total is number
        && request.resource.data.items.size() > 0
        && request.resource.data.items.size() <= 30;
      allow read, update, delete: if admin();
    }
  }
}

--------------------------------------------------
क़दम 2: GitHub Pages पर डालिए (मुफ़्त)
--------------------------------------------------
1. github.com पर नया repository बनाइए (नाम: ms-footwear, Public)।
2. इस फ़ोल्डर की सारी फ़ाइलें (icons फ़ोल्डर समेत) "Upload files" से डालिए।
3. Settings > Pages > Source: "Deploy from a branch" > main > /(root) > Save।
4. 1-2 मिनट में साइट चालू: https://आपका-यूज़रनाम.github.io/ms-footwear/
5. Firebase > Authentication > Settings > Authorized domains में
   आपका-यूज़रनाम.github.io जोड़िए (नहीं तो लॉगिन नहीं चलेगा)।

--------------------------------------------------
क़दम 3: फ़ोन में ऐप की तरह (फ्री)
--------------------------------------------------
Android Chrome में साइट खोलिए > ⋮ मेनू > "Install app" / "होम स्क्रीन पर जोड़ें"।

--------------------------------------------------
क़दम 4: Play Store (बाद में, $25 एक बार)
--------------------------------------------------
1. play.google.com/console पर Developer अकाउंट बनाइए।
2. pwabuilder.com पर अपनी साइट का पता डालिए > Android > Package बनाइए (फ्री)।
3. जो AAB फ़ाइल मिले उसे Play Console में डालिए, साथ में स्क्रीनशॉट और प्राइवेसी पॉलिसी।

--------------------------------------------------
ज़रूरी बातें
--------------------------------------------------
- मालिक पैनल की सुरक्षा Firebase लॉगिन और ऊपर वाले rules से है। rules ज़रूर डालिए।
- फ़ोटो छोटी करके Firestore में ही रखी जाती हैं (फ्री, अलग Storage नहीं चाहिए)।
- ऑनलाइन पेमेंट (Razorpay) अभी नहीं जुड़ा है। अभी भुगतान कैश ऑन डिलीवरी या UPI (WhatsApp पर)।
- ग्राहक का ऑर्डर पहले Firebase में सेव होता है, फिर WhatsApp खुलता है।
