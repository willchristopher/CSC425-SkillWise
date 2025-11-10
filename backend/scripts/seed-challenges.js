const pool = require('../src/database/connection');

const challenges = [
  {
    title: 'Two Sum Problem',
    description: 'Given an array of integers and a target sum, return indices of the two numbers that add up to the target.',
    difficulty: 'easy',
    category: 'algorithms',
    timeEstimate: '30 mins',
    points: 100,
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
  },
  {
    title: 'Reverse a String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    difficulty: 'easy',
    category: 'programming',
    timeEstimate: '15 mins',
    points: 50,
    starterCode: 'function reverseString(s) {\n  // Your code here\n}',
  },
  {
    title: 'Build a REST API',
    description: 'Create a RESTful API with Express.js that handles CRUD operations for a todo list.',
    difficulty: 'medium',
    category: 'web-development',
    timeEstimate: '2 hours',
    points: 300,
    starterCode: 'const express = require("express");\nconst app = express();\n\n// Your code here',
  },
  {
    title: 'Binary Search Tree',
    description: 'Implement a Binary Search Tree with insert, search, and delete operations.',
    difficulty: 'medium',
    category: 'algorithms',
    timeEstimate: '90 mins',
    points: 250,
    starterCode: 'class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BST {\n  // Your code here\n}',
  },
  {
    title: 'SQL Query Optimization',
    description: 'Optimize a slow database query and explain your approach.',
    difficulty: 'hard',
    category: 'databases',
    timeEstimate: '2 hours',
    points: 400,
    starterCode: '-- Original Query\nSELECT * FROM users WHERE created_at > NOW() - INTERVAL \'30 days\';\n\n-- Your optimized query here',
  },
  {
    title: 'Responsive Landing Page',
    description: 'Create a responsive landing page using HTML, CSS, and JavaScript.',
    difficulty: 'easy',
    category: 'web-development',
    timeEstimate: '1 hour',
    points: 150,
    starterCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Landing Page</title>\n</head>\n<body>\n  <!-- Your code here -->\n</body>\n</html>',
  },
  {
    title: 'Implement Quick Sort',
    description: 'Implement the Quick Sort algorithm and analyze its time complexity.',
    difficulty: 'medium',
    category: 'algorithms',
    timeEstimate: '45 mins',
    points: 200,
    starterCode: 'function quickSort(arr) {\n  // Your code here\n}',
  },
  {
    title: 'React Todo App',
    description: 'Build a todo application using React with add, complete, and delete functionality.',
    difficulty: 'medium',
    category: 'web-development',
    timeEstimate: '3 hours',
    points: 350,
    starterCode: 'import React, { useState } from "react";\n\nfunction TodoApp() {\n  // Your code here\n}',
  },
  {
    title: 'Linked List Cycle Detection',
    description: 'Detect if a linked list has a cycle using Floyd\'s algorithm.',
    difficulty: 'medium',
    category: 'algorithms',
    timeEstimate: '30 mins',
    points: 200,
    starterCode: 'function hasCycle(head) {\n  // Your code here\n}',
  },
  {
    title: 'Database Normalization',
    description: 'Normalize a denormalized database schema to 3NF.',
    difficulty: 'hard',
    category: 'databases',
    timeEstimate: '90 mins',
    points: 350,
    starterCode: '-- Analyze this table and create normalized schema\nCREATE TABLE orders (\n  order_id INT,\n  customer_name VARCHAR(100),\n  customer_email VARCHAR(100),\n  product_name VARCHAR(100),\n  product_price DECIMAL\n);',
  },
];

async function seedChallenges() {
  try {
    console.log('🌱 Seeding challenges...');
    
    for (const challenge of challenges) {
      // Parse time estimate to minutes
      const timeInMinutes = challenge.timeEstimate.includes('hour') 
        ? parseInt(challenge.timeEstimate) * 60 
        : parseInt(challenge.timeEstimate);
      
      await pool.query(
        `INSERT INTO challenges (title, description, instructions, difficulty_level, category, estimated_time_minutes, points_reward)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [
          challenge.title,
          challenge.description,
          challenge.starterCode, // Use starter code as instructions
          challenge.difficulty,
          challenge.category,
          timeInMinutes || 30,
          challenge.points,
        ]
      );
    }
    
    const result = await pool.query('SELECT COUNT(*) FROM challenges');
    console.log(`✅ Successfully seeded challenges. Total: ${result.rows[0].count}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    process.exit(1);
  }
}

seedChallenges();
