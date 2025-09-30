/**
 * Hardcoded placeholder templates for workout and meal plans
 * Used when custom AI-generated plans are not yet available
 */

export interface PlaceholderExercise {
  id: string;
  name: string;
  completed: boolean;
  xp: number;
}

export interface PlaceholderWorkoutSection {
  id: string;
  name: string;
  exercises: PlaceholderExercise[];
  icon: string;
}

export interface PlaceholderMeal {
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
  icon: string;
  completed: boolean;
}

export interface PlaceholderMealPlan {
  breakfast: PlaceholderMeal;
  lunch: PlaceholderMeal;
  dinner: PlaceholderMeal;
  snacks: PlaceholderMeal;
}

// Beginner-friendly workout templates
export const PLACEHOLDER_WORKOUT_TEMPLATES: PlaceholderWorkoutSection[][] = [
  // Template 1: Full Body Beginner
  [
    {
      id: 'beginner_fullbody_1',
      name: 'Full Body Beginner Workout',
      icon: '/gym.png',
      exercises: [
        {
          id: 'warmup_1',
          name: 'Warm-up: 5-minute brisk walk or marching in place',
          completed: false,
          xp: 10
        },
        {
          id: 'warmup_2', 
          name: 'Warm-up: Arm circles - 10 forward, 10 backward',
          completed: false,
          xp: 10
        },
        {
          id: 'main_1',
          name: 'Bodyweight Squats - 2 sets x 8-12 reps',
          completed: false,
          xp: 20
        },
        {
          id: 'main_2',
          name: 'Wall Push-ups - 2 sets x 5-10 reps',
          completed: false,
          xp: 20
        },
        {
          id: 'main_3',
          name: 'Modified Plank - 2 sets x 15-30 seconds',
          completed: false,
          xp: 20
        },
        {
          id: 'main_4',
          name: 'Standing Marching - 2 sets x 20 steps',
          completed: false,
          xp: 20
        },
        {
          id: 'cooldown_1',
          name: 'Cool-down: Gentle stretching - 5 minutes',
          completed: false,
          xp: 5
        }
      ]
    }
  ],
  
  // Template 2: Upper Body Focus
  [
    {
      id: 'upper_body_1',
      name: 'Upper Body Strength',
      icon: '/gym.png',
      exercises: [
        {
          id: 'warmup_1',
          name: 'Warm-up: Shoulder rolls - 10 each direction',
          completed: false,
          xp: 10
        },
        {
          id: 'warmup_2',
          name: 'Warm-up: Arm swings - 10 each arm',
          completed: false,
          xp: 10
        },
        {
          id: 'main_1',
          name: 'Wall Push-ups - 3 sets x 8-12 reps',
          completed: false,
          xp: 25
        },
        {
          id: 'main_2',
          name: 'Chair Dips - 2 sets x 5-8 reps',
          completed: false,
          xp: 20
        },
        {
          id: 'main_3',
          name: 'Arm Raises - 2 sets x 10 reps each direction',
          completed: false,
          xp: 15
        },
        {
          id: 'main_4',
          name: 'Modified Plank - 2 sets x 20-45 seconds',
          completed: false,
          xp: 25
        },
        {
          id: 'cooldown_1',
          name: 'Cool-down: Upper body stretches - 5 minutes',
          completed: false,
          xp: 5
        }
      ]
    }
  ],

  // Template 3: Lower Body Focus  
  [
    {
      id: 'lower_body_1',
      name: 'Lower Body Strength',
      icon: '/gym.png',
      exercises: [
        {
          id: 'warmup_1',
          name: 'Warm-up: Leg swings - 10 each leg',
          completed: false,
          xp: 10
        },
        {
          id: 'warmup_2',
          name: 'Warm-up: Ankle circles - 10 each direction',
          completed: false,
          xp: 10
        },
        {
          id: 'main_1',
          name: 'Bodyweight Squats - 3 sets x 10-15 reps',
          completed: false,
          xp: 25
        },
        {
          id: 'main_2',
          name: 'Lunges - 2 sets x 6-10 each leg',
          completed: false,
          xp: 25
        },
        {
          id: 'main_3',
          name: 'Calf Raises - 2 sets x 12-15 reps',
          completed: false,
          xp: 15
        },
        {
          id: 'main_4',
          name: 'Wall Sit - 2 sets x 15-30 seconds',
          completed: false,
          xp: 20
        },
        {
          id: 'cooldown_1',
          name: 'Cool-down: Lower body stretches - 5 minutes',
          completed: false,
          xp: 5
        }
      ]
    }
  ],

  // Template 4: Cardio & Core
  [
    {
      id: 'cardio_core_1',
      name: 'Cardio & Core Workout',
      icon: '/gym.png',
      exercises: [
        {
          id: 'warmup_1',
          name: 'Warm-up: Marching in place - 3 minutes',
          completed: false,
          xp: 15
        },
        {
          id: 'main_1',
          name: 'Step-ups (using stairs/sturdy surface) - 2 sets x 10 each leg',
          completed: false,
          xp: 20
        },
        {
          id: 'main_2',
          name: 'Modified Jumping Jacks - 2 sets x 15-20 reps',
          completed: false,
          xp: 20
        },
        {
          id: 'main_3',
          name: 'Standing Knee Raises - 2 sets x 10 each leg',
          completed: false,
          xp: 15
        },
        {
          id: 'main_4',
          name: 'Modified Plank - 2 sets x 20-45 seconds',
          completed: false,
          xp: 25
        },
        {
          id: 'main_5',
          name: 'Standing Side Bends - 2 sets x 10 each side',
          completed: false,
          xp: 15
        },
        {
          id: 'cooldown_1',
          name: 'Cool-down: Walking and stretching - 5 minutes',
          completed: false,
          xp: 5
        }
      ]
    }
  ]
];

