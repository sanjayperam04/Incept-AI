# Duration Validation Feature

## Overview
The app now prompts users to specify a project timeline if they don't include one in their initial request.

## How It Works

### Detection Logic
The system checks if the user's message includes duration indicators:
- Numbers with time units: "2 weeks", "30 days", "3 months"
- "in X" format: "in 2 weeks", "in 45 days"
- Keywords: "timeline", "duration", "deadline"

### User Flow

**Scenario 1: User includes timeline** ✅
```
User: "Build an e-commerce platform in 6 weeks"
AI: "Received. Creating a comprehensive plan for your project..."
→ Generates plan immediately
```

**Scenario 2: User forgets timeline** ⚠️
```
User: "I want to create an e-commerce platform"
AI: "Got it! You want to create: 'I want to create an e-commerce platform'

How much time do you have for this project?

Please specify a timeline, for example:
• "2 weeks"
• "30 days"  
• "3 months"
• "in 45 days"
```

User: "2 months"
AI: "Received. Creating a comprehensive plan for your project..."
→ Generates plan with both messages as context

## Implementation Details

### Frontend Changes (`PlannerApp.jsx`)

1. **Duration Detection Regex**
   ```javascript
   const hasDuration = 
     /\d+\s*(day|days|week|weeks|month|months|year|years)/i.test(content) ||
     /in\s+\d+/i.test(content) ||
     lowerContent.includes('timeline') ||
     lowerContent.includes('duration') ||
     lowerContent.includes('deadline')
   ```

2. **New Project Detection**
   ```javascript
   const isNewProject = !projectPlan && messages.length <= 2
   ```

3. **Early Return for Missing Duration**
   - Asks for timeline before calling API
   - Prevents unnecessary API calls
   - Provides helpful examples

### Updated Welcome Message
The initial assistant message now emphasizes the need for a timeline:
```
Welcome to Incept AI! 👋

Describe your project and I'll create a comprehensive plan for you.

Please include:
• What you want to build
• Timeline (e.g., "2 weeks", "30 days")
• Key features or tasks

Example: "Build a portfolio website in 2 weeks with design, frontend, and deployment"
```

## Benefits

1. **Better Data Quality**: Ensures all projects have realistic timelines
2. **Improved UX**: Clear guidance prevents confusion
3. **Reduced Errors**: Fewer failed plan generations
4. **Cost Savings**: Avoids unnecessary API calls when info is incomplete

## Testing

### Test Cases

**Test 1: No duration mentioned**
```
Input: "Create a mobile app"
Expected: Asks for timeline
```

**Test 2: Duration in weeks**
```
Input: "Create a mobile app in 4 weeks"
Expected: Generates plan immediately
```

**Test 3: Duration in days**
```
Input: "Build website in 14 days"
Expected: Generates plan immediately
```

**Test 4: "in X" format**
```
Input: "Launch marketing campaign in 2 months"
Expected: Generates plan immediately
```

**Test 5: Modification (should skip validation)**
```
Input: "make backend development 5 days"
Expected: Updates existing plan (no duration check)
```
