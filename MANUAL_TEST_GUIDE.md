# Manual Test Guide: Authentication Flow

**Date**: November 4, 2025  
**Feature**: Member Login & Protected Routes

## Prerequisites

1. ✅ Backend server running on `http://localhost:3000`
2. ✅ Frontend server running on `http://localhost:5173`
3. ✅ Database seeded with test users

### Quick Verification

**Backend Health Check:**

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok",...}
```

**Backend Login Test:**

```powershell
$body = @{email='admin@singburi-adventist.org'; password='Admin123!'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method Post -Body $body -ContentType 'application/json'
# Should return: accessToken, refreshToken, member object
```

**Frontend Access:**

- Open `http://localhost:5173` in browser
- Should see landing page

## Test Credentials

Use these credentials from seeded database:

**Admin User:**

- **Email**: `admin@singburi-adventist.org`
- **Password**: `Admin123!`

**Staff User:**

- **Email**: `staff@singburi-adventist.org`
- **Password**: `Staff123!`

**Regular Members:**

- **Email**: `john.doe@example.com` / **Password**: `Member123!`
- **Email**: `jane.smith@example.com` / **Password**: `Member123!`
- **Email**: `peter.pan@example.com` / **Password**: `Member123!`

---

## Test 1: Login Page Display

**Steps:**

1. Open browser to `http://localhost:5173/login`
2. Verify page displays:
   - ✅ Login heading
   - ✅ Email input field
   - ✅ Password input field
   - ✅ Sign In button
   - ✅ "Forgot Password?" link

**Expected Result**: All elements visible and styled correctly

---

## Test 2: Form Validation

**Steps:**

1. On login page, click "Sign In" without entering credentials
2. Observe validation messages

**Expected Result**: Browser shows "required" validation or custom error messages

---

## Test 3: Invalid Credentials

**Steps:**

1. Enter email: `wrong@example.com`
2. Enter password: `WrongPassword123!`
3. Click "Sign In"

**Expected Results:**

- ✅ Error message displays: "Invalid credentials"
- ✅ Stays on login page
- ✅ No tokens in localStorage
- ✅ Form fields remain filled (for UX)

---

## Test 4: Successful Login

**Steps:**

1. Enter email: `admin@singburi.org`
2. Enter password: `Admin123!`
3. Click "Sign In"

**Expected Results:**

- ✅ Redirects to `/dashboard`
- ✅ No error messages
- ✅ Tokens stored in localStorage:
  - Open DevTools → Application → Local Storage
  - Verify `accessToken` exists
  - Verify `refreshToken` exists
  - Verify `user` object exists with email, firstName, lastName, role

---

## Test 5: Protected Routes (Authenticated)

**Steps:**

1. After successful login (from Test 4)
2. Navigate to these URLs:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/events`
   - `http://localhost:5173/announcements`
   - `http://localhost:5173/profile`

**Expected Results:**

- ✅ All pages load without redirect
- ✅ No redirect to login page
- ✅ User remains authenticated

---

## Test 6: Protected Routes (Not Authenticated)

**Steps:**

1. Clear localStorage (DevTools → Application → Local Storage → Clear All)
2. Navigate to `http://localhost:5173/dashboard`

**Expected Results:**

- ✅ Immediately redirects to `/login`
- ✅ No access to dashboard content

---

## Test 7: Public Route Redirect (Already Authenticated)

**Steps:**

1. Ensure logged in (tokens in localStorage)
2. Navigate to `http://localhost:5173/login`

**Expected Results:**

- ✅ Immediately redirects to `/dashboard`
- ✅ Cannot access login page while authenticated

---

## Test 8: Logout (If Implemented)

**Steps:**

1. While logged in, look for logout button (navigation or user menu)
2. Click logout

**Expected Results:**

- ✅ Redirects to `/login`
- ✅ Tokens removed from localStorage
- ✅ Accessing `/dashboard` redirects to `/login`

**Note**: If logout button is not visible, this is expected as we haven't added navigation yet.

---

## Test 9: Session Persistence

**Steps:**

1. Login successfully
2. Close browser tab
3. Open new tab to `http://localhost:5173/dashboard`

**Expected Results:**

- ✅ Dashboard loads immediately
- ✅ No redirect to login
- ✅ User remains authenticated

---

## Test 10: Account Lockout (Optional)

**Note**: This test requires creating a test user. Skip if you don't want to lock an account.

**Steps:**

1. Create test user or use non-admin account
2. Enter correct email but wrong password
3. Repeat 5 times
4. On 6th attempt, enter correct password

**Expected Results:**

- ✅ After 5 failed attempts, shows "Account is locked" message
- ✅ Returns 423 status
- ✅ Message shows time remaining (15 minutes)
- ✅ Cannot login even with correct password

---

## Browser DevTools Checks

### Network Tab

1. Open DevTools → Network
2. Perform login
3. Check requests:
   - ✅ POST to `/api/v1/auth/login`
   - ✅ Status: 200 OK
   - ✅ Response contains: `accessToken`, `refreshToken`, `member`
   - ✅ No password in response

### Console Tab

- ✅ No error messages
- ✅ No console warnings

### Application Tab

After successful login, check Local Storage:

```
accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (JWT)
refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (JWT)
user: {"id":"...","email":"admin@singburi.org","firstName":"Admin",...}
```

---

## Success Criteria

All tests should pass:

- ✅ Login page displays correctly
- ✅ Form validation works
- ✅ Invalid credentials show error
- ✅ Valid credentials log in successfully
- ✅ Protected routes require authentication
- ✅ Public routes redirect when authenticated
- ✅ Tokens stored correctly
- ✅ Session persists across page reloads

---

## Troubleshooting

### Issue: "Cannot connect to backend"

- Verify backend is running on port 3000
- Check backend terminal for errors
- Test: `curl http://localhost:3000/health`

### Issue: "CORS error"

- Check backend CORS configuration
- Verify frontend URL is in allowed origins

### Issue: "Tokens not stored"

- Check browser console for errors
- Verify AuthContext is wrapped around App
- Check authService implementation

### Issue: "Infinite redirect loop"

- Clear localStorage
- Check AuthContext loading states
- Verify PrivateRoute/PublicRoute logic

---

## Next Steps After Testing

Once all manual tests pass:

1. ✅ Document any issues found
2. ✅ Fix any bugs discovered
3. ✅ Consider adding logout button to navigation
4. ✅ Move on to password reset implementation
5. ✅ Continue with dashboard features
