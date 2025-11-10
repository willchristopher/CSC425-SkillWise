# 🧪 SkillWise Testing Guide

## Quick Start Testing

### Prerequisites
Both servers should be running:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Database**: PostgreSQL on port 5433

---

## 🎯 Test Scenario 1: New User Journey

### Step 1: Register
1. Go to http://localhost:3000/register
2. Create account:
   - Email: `test@example.com`
   - Password: `Password123`
   - Name: `Test User`
3. Click **Register**
4. ✅ Should redirect to login

### Step 2: Login
1. Enter credentials
2. Click **Login**
3. ✅ Should redirect to Dashboard

### Step 3: Empty Dashboard
1. View the Dashboard
2. ✅ Should see:
   - "No goals yet" message
   - Stats showing 0 goals
   - AI Learning Assistant section
   - NO dummy/fake data

### Step 4: Create First Goal
1. Click **Goals** in navigation
2. ✅ Should see empty state
3. Click **"Create Your First Goal"** or **"+ Create New Goal"**
4. Fill in form:
   ```
   Title: Learn React Hooks
   Description: Master useState, useEffect, and custom hooks
   Category: Web Development
   Difficulty: Medium
   Target Date: (30 days from now)
   ```
5. Click **Create Goal**
6. ✅ Should see new goal card appear

### Step 5: Test AI Features
1. Find your "Learn React Hooks" goal
2. Click **"🤖 Get AI Questions"**
3. Wait for AI to generate (2-5 seconds)
4. ✅ Should see modal with:
   - 5 practice questions
   - "Powered by Gemini AI" header
   - Personalized to React Hooks
5. Click **"🔄 Generate New Questions"**
6. ✅ Should get different questions

### Step 6: Update Progress
1. Click **"Update Progress"**
2. Enter `25`
3. Click OK
4. ✅ Progress bar should update to 25%

### Step 7: Check Dashboard
1. Navigate back to **Dashboard**
2. ✅ Should now show:
   - Total Goals: 1
   - Active Goals: 1
   - Completed: 0
   - Average Progress: 25%
   - Your "Learn React Hooks" goal in the list

---

## 🎯 Test Scenario 2: Multiple Goals

### Create More Goals
```
Goal 2:
- Title: Python Data Analysis
- Category: Data Science
- Difficulty: Hard

Goal 3:
- Title: UI/UX Design Principles
- Category: Design  
- Difficulty: Easy

Goal 4:
- Title: Master Git Commands
- Category: DevOps
- Difficulty: Medium
```

### Update Progress
- Set Python Data Analysis to 60%
- Set UI/UX Design to 100%
- Set Git Commands to 40%

### Expected Results
✅ Dashboard should show:
- Total Goals: 4
- Active Goals: 3
- Completed: 1
- Average Progress: ~56%

✅ Goals page should show:
- Grid of 4 goal cards
- Different difficulty badges (easy/medium/hard)
- Status badges (active/completed)
- Accurate progress bars

---

## 🎯 Test Scenario 3: AI Question Quality

### Test Different Categories

1. **Programming Goal**
   ```
   Title: Learn JavaScript Async/Await
   Category: Programming
   Difficulty: Medium
   ```
   - Generate questions
   - ✅ Should ask about promises, async functions, error handling

2. **Data Science Goal**
   ```
   Title: Statistical Analysis with Python
   Category: Data Science
   Difficulty: Hard
   ```
   - Generate questions
   - ✅ Should ask about statistics, pandas, data analysis

3. **Design Goal**
   ```
   Title: Color Theory Basics
   Category: Design
   Difficulty: Easy
   ```
   - Generate questions
   - ✅ Should ask about color palettes, contrast, accessibility

---

## 🎯 Test Scenario 4: CRUD Operations

### Create
1. Create a goal "Test CRUD Operations"
2. ✅ Should appear immediately in list

### Read
1. Refresh page
2. ✅ Goal should still be there (persisted in DB)

### Update
1. Update progress to 75%
2. ✅ Progress bar should reflect change
3. Refresh page
4. ✅ Progress should still be 75%

### Delete
1. Click trash icon
2. Confirm deletion
3. ✅ Goal should disappear
4. ✅ Dashboard stats should update

---

## 🎯 Test Scenario 5: Empty States

### Test 1: No Goals
1. Delete all goals
2. Visit Goals page
3. ✅ Should see:
   - 🎯 icon
   - "No goals yet" heading
   - "Create Your First Goal" button