// Balanced, healthy meal templates
export const PLACEHOLDER_MEAL_TEMPLATES: PlaceholderMealPlan[] = [
  // Template 1: Balanced Day
  {
    breakfast: {
      name: 'Overnight Oats with Berries',
      calories: 320,
      protein: '12g',
      carbs: '45g', 
      fat: '8g',
      ingredients: [
        '1/2 cup rolled oats',
        '1/2 cup milk of choice',
        '1 tbsp chia seeds',
        '1/2 cup mixed berries',
        '1 tsp honey'
      ],
      icon: '/salad.png',
      completed: false
    },
    lunch: {
      name: 'Mediterranean Wrap',
      calories: 420,
      protein: '18g',
      carbs: '38g',
      fat: '22g', 
      ingredients: [
        '1 whole wheat tortilla',
        '3 oz grilled chicken',
        '2 tbsp hummus',
        'Mixed greens',
        'Cucumber, tomato, red onion',
        '2 tbsp feta cheese'
      ],
      icon: '/salad.png',
      completed: false
    },
    dinner: {
      name: 'Baked Salmon with Quinoa',
      calories: 480,
      protein: '35g',
      carbs: '32g',
      fat: '20g',
      ingredients: [
        '4 oz salmon fillet',
        '1/2 cup cooked quinoa',
        '1 cup steamed broccoli',
        '1 tsp olive oil',
        'Lemon and herbs'
      ],
      icon: '/salad.png',
      completed: false
    },
    snacks: {
      name: 'Apple with Almond Butter',
      calories: 180,
      protein: '6g',
      carbs: '20g',
      fat: '10g',
      ingredients: [
        '1 medium apple',
        '1 tbsp almond butter'
      ],
      icon: '/salad.png',
      completed: false
    }
  },

  // Template 2: High Protein Day
  {
    breakfast: {
      name: 'Greek Yogurt Parfait',
      calories: 350,
      protein: '20g',
      carbs: '35g',
      fat: '12g',
      ingredients: [
        '1 cup Greek yogurt',
        '1/4 cup granola',
        '1/2 cup mixed berries',
        '1 tbsp chopped nuts',
        '1 tsp honey'
      ],
      icon: '/salad.png',
      completed: false
    },
    lunch: {
      name: 'Protein Power Bowl',
      calories: 450,
      protein: '28g',
      carbs: '35g',
      fat: '18g',
      ingredients: [
        '4 oz grilled chicken breast',
        '1/2 cup brown rice',
        '1/2 cup black beans',
        'Mixed vegetables',
        '1/4 avocado',
        '2 tbsp salsa'
      ],
      icon: '/salad.png',
      completed: false
    },
    dinner: {
      name: 'Turkey Meatballs with Zucchini Noodles',
      calories: 380,
      protein: '32g',
      carbs: '15g',
      fat: '22g',
      ingredients: [
        '4 oz lean ground turkey meatballs',
        '2 cups spiralized zucchini',
        '1/2 cup marinara sauce',
        '2 tbsp parmesan cheese',
        '1 tsp olive oil'
      ],
      icon: '/salad.png',
      completed: false
    },
    snacks: {
      name: 'Protein Smoothie',
      calories: 220,
      protein: '25g',
      carbs: '18g',
      fat: '6g',
      ingredients: [
        '1 scoop protein powder',
        '1 cup unsweetened almond milk',
        '1/2 banana',
        '1 cup spinach',
        '1 tbsp peanut butter'
      ],
      icon: '/salad.png',
      completed: false
    }
  },

  // Template 3: Plant-Based Day
  {
    breakfast: {
      name: 'Avocado Toast with Hemp Seeds',
      calories: 340,
      protein: '12g',
      carbs: '28g',
      fat: '20g',
      ingredients: [
        '2 slices whole grain bread',
        '1/2 avocado',
        '1 tbsp hemp seeds',
        'Cherry tomatoes',
        'Salt, pepper, lemon juice'
      ],
      icon: '/salad.png',
      completed: false
    },
    lunch: {
      name: 'Quinoa Buddha Bowl',
      calories: 420,
      protein: '16g',
      carbs: '52g',
      fat: '16g',
      ingredients: [
        '3/4 cup cooked quinoa',
        '1/2 cup chickpeas',
        'Mixed roasted vegetables',
        '2 tbsp tahini dressing',
        '1 tbsp pumpkin seeds'
      ],
      icon: '/salad.png',
      completed: false
    },
    dinner: {
      name: 'Lentil Curry with Brown Rice',
      calories: 400,
      protein: '18g',
      carbs: '58g',
      fat: '12g',
      ingredients: [
        '3/4 cup cooked lentils',
        '1/2 cup brown rice',
        'Coconut curry sauce',
        'Mixed vegetables',
        'Fresh cilantro'
      ],
      icon: '/salad.png',
      completed: false
    },
    snacks: {
      name: 'Trail Mix',
      calories: 200,
      protein: '8g',
      carbs: '16g',
      fat: '14g',
      ingredients: [
        '1/4 cup mixed nuts',
        '2 tbsp dried fruit',
        '1 tbsp dark chocolate chips'
      ],
      icon: '/salad.png',
      completed: false
    }
  },

  // Template 4: Comfort Food (Healthier Versions)
  {
    breakfast: {
      name: 'Whole Grain Pancakes with Fruit',
      calories: 380,
      protein: '14g',
      carbs: '55g',
      fat: '12g',
      ingredients: [
        '2 small whole grain pancakes',
        '1 cup fresh berries',
        '2 tbsp pure maple syrup',
        '1 tbsp chopped walnuts',
        '1 tsp butter'
      ],
      icon: '/salad.png',
      completed: false
    },
    lunch: {
      name: 'Turkey and Veggie Sandwich',
      calories: 390,
      protein: '22g',
      carbs: '42g',
      fat: '14g',
      ingredients: [
        '2 slices whole grain bread',
        '3 oz sliced turkey',
        '1 slice cheese',
        'Lettuce, tomato, cucumber',
        '1 tbsp avocado spread'
      ],
      icon: '/salad.png',
      completed: false
    },
    dinner: {
      name: 'Baked Sweet Potato with Black Bean Chili',
      calories: 450,
      protein: '16g',
      carbs: '72g',
      fat: '12g',
      ingredients: [
        '1 large baked sweet potato',
        '3/4 cup black bean chili',
        '2 tbsp Greek yogurt',
        '1 tbsp shredded cheese',
        'Green onions'
      ],
      icon: '/salad.png',
      completed: false
    },
    snacks: {
      name: 'Homemade Energy Balls',
      calories: 160,
      protein: '6g',
      carbs: '18g',
      fat: '8g',
      ingredients: [
        '2 energy balls made with',
        'Oats, dates, nut butter',
        'Chia seeds, vanilla'
      ],
      icon: '/salad.png',
      completed: false
    }
  }
];

