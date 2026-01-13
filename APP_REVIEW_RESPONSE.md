# App Review Response Template

## Issue 1: Guideline 4.8 - Design - Login Services

**Response:**

We have implemented Sign in with Apple as an equivalent login option alongside Google Sign-In. Sign in with Apple meets all the requirements specified in guideline 4.8:

1. ✅ **Limits data collection to name and email**: Sign in with Apple only requests the user's name and email address, which are the minimum required fields for account creation.

2. ✅ **Allows users to keep email private**: Sign in with Apple provides users with the option to use "Hide My Email," which generates a unique, private email address that forwards to their real email. This keeps their actual email address private from all parties.

3. ✅ **Does not collect interactions for advertising without consent**: Sign in with Apple does not track user interactions with the app for advertising purposes. We do not use Sign in with Apple data for any advertising or tracking purposes.

**Where to find Sign in with Apple:**
- On the login page (`/login`): Users will see a "Continue with Apple" button below the Google Sign-In option
- On the signup page (`/signup`): Users will see a "Continue with Apple" button below the Google Sign-Up option

Both login options are presented equally, and users can choose either Google Sign-In or Sign in with Apple to create or access their account.

---

## Issue 2: Guideline 5.1.1(v) - Data Collection and Storage - Account Deletion

**Response:**

We have implemented account deletion functionality that allows users to permanently delete their accounts and all associated data.

**Where to find Account Deletion:**
- Navigate to the Settings page (accessible from the main app navigation)
- Scroll to the bottom of the Settings page
- In the "Danger Zone" section, users will find a "Delete My Account" button

**How Account Deletion Works:**
1. User clicks "Delete My Account" button
2. A confirmation dialog appears asking the user to confirm the deletion
3. Upon confirmation, the account and all associated data are permanently deleted from our servers
4. Local app data is cleared
5. User is automatically signed out and redirected to the login page

**Data Deletion:**
- All user profile data (name, email)
- All user cards and preferences
- All account information
- All associated data stored in our backend

The deletion is permanent and cannot be undone. Users do not need to contact customer service or visit a website to complete the deletion - it can be done entirely within the app.

---

## Additional Notes

- Both features have been implemented and tested
- Sign in with Apple is available on both web and iOS native platforms
- Account deletion is accessible directly from the Settings page within the app
- All user data is permanently deleted upon account deletion request