### Test 2: Dashboard Empty
1. With no goals
2. Visit Dashboard
3. ✅ Should see:
   - All stats showing 0
   - "No goals yet" message
   - AI Learning Assistant section
   - NO fake data

---

## 🎯 Test Scenario 6: Error Handling

### Test Invalid Progress
1. Update progress
2. Enter "abc" or "150"
3. ✅ Should show error "Please enter a number between 0 and 100"

### Test Empty Title
1. Try to create goal without title
2. ✅ Form should require title (HTML5 validation)

### Test Network Error
1. Stop backend server
2. Try to create goal
3. ✅ Should show error message

---

## 🎯 Test Scenario 7: UI/UX

### Responsive Design
1. Resize browser window
2. ✅ Layout should adapt
3. ✅ Goal grid should stack on mobile

### Loading States
1. Create goal
2. ✅ Should show brief loading state
3. Generate AI questions
4. ✅ Should show "Generating..." while waiting

### Hover Effects
1. Hover over "Create Goal" button
2. ✅ Should have gradient shift
3. Hover over goal cards
4. ✅ Should have shadow increase

---

## 📊 Expected Data Flow

### Goal Creation Flow
```
Frontend Form Submission
    ↓
apiService.goals.create(formData)
    ↓
POST /api/goals
    ↓
goalController.createGoal
    ↓
goalService.createGoal
    ↓
PostgreSQL INSERT
    ↓
Return new goal
    ↓
Update frontend state
    ↓
Goal appears in list
```

### AI Question Flow
```
Click "Get AI Questions"
    ↓
apiService.ai.generatePracticeQuestions(goal)
    ↓
POST /api/ai/practice-questions
    ↓
aiController.generatePracticeQuestions
    ↓
aiService.generatePracticeQuestions
    ↓
Google Gemini API call
    ↓
Return questions
    ↓
Display in modal
```

---

## ✅ Checklist: What to Verify

### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Token refresh works (test by waiting 15+ minutes)

### Goals CRUD
- [ ] Can create goals
- [ ] Goals persist after refresh
- [ ] Can update progress
- [ ] Can delete goals
- [ ] Deleted goals disappear from dashboard

### AI Features
- [ ] Questions generate successfully
- [ ] Questions are relevant to goal
- [ ] Difficulty matches (harder questions for hard goals)
- [ ] Can regenerate new questions
- [ ] Loading states work

### Dashboard
- [ ] Shows correct statistics
- [ ] No dummy data for new users
- [ ] Updates when goals change
- [ ] Empty state displays properly
- [ ] Progress bars accurate

### Goals Page
- [ ] Empty state for no goals
- [ ] Grid layout displays properly
- [ ] All badges show correctly
- [ ] Modals open and close
- [ ] Forms validate

### UI/UX
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Confirmations work

---

## 🐛 Known Issues (None Currently!)

No known bugs at this time. If you find any, document them here.

---

## 📝 Testing Notes

### Good Test Data Examples

**Easy Goal:**
```
Title: Learn HTML Basics
Description: Understand tags, attributes, and document structure
Category: Web Development
Difficulty: Easy
```

**Medium Goal:**
```
Title: REST API Development
Description: Build RESTful APIs with Node.js and Express
Category: Programming
Difficulty: Medium
```

**Hard Goal:**
```
Title: Machine Learning Algorithms
Description: Implement ML algorithms from scratch
Category: Data Science
Difficulty: Hard
```

---

## 🎉 Success Criteria

### Your implementation is working if:

1. ✅ New users see empty states (no fake data)
2. ✅ Goals can be created and appear immediately
3. ✅ AI generates relevant practice questions
4. ✅ Progress updates and persists
5. ✅ Dashboard shows accurate statistics
6. ✅ All CRUD operations work
7. ✅ No console errors
8. ✅ UI looks professional and responsive

---

## 🚀 Next Steps After Testing

Once basic testing passes:
1. Create 3-5 real goals you want to learn
2. Use AI questions to actually study
3. Track progress over time
4. Identify any UX improvements needed
5. Move on to implementing Challenges page

---

## 💡 Pro Tips

- Use Chrome DevTools Network tab to see API calls
- Check browser console for any errors
- Use React DevTools to inspect component state
- Check backend terminal for server logs
- Use PostgreSQL client to verify database entries

---

**Happy Testing! 🧪**
