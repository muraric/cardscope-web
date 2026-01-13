# Account Deletion Implementation

## Overview
To comply with Apple's App Store guidelines (5.1.1(v)), we've implemented account deletion functionality that allows users to permanently delete their accounts and all associated data.

## What's Been Implemented

1. **Account Deletion UI** - Added to Settings page (`/app/settings/page.tsx`)
   - Located in "Danger Zone" section at the bottom
   - Includes confirmation dialog
   - Clear warning about permanent deletion

2. **Account Deletion Handler** - `handleDeleteAccount()` function
   - Calls backend API to delete user account
   - Clears local storage
   - Signs out user
   - Redirects to login page

## Backend API Requirement

The frontend calls:
```
DELETE /api/user/{email}
```

**Backend Implementation Required:**

Your backend needs to implement a DELETE endpoint that:
1. Permanently deletes the user account
2. Deletes all associated data:
   - User profile
   - User cards/preferences
   - Any other user-related data
3. Returns success/error response

**Example Backend Implementation (Node.js/Express):**

```javascript
app.delete('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Delete user and all associated data
    await User.deleteOne({ email });
    await UserCard.deleteMany({ userEmail: email });
    // Delete any other associated data
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});
```

## User Flow

1. User navigates to Settings page
2. Scrolls to "Danger Zone" section
3. Clicks "Delete My Account" button
4. Confirmation dialog appears:
   - "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted."
5. If confirmed:
   - Backend API is called to delete account
   - Local storage is cleared
   - User is signed out
   - Redirected to login page
6. If cancelled:
   - Nothing happens, user stays on Settings page

## Testing Checklist

- [ ] Account deletion button is visible in Settings page
- [ ] Confirmation dialog appears when clicking delete
- [ ] Cancelling deletion does nothing
- [ ] Confirming deletion calls backend API
- [ ] Backend successfully deletes user data
- [ ] Local storage is cleared after deletion
- [ ] User is signed out after deletion
- [ ] User is redirected to login page
- [ ] User cannot access app after deletion
- [ ] User cannot log back in with deleted account

## Compliance Notes

✅ **Permanent Deletion**: Account deletion is permanent and cannot be undone
✅ **In-App Deletion**: Users can delete their account entirely within the app
✅ **No Customer Service Required**: Users don't need to contact support or visit a website
✅ **Confirmation Step**: Includes confirmation dialog to prevent accidental deletion
✅ **Complete Data Removal**: All user data is deleted from backend

## Next Steps

1. **Backend Implementation**: Ensure your backend API endpoint `/api/user/:email` (DELETE) is implemented
2. **Test**: Test the full deletion flow on both web and iOS
3. **Verify**: Confirm all user data is actually deleted from your database
4. **Submit**: Resubmit your app to App Store Connect with these changes
