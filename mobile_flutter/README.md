# B.Tech Learning Platform — Android & Flutter Client

This folder contains the Flutter mobile client configured to connect with the centralized FastAPI backend.

## Prerequisites
- Flutter SDK 3.x+
- Android Studio / Android SDK

## Running the Mobile App
```bash
cd mobile_flutter
flutter pub get
flutter run
```

## Generating Android Production Build (.aab / APK)
```bash
# Build Android App Bundle for Google Play Store:
flutter build appbundle --release

# Or build standalone APK:
flutter build apk --release
```

## Security & Anti-Capture
The Android client integrates with platform-level `FLAG_SECURE` window controls on lecture player screens to mitigate screen recording and screenshots on supported Android devices.