/**
 * Get a random workout template with error handling
 */
export function getRandomWorkoutTemplate(): PlaceholderWorkoutSection[] {
  try {
    // Validate that templates exist and are not empty
    if (!PLACEHOLDER_WORKOUT_TEMPLATES || !Array.isArray(PLACEHOLDER_WORKOUT_TEMPLATES) || PLACEHOLDER_WORKOUT_TEMPLATES.length === 0) {
      throw new Error('Workout templates are not available or empty');
    }

    // Validate template structure
    for (let i = 0; i < PLACEHOLDER_WORKOUT_TEMPLATES.length; i++) {
      const template = PLACEHOLDER_WORKOUT_TEMPLATES[i];
      if (!template || !Array.isArray(template) || template.length === 0) {
        console.warn(`Workout template at index ${i} is invalid, skipping`);
        continue;
      }
      
      // Validate each section in the template
      for (const section of template) {
        if (!section || typeof section !== 'object' || !section.id || !section.name || !Array.isArray(section.exercises)) {
          throw new Error(`Invalid workout section structure in template ${i}`);
        }
      }
    }

    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_WORKOUT_TEMPLATES.length);
    const selectedTemplate = PLACEHOLDER_WORKOUT_TEMPLATES[randomIndex];
    
    // Deep clone to avoid mutations
    return JSON.parse(JSON.stringify(selectedTemplate));
  } catch (error) {
    console.error('Error loading workout template:', error);
    throw new Error(`Failed to load workout template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a random meal template with error handling
 */
export function getRandomMealTemplate(): PlaceholderMealPlan {
  try {
    // Validate that templates exist and are not empty
    if (!PLACEHOLDER_MEAL_TEMPLATES || !Array.isArray(PLACEHOLDER_MEAL_TEMPLATES) || PLACEHOLDER_MEAL_TEMPLATES.length === 0) {
      throw new Error('Meal templates are not available or empty');
    }

    // Validate template structure
    for (let i = 0; i < PLACEHOLDER_MEAL_TEMPLATES.length; i++) {
      const template = PLACEHOLDER_MEAL_TEMPLATES[i];
      if (!template || typeof template !== 'object') {
        console.warn(`Meal template at index ${i} is invalid, skipping`);
        continue;
      }
      
      // Validate each meal type in the template
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
      for (const mealType of mealTypes) {
        const meal = template[mealType];
        if (!meal || typeof meal !== 'object' || !meal.name || typeof meal.calories !== 'number') {
          throw new Error(`Invalid ${mealType} structure in meal template ${i}`);
        }
      }
    }

    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_MEAL_TEMPLATES.length);
    const selectedTemplate = PLACEHOLDER_MEAL_TEMPLATES[randomIndex];
    
    // Deep clone to avoid mutations
    return JSON.parse(JSON.stringify(selectedTemplate));
  } catch (error) {
    console.error('Error loading meal template:', error);
    throw new Error(`Failed to load meal template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}